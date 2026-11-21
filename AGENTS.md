# Agent notes for keyhole-server

- Package manager: pnpm. `pnpm check` = lint + typecheck + tests; it must pass before every commit.
- The server has **no runtime dependencies** and runs TypeScript directly on Node.js 24 (type stripping). Keep it that way: only erasable syntax, imports with `.ts` extensions.
- `src/sign.ts` is a contract with the plugin (`src/storage/keyhole-sign.ts` in dbraendle/obsidian-keyhole). Both repositories test the same fixed vector; changing the signature scheme breaks every installed plugin.
- The HTTP interface (`/f/<key>`, `?list=1`, `?ke=&ks=`) is a public contract too.
- Never log tokens or request URLs (signed URLs carry signatures).
- TypeScript stays on 6.x until typescript-eslint supports TS 7.
- Workflow: never push to `main` directly. Work on a branch, open a pull request, wait for green CI, then squash-merge.
- Releases are automatic: a push to `main` whose `package.json` version has no GitHub release yet publishes the image to GHCR (`:version` and `:latest`) with build provenance. To ship, bump `version` in the pull request. No bump, no release.
