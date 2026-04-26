# EdFlix - Family Physical Media Collection

A Netflix-style browsing experience for your family's physical media collection. Built with Next.js, Tailwind CSS, and the TMDB API.

![EdFlix](https://img.shields.io/badge/EdFlix-Physical%20Media-E50914?style=for-the-badge)

## Features

- **Netflix-style UI** — Dark theme with horizontal scrolling rows, hero banner, and detail modals
- **TMDB Integration** — Automatic movie posters, descriptions, ratings, cast info, and trailers
- **YouTube Trailers** — Embedded trailers play directly in the movie detail modal
- **Physical Media Tracking** — Track format (4K UHD, Blu-ray, DVD, VHS, Steelbook, etc.)
- **Availability Status** — Mark movies as available, checked out, or lent out
- **Location Tracking** — Know exactly where each disc lives (shelf, room, etc.)
- **Search & Filter** — Search by title, genre, tag, or format; filter by availability and media type
- **Category Rows** — Auto-organized by genre, format, recency, favorites, and location
- **Static Export** — Deploys to GitHub Pages with zero server costs

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Get a TMDB API Key (free)

1. Sign up at [themoviedb.org](https://www.themoviedb.org/signup)
2. Go to [API Settings](https://www.themoviedb.org/settings/api)
3. Request an API key (choose "Developer" → fill out the form)

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste your TMDB API key.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Managing Your Collection

Edit `src/data/collection.json` to add/remove/update movies. Each entry looks like:

```json
{
  "tmdbId": 155,
  "title": "The Dark Knight",
  "formats": ["4K UHD", "Blu-ray"],
  "location": "Living Room Shelf A",
  "status": "available",
  "checkedOutBy": null,
  "notes": "Steelbook edition",
  "dateAdded": "2023-01-15",
  "genre": ["Action", "Crime", "Drama"],
  "tags": ["favorites", "superhero"]
}
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `tmdbId` | Yes | TMDB movie ID (find it at themoviedb.org in the URL) |
| `title` | Yes | Movie title (for display when TMDB is unavailable) |
| `formats` | Yes | Array: `"4K UHD"`, `"Blu-ray"`, `"DVD"`, `"VHS"`, `"Steelbook"`, `"LaserDisc"`, `"HD DVD"` |
| `location` | No | Where the disc is stored |
| `status` | Yes | `"available"`, `"checked-out"`, or `"lent-out"` |
| `checkedOutBy` | No | Who has it (shown when checked out/lent) |
| `notes` | No | Any extra info (edition, condition, etc.) |
| `dateAdded` | No | Date added to collection (YYYY-MM-DD) |
| `genre` | No | Genres for row organization |
| `tags` | No | Custom tags like `"favorites"`, `"kids"`, `"classics"` |

### Finding TMDB IDs

1. Go to [themoviedb.org](https://www.themoviedb.org)
2. Search for your movie
3. The ID is in the URL: `https://www.themoviedb.org/movie/155-the-dark-knight` → ID is `155`

## Deploy to GitHub Pages

### 1. Update `next.config.mjs`

Set the base path to match your repo name:

```js
basePath: '/edflix',
```

Or set `NEXT_PUBLIC_BASE_PATH=/edflix` in your environment.

### 2. Build

```bash
npm run build
```

### 3. Push to GitHub

The static site is exported to the `out/` directory. You can use GitHub Actions or push `out/` to a `gh-pages` branch.

### GitHub Actions (recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_TMDB_API_KEY: ${{ secrets.TMDB_API_KEY }}
          NEXT_PUBLIC_BASE_PATH: /edflix
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Then add `TMDB_API_KEY` as a repository secret in GitHub Settings → Secrets.

## Tech Stack

- **Next.js 14** — React framework with static export
- **Tailwind CSS** — Utility-first styling
- **TMDB API** — Movie metadata and trailers
- **Lucide React** — Icons
- **TypeScript** — Type safety
