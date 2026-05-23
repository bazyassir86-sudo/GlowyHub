import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { DEMO_GAMES } from "../data/demoGames";
import { auth, db, isFirebaseConfigured } from "../firebase/config";
import { toTimestamp } from "../utils/format";
import { slugify } from "../utils/slugify";

const LOCAL_GAMES_KEY = "glowyhub_games";
const LOCAL_RATINGS_KEY = "glowyhub_ratings";
const FIRESTORE_TIMEOUT_MS = 30000;

function normalizeSnapshot(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}

function sortNewest(games) {
  return [...games].sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));
}

function readLocalGames() {
  const stored = localStorage.getItem(LOCAL_GAMES_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_GAMES_KEY, JSON.stringify(DEMO_GAMES));
    return DEMO_GAMES;
  }

  try {
    return JSON.parse(stored);
  } catch (_error) {
    localStorage.setItem(LOCAL_GAMES_KEY, JSON.stringify(DEMO_GAMES));
    return DEMO_GAMES;
  }
}

function writeLocalGames(games) {
  localStorage.setItem(LOCAL_GAMES_KEY, JSON.stringify(games));
}

function readLocalRatings() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_RATINGS_KEY) || "{}");
  } catch (_error) {
    return {};
  }
}

function writeLocalRatings(ratings) {
  localStorage.setItem(LOCAL_RATINGS_KEY, JSON.stringify(ratings));
}

function getErrorDetails(error) {
  const code = error?.code ? ` (${error.code})` : "";
  const message = error?.message || "Unknown error.";
  return `${code}: ${message}`;
}

