# GlowyHub

GlowyHub is a modern React + Tailwind gaming platform inspired by simple game portals. It includes public game discovery, clean game URLs, uploads, auth, admin approvals, ratings, and download counters.

## Features

- Home page with latest games, top downloads, categories, and search
- Game details pages at `/games/game-name`
- Upload page for creator submissions with manual APK/ZIP and image links
- Admin panel for approving, rejecting, deleting, and featuring games
- Login and register with Firebase Google Sign-In
- Firestore game database with rating and download counters
- Firebase rules for admin-only moderation actions
- Dark neon responsive UI
- SEO meta helper, `robots.txt`, `sitemap.xml`, and Vercel rewrites

## Setup

1. Install dependencies:

```bash
npm install
```

2. Firebase is already pinned in `src/firebase/config.js` for the GlowyHub project.

3. Run locally:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

5. Deploy Firebase rules when your Firebase CLI is configured:

```bash
firebase deploy --only firestore:rules
```

## Admin Access

The admin email is defined in `src/constants.js`:

```js
export const ADMIN_EMAIL = "venomzaak@gmail.com";
```

Only that email can access `/admin`.

## Firebase Collections

`games` collection fields:

Document IDs use the game slug, so a game named `Neon Drift Rush` is stored as `games/neon-drift-rush` and opens at `/games/neon-drift-rush`.

- `title`
- `slug`
- `description`
- `category`
- `version`
- `size`
- `fileUrl`: manual APK/ZIP download URL from MediaFire, Google Drive, or another host
- `coverUrl`: external image URL
- `screenshots`: external image URLs stored as an array
- `status`: `pending`, `approved`, or `rejected`
- `featured`
- `downloads`
- `ratingTotal`
- `ratingCount`
- `createdBy`
- `createdByEmail`
- `createdAt`
- `updatedAt`

Ratings are stored under:

```txt
games/{gameId}/ratings/{userId}
```

## Notes

Firebase initialization always uses the pinned GlowyHub config in `src/firebase/config.js`.
