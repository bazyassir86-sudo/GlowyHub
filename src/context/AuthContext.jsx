import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ADMIN_EMAIL } from "../constants";
import { auth, db } from "../firebase/config";

const AuthContext = createContext(null);
const LOCAL_AUTH_KEY = "glowyhub_auth_user";
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");
googleProvider.setCustomParameters({
  prompt: "select_account"
});

function readLocalUser() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_AUTH_KEY) || "null");
  } catch (_error) {
    return null;
  }
}

function serializeUser(firebaseUser) {
  if (!firebaseUser) return null;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Player",
    photoURL: firebaseUser.photoURL || "",
    providerId: firebaseUser.providerData?.[0]?.providerId || "google.com"
  };
}

function saveUserInfo(firebaseUser) {
  const profile = serializeUser(firebaseUser);
  if (!profile) {
    localStorage.removeItem(LOCAL_AUTH_KEY);
    return null;
  }

  localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));

  setDoc(
    doc(db, "users", profile.uid),
    {
      ...profile,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  ).catch(() => {
    // Auth still succeeds even if Firestore profile rules have not been deployed yet.
  });

  return profile;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readLocalUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      const profile = saveUserInfo(currentUser);
      setUser(profile);
      setLoading(false);
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const profile = saveUserInfo(result.user);
    setUser(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    localStorage.removeItem(LOCAL_AUTH_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
      signInWithGoogle,
      logout
    }),
    [loading, logout, signInWithGoogle, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
