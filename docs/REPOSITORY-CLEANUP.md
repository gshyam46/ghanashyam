# Repository cleanup

Removed **59 unused legacy files totaling 37,466,492 bytes (35.7 MiB)** before preparing the Observatory for a new repository. One generated browser-report file, `test-results-motion/.last-run.json` (45 bytes), was also removed.

| Removed material | Files |
| --- | ---: |
| Original top-level section components: Certifications, Contact, Experience, Footer, Hero, MagicButton, Projects, Publications, Skills, StarBackground | 10 |
| Original `components/ui/` implementation | 11 |
| Original `constants/` content | 6 |
| Unused `public/` images, videos, logos, mouse-effect script, and unrelated template PDF | 25 |
| `utils/motion.ts`, `lib/utils.ts`, `data/confetti.json`, `app/glass.css`, `components.json`, `.eslintrc.json` | 6 |
| Archived `docs/legacy/tailwind.config.ts.txt` | 1 |

The emptied legacy directories were removed. The root Tailwind configuration had already been retired; this cleanup removed its archive.

## Evidence and scope

A recursive TypeScript import-graph audit from `app/page.tsx` and `app/layout.tsx`, including dynamic imports and stylesheet imports, reached only the current Observatory components, `data/portfolio.ts`, `data/contact-config.ts`, `lib/ambient.ts`, and the active application styles. None of the removed files were reachable. A separate asset-reference search found no active references to the removed public assets. Their graphics and audio replacements are generated in code or bundled through the current font packages.

All 58 removed files from the original repository were unchanged tracked files at cleanup time. The Tailwind archive was an untracked reference file created during the rebuild. Current untracked Observatory work was preserved. The package manifest and lockfile already contained the active stack and no retired animation, Tailwind, or React Three Fiber dependencies, so no dependency changes were needed.

Deletion targets were resolved to absolute paths inside the portfolio workspace, checked against protected directories, and checked for filesystem links before removal.

## Preserved and excluded from publishing

- Preserved all active app files, both `app/icon.svg` and convention-loaded `app/favicon.ico`, `components/observatory/`, current data, audio, configurations, dependency manifests, tests, recording scripts, and current documentation/evidence.
- Preserved the owner's `resume/GHANASHYAM_G.pdf` (254,986 bytes). `/resume/` remains ignored and is not served by the app.
- Preserved `.git/`, `.reference/`, dependencies, and local build caches. Git metadata should not be copied as project content when creating a separate repository; `.reference/`, `node_modules/`, `.next/`, and `.npm-cache/` are already ignored.
- Added `/test-results-*/` to `.gitignore` so browser-report variants stay out of the new repository alongside the existing ignored reports, local environment files, and build outputs.

This cleanup did not commit, push, deploy, or alter application behavior. Build and browser verification are recorded separately in `VERIFICATION.md`.