function withTimeout(promise, timeoutMs, action) {
  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(`${action} timed out after ${Math.round(timeoutMs / 1000)} seconds.`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

function parseScreenshotUrls(value = "") {
  return value
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}

function getCurrentOwnerId() {
  if (!auth.currentUser?.uid) {
    throw new Error("Login is required to submit or edit games.");
  }

  return auth.currentUser.uid;
}

async function createUniqueSlug(title) {
  const baseSlug = slugify(title) || `game-${Date.now().toString(36)}`;

  if (!isFirebaseConfigured) {
    const exists = readLocalGames().some((game) => game.slug === baseSlug);
    return exists ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
  }

  try {
    const existing = await withTimeout(getDoc(doc(db, "games", baseSlug)), FIRESTORE_TIMEOUT_MS, "Firestore slug check");
    return existing.exists() ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
  } catch (error) {
    console.error("[GlowyHub upload] Firestore slug check failed", error);
    throw new Error(`Firestore slug check failed${getErrorDetails(error)}`);
  }
}

export async function getApprovedGames() {
  if (!isFirebaseConfigured) {
    return sortNewest(readLocalGames().filter((game) => game.status === "approved"));
  }

  const result = await getDocs(query(collection(db, "games"), where("status", "==", "approved")));
  return sortNewest(result.docs.map(normalizeSnapshot));
}

export async function getAllGames() {
  if (!isFirebaseConfigured) {
    return sortNewest(readLocalGames());
  }

  const result = await getDocs(collection(db, "games"));
  return sortNewest(result.docs.map(normalizeSnapshot));
}

export async function getGameBySlug(slug) {
  if (!isFirebaseConfigured) {
    return readLocalGames().find((game) => game.slug === slug) || null;
  }

  const result = await getDoc(doc(db, "games", slug));
  return result.exists() ? normalizeSnapshot(result) : null;
}

export async function createGame(payload, user) {
  const slug = await createUniqueSlug(payload.title);
  const ownerId = getCurrentOwnerId();
  const screenshots = parseScreenshotUrls(payload.screenshotsText);

  const game = {
    title: payload.title.trim(),
    slug,
    description: payload.description.trim(),
    category: payload.category,
    version: payload.version.trim(),
    size: payload.size.trim(),
    fileUrl: payload.fileUrl.trim(),
    coverUrl: payload.coverUrl.trim(),
    screenshots,
    status: "pending",
    featured: false,
    downloads: 0,
    ratingTotal: 0,
    ratingCount: 0,
    ownerId,
    createdBy: ownerId,
    createdByEmail: auth.currentUser?.email || user?.email || "",
    createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString(),
    updatedAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
  };

  if (!isFirebaseConfigured) {
    const localGame = {
      ...game,
      id: `local-${Date.now().toString(36)}`,
      coverUrl:
        game.coverUrl ||
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80"
    };
    writeLocalGames([localGame, ...readLocalGames()]);
    return localGame;
  }

  console.log("[GlowyHub upload] create firestore document");
  try {
    await withTimeout(setDoc(doc(db, "games", slug), game), FIRESTORE_TIMEOUT_MS, "Firestore create game document");
  } catch (error) {
    console.error("[GlowyHub upload] Firestore document create failed", error);
    throw new Error(`Firestore document create failed${getErrorDetails(error)}`);
  }

  return {
    id: slug,
    ...game
  };
}

export async function updateGame(gameId, payload) {
  const ownerId = getCurrentOwnerId();
  const screenshots = parseScreenshotUrls(payload.screenshotsText);
  const updates = {
    title: payload.title.trim(),
    description: payload.description.trim(),
    category: payload.category,
    version: payload.version.trim(),
    size: payload.size.trim(),
    fileUrl: payload.fileUrl.trim(),
    coverUrl: payload.coverUrl.trim(),
    screenshots,
    status: "pending",
    featured: false,
    updatedAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
  };

  if (!isFirebaseConfigured) {
    const games = readLocalGames();
    const existingGame = games.find((game) => game.id === gameId);
    if (!existingGame || existingGame.ownerId !== ownerId) {
      throw new Error("You can edit only your own games.");
    }

    const updatedGames = games.map((game) => (game.id === gameId ? { ...game, ...updates } : game));
    writeLocalGames(updatedGames);
    return updatedGames.find((game) => game.id === gameId);
  }

  try {
    await withTimeout(updateDoc(doc(db, "games", gameId), updates), FIRESTORE_TIMEOUT_MS, "Firestore update game document");
    const updated = await withTimeout(getDoc(doc(db, "games", gameId)), FIRESTORE_TIMEOUT_MS, "Firestore reload updated game");
    return updated.exists() ? normalizeSnapshot(updated) : null;
  } catch (error) {
    console.error("[GlowyHub upload] Firestore document update failed", error);
    throw new Error(`Firestore document update failed${getErrorDetails(error)}`);
  }
}

export async function incrementDownload(gameId) {
  if (!isFirebaseConfigured) {
    const games = readLocalGames().map((game) =>
      game.id === gameId ? { ...game, downloads: (game.downloads || 0) + 1 } : game
    );
    writeLocalGames(games);
    return games.find((game) => game.id === gameId);
  }

  await updateDoc(doc(db, "games", gameId), {
    downloads: increment(1),
    updatedAt: serverTimestamp()
  });
  const updated = await getDoc(doc(db, "games", gameId));
  return updated.exists() ? normalizeSnapshot(updated) : null;
}

export async function getUserRating(gameId, userId) {
  if (!userId) return 0;

  if (!isFirebaseConfigured) {
    const ratings = readLocalRatings();
    return ratings[`${gameId}:${userId}`] || 0;
  }

  const ratingDoc = await getDoc(doc(db, "games", gameId, "ratings", userId));
  return ratingDoc.exists() ? ratingDoc.data().rating : 0;
}

export async function rateGame(gameId, user, rating) {
  if (!user?.uid) {
    throw new Error("Login is required to rate games.");
  }

  if (!isFirebaseConfigured) {
    const ratings = readLocalRatings();
    const ratingKey = `${gameId}:${user.uid}`;
    const previousRating = ratings[ratingKey] || 0;

    const games = readLocalGames().map((game) => {
      if (game.id !== gameId) return game;
      const ratingCount = previousRating ? game.ratingCount || 0 : (game.ratingCount || 0) + 1;
      const ratingTotal = (game.ratingTotal || 0) - previousRating + rating;
      return { ...game, ratingCount, ratingTotal, updatedAt: new Date().toISOString() };
    });

    ratings[ratingKey] = rating;
    writeLocalRatings(ratings);
    writeLocalGames(games);
    return games.find((game) => game.id === gameId);
  }

  const gameRef = doc(db, "games", gameId);
  const ratingRef = doc(db, "games", gameId, "ratings", user.uid);

  await runTransaction(db, async (transaction) => {
    const gameSnapshot = await transaction.get(gameRef);
    if (!gameSnapshot.exists()) {
      throw new Error("Game not found.");
    }

    const ratingSnapshot = await transaction.get(ratingRef);
    const previousRating = ratingSnapshot.exists() ? ratingSnapshot.data().rating || 0 : 0;
    const game = gameSnapshot.data();
    const ratingCount = previousRating ? game.ratingCount || 0 : (game.ratingCount || 0) + 1;
    const ratingTotal = (game.ratingTotal || 0) - previousRating + rating;

    transaction.update(gameRef, {
      ratingCount,
      ratingTotal,
      updatedAt: serverTimestamp()
    });
    transaction.set(
      ratingRef,
      {
        rating,
        userId: user.uid,
        userEmail: user.email,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  });

  const updated = await getDoc(gameRef);
  return updated.exists() ? normalizeSnapshot(updated) : null;
}

export async function setGameStatus(gameId, status) {
  if (!isFirebaseConfigured) {
    const games = readLocalGames().map((game) =>
      game.id === gameId ? { ...game, status, updatedAt: new Date().toISOString() } : game
    );
    writeLocalGames(games);
    return games.find((game) => game.id === gameId);
  }

  await updateDoc(doc(db, "games", gameId), {
    status,
    updatedAt: serverTimestamp()
  });
}

export async function toggleFeatured(gameId, featured) {
  if (!isFirebaseConfigured) {
    const games = readLocalGames().map((game) =>
      game.id === gameId ? { ...game, featured, updatedAt: new Date().toISOString() } : game
    );
    writeLocalGames(games);
    return games.find((game) => game.id === gameId);
  }

  await updateDoc(doc(db, "games", gameId), {
    featured,
    updatedAt: serverTimestamp()
  });
}

export async function deleteGame(gameId) {
  if (!isFirebaseConfigured) {
    writeLocalGames(readLocalGames().filter((game) => game.id !== gameId));
    return;
  }

  await deleteDoc(doc(db, "games", gameId));
}

export async function seedApprovedGame(game) {
  if (!isFirebaseConfigured) return;

  await setDoc(doc(db, "games", game.slug || game.id), {
    ...game,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}
