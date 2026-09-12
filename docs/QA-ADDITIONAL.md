# Additional UI and accessibility audit

Checked 10 September 2026 against the running Next.js preview at `http://127.0.0.1:3000`, using installed Chrome, Playwright and axe-core. This independent audit supplements the functional test suite.

## Scope and method

- Chrome launched with `--enable-unsafe-swiftshader`; JavaScript page errors were recorded.
- Axe tags: `wcag2a`, `wcag2aa`, `wcag21aa`.
- Reduced-motion preference enabled and fonts awaited before scanning, so entrance opacity does not create transient contrast failures.
- Each material palette was chosen through the actual settings radio controls.
- At 1440px, tested Copper / Observatory, Ink / Field notes and Silver / After hours: settings dialog, all three project tabs, Relay's Source/Enrich/Qualify stages, all four trace spans, both context-slider endpoints, and all three AIDA queries.
- Scanned complete pages for project tabs and settings; additional internal model states were scanned within the project demo.
- Checked all three project tabs at 320px and 768px. Measured document width, demo scroll width and descendant bounds. Inspected saved demo screenshots.

## Findings and resolution

The initial 45 scans found one repeated issue: Ink's global `--subtle: #626b5f` text on `--bg: #e8e5dc` measured **4.4:1**, below the required 4.5:1. It affected metadata and secondary copy such as the overview project count, section notes, experience details and signoff. The model interfaces themselves passed.

The main implementation changed the Ink token to `#5b6458`. A fresh browser session verified the computed value, then repeated complete-page audits for every project tab at 1440px, 320px and 768px: **all nine rechecks passed with zero axe violations**.

| Coverage | Result |
| --- | --- |
| Copper: settings and all model states | No axe violations |
| Silver: settings and all model states | No axe violations |
| Ink: settings and internal model states | No axe violations |
| Ink: complete pages after token correction | All nine desktop/mobile/tablet rechecks passed |
| 320px: all three project tabs | Document width 320px; no horizontal overflow |
| 768px: all three project tabs | Document width 768px; no horizontal overflow |
| Visible page/header interactive-control bounds | No controls extend outside 320px, 768px or 1440px viewports |
| Browser JavaScript errors in initial full audit | None |

At 320px, each model window measured 274px wide with a 272px interior scroll width. At 768px, each measured approximately 373.19px with a 371px interior scroll width. No model descendants extended outside the panel. Relay stages, trace labels, budget controls, query selectors and sample tables remained usable in the inspected captures.

No changes to `ProjectDemo.tsx` or `project-demo.css` were needed during this audit. The only required correction was the shared Ink text token, applied by the main implementation.

## Evidence and limits

The audit ran 54 axe scans in total: 45 initial scans and nine targeted regression scans after correcting the three initially failing complete-page Ink states. Saved visual captures are under `docs/screenshots/qa-*` for all palette/project combinations and the two narrow viewport sizes.

These results describe automated checks in Chrome and visual inspection of the captured model states. They do not constitute a complete WCAG conformance assessment or assistive-technology review. The project models intentionally use illustrative data; this audit does not test external services or project backends.
