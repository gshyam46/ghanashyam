# Vercel launch

The production source is prepared at the root of [gshyam46/ghanashyam](https://github.com/gshyam46/ghanashyam). The release includes the verified drag-outline fix. GitHub device authentication confirmed the owner account `gshyam46` on 12 September 2026. Vercel account authentication and project linking remain pending, and no production deployment URL has been verified. The repository's existing Apache 2.0 license is preserved in `LICENSE`.

## Project settings

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Repository | `gshyam46/ghanashyam` |
| Root Directory | `./` |
| Node.js | 24.x, pinned in `package.json` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | Next.js default; leave the override unset |
| Optional environment variable | `NEXT_PUBLIC_SITE_URL` = the final HTTPS domain |

Vercel builds use `VERCEL_PROJECT_PRODUCTION_URL` for canonical metadata unless `NEXT_PUBLIC_SITE_URL` overrides it. Local builds fall back to `https://ghanashyamg.vercel.app`; this fallback is not a verified deployment URL for the release. The resolved domain controls canonical metadata, social URLs, and the sitemap. Vercel Preview builds emit noindex/nofollow and a disallow-all robots file; production remains indexable. The contact form uses the existing public EmailJS route and requires no new server secrets.

## Verify the release locally

```powershell
git clone https://github.com/gshyam46/ghanashyam.git
cd ghanashyam
npm.cmd ci
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:e2e:production
```

For an existing clone, run these commands from its root and omit the first two lines. On macOS/Linux, use `npm` instead of `npm.cmd`. The production suite starts its own server at `127.0.0.1:3100` and stops it afterward. Tests intercept contact requests; they never send real email. On Windows, tests use installed Google Chrome; elsewhere, run `npx playwright install chromium` once. [VERIFICATION.md](VERIFICATION.md) records the source implementation's historical checks and their limits; those results do not establish a successful remote deployment.

## Publish to Vercel

Use the account that owns the intended Vercel project. From the `ghanashyam` repository root:

```powershell
npx.cmd vercel login
npx.cmd vercel link
npx.cmd vercel deploy --prod
```

During `link`, select the intended team and the project for this repository. Confirm its Root Directory is `./`. Vercel supplies the project production domain automatically. Set `NEXT_PUBLIC_SITE_URL` only when an explicit canonical override is needed.

This command builds and publishes through Vercel; the local `.next` build is not a Vercel prebuilt deployment. Vercel CLI may require installation and a browser login the first time. Keep the resulting deployment URL and previous production deployment for rollback.

Alternatively, push the release source to [gshyam46/ghanashyam](https://github.com/gshyam46/ghanashyam) using an account with write access, then import that repository through the Vercel dashboard using the settings above. Connect its `main` branch as the production branch. Git deployments build the committed source, so confirm the deployed commit matches the release commit.

After linking, `vercel deploy` creates a preview for subsequent changes. Vercel can treat a new project's first deployment as production, so the initial launch command above specifies `--prod` explicitly.
## Check after publishing

1. Confirm the production URL and custom domain serve the latest page over HTTPS.
2. Open `/robots.txt`, `/sitemap.xml`, and `/opengraph-image`; verify their final domain and indexing behavior. Check a shared-link preview.
3. Confirm `/resume.pdf`, `/resume/`, and `/.env.local` return 404.
4. Check real iOS Safari and Android Chrome: native swipe, pinch zoom, sculpture drag, field focus, dialog controls, and motion preferences. Browser emulation does not establish physical-device frame rate.
5. The EmailJS recipient and allowed origins live in the owner's provider dashboard. If the launch domain changes, check that configuration. Live inbox delivery still needs an owner-approved test; no message was sent during preparation.

`.vercelignore` excludes the personal resume, reference checkout, screenshots, recordings, reports, tests, local environment overrides, and dependencies from CLI source uploads. `.gitignore` continues to protect private/local files in Git. `package-lock.json` is retained and direct dependencies are pinned to the currently tested versions.

Sources checked during preparation: [Vercel deployment commands](https://vercel.com/docs/cli/deploy), [Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [deployment exclusions](https://vercel.com/docs/deployments/vercel-ignore), and [system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables).
