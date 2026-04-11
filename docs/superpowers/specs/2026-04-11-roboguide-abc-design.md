# Roboguide — Bundles A + B + C Design

**Date:** 2026-04-11
**Scope:** Polish MVP, fix submit flow, add new features (bookmarks/comments/markdown/parts-picker/reverse-lookup/start-page).

## Goals

Take roboguide from "MVP 3" to "ready to share publicly" in one session, by:
1. Fixing broken/half-wired things that already exist (Bundle A)
2. Making content contribution actually pleasant (Bundle B)
3. Adding the features that make the site feel alive (Bundle C)

## Non-goals (explicitly deferred)

- Moderation queue (Bundle D)
- Dark mode
- Real tests — no test infra exists; verification = typecheck + build + manual smoke
- i18n

## Decisions (defaults)

- **Guides submit:** user-submittable via `/submit?type=guide`, published immediately. Admins retain edit/delete.
- **Bookmarks:** private, per-user, Firestore `users/{uid}/bookmarks/{entityType}_{id}`.
- **Comments:** flat, auth-gated, on guides & projects only. Firestore subcollection `comments` under parent doc. Plain text, 500 chars.
- **Markdown:** `react-markdown` + `remark-gfm` + `rehype-highlight` (light theme). Applied to component description, pinout, guide content, project description/content. Submit forms get preview tab.
- **Start page:** `/start` — three-card layout, linked from homepage hero.

## Architecture notes

- Firestore data access stays in `lib/firebase/*Service.ts` — add `bookmarkService.ts` and `commentService.ts`
- Markdown rendering: central `components/ui/Markdown.tsx` wrapper, imported everywhere
- Reverse lookup (projects using component X): query `projects` where `parts` array-contains-any registrySlug, done server-side in registryService
- Parts picker: client-side component `components/submit/PartPicker.tsx`, fetches lightweight component index via existing `getRegistryItems()`

## Phases

1. **A-polish** — clickable related components, clickable parts, URL-synced filters, alt fixes, pinout markdown via Markdown component (depends on phase 5), labels, focus rings, aria
2. **A-SEO** — dynamic metadata exports, sitemap route, robots.txt, OG
3. **B-polish** — draft autosave (localStorage), image preview, real-time slug check, inline validation, drag-drop
4. **B-guides** — add guide to `/submit` wizard, guideService writes from user, navbar/homepage link
5. **C-markdown** — install deps, Markdown component, wire in all content render sites
6. **C-parts-picker + reverse-lookup**
7. **C-bookmarks**
8. **C-comments**
9. **C-start-page**
10. **Final verify** — typecheck, build, smoke test all routes

## Commits

One per phase. Never push. Small, safe rollback points.

## Verification

- `npx tsc --noEmit` after each phase
- `npm run build` at the end
- Manual browser smoke test of touched routes via `npm run dev` in background
