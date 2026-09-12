# Verification - 12 September 2026

## Latest: luminous core and contact headline

The centre now has a softly luminous, glazed finish with palette-matched emission. Both the 3D assembly seam and the SVG seam are removed. The core no longer receives a hard band shadow; its shape still shades smoothly and casts a shadow on the surrounding instrument. The contact headline is the owner's chosen "Let’s build together."

The production build and TypeScript passed. The existing armillary and drag-alignment production suites passed **12 checks in 49.6 seconds**, with two intentional device-specific skips. These cover motion, Pause, reduced motion, keyboard rotation/reset, ring hit-testing, native phone scrolling, and the static fallback. Desktop and phone production captures confirm the new headline and WebGL rendering with no captured page errors. Visual review also covered Copper, Ink, Silver, and the seam-free SVG fallback.

Preview: **http://127.0.0.1:3001**. Updated images: [desktop core](screenshots/desktop-armillary-copper.png), [phone core](screenshots/mobile-armillary-copper.png), [desktop contact](screenshots/desktop-contact-refined.png), and [phone contact](screenshots/mobile-contact-refined.png). The verified source is mirrored to the prepared release checkout; publishing still awaits the previously requested GitHub and Vercel authentication.

## Previous: kinetic armillary replacement

The selected second concept is implemented as five bevelled copper bands with articulated bearings, calibration marks, a matte ceramic centre, and one travelling signal visible from either face of its band. The innermost gimbal completes a slow 125-second revolution. Other ring axes and the outer pose settle toward chapter-specific orientations. Mouse/touch drag has bounded inertia; explicit arrow-key rotation and R reset remain available with reduced motion. The static SVG uses the same initial ring transforms as WebGL.

`npm run build` passed on the final source, including TypeScript and all static routes. Windows required running the build outside the sandbox because the existing `.next/trace` was not writable there; no application build change was needed. The production preview at **http://127.0.0.1:3001** serves `data-sculpture="armillary"` in WebGL mode with no captured page errors.

Final production browser command: `npm run test:e2e:production -- tests/armillary.spec.ts tests/drag-alignment.spec.ts tests/responsive.spec.ts`. Result: **14 passed in 1.1 minutes; 4 intentional device-specific or duplicate-matrix skips**. Checks compare actual rendered pixels for ambient motion, Pause and reduced-motion stability; verify keyboard rotation and exact R reset; discover visible ring pixels and verify real drag hit-testing; reject empty canvas; exercise native vertical phone swipes and WebGL fallback; and check chapter tracking plus the eight-size responsive matrix. These are the current replacement checks; earlier broader suites below remain historical.

Visual review covered Copper, Ink and Silver at 1440x1000 and Copper at 390x844. Current captures: [desktop Copper](screenshots/desktop-armillary-copper.png), [desktop Ink](screenshots/desktop-armillary-ink.png), [desktop Silver](screenshots/desktop-armillary-silver.png), and [phone Copper](screenshots/mobile-armillary-copper.png).

The implementation is mirrored to the prepared `gshyam46/ghanashyam` release checkout. GitHub and Vercel account authentication are still pending; no remote push or production deployment is claimed. Contact tests do not send email. Physical-device frame rate and live inbox delivery remain unverified.
## Previous: two bands and revised typography

The updated production build passes, and TypeScript passes. A bright eight-strand energy field now closes Projects at `#energy-flux`, before Practice. The smaller/faster technology marquee is a standalone section at `#toolkit`, after the complete Practice content and career history. It uses 26-44px type and 58px/s baseline motion, preserving hover slowdown, dragging, and scroll reversal.

The flux field is 116px tall on desktop and 98px on phones, responds to pointer movement, and sends pulses through click/tap/keyboard activation. It pauses offscreen, in hidden tabs, behind dialogs, and under Pause/reduced motion. A visible resting weave remains. The previous pipeline-band suggestion has been replaced by the owner-requested intertwined energy treatment.

Astra Ultra visually reviewed Copper and Silver at 1440x1000 and 390x844: the flux is visibly bright, compact, animated, and free of clipping; the toolkit is after Practice at the smaller size. Five flux interaction/accessibility checks and two responsive checks passed. Repositioning the marquee exposed inherited `main { pointer-events: none }`; its new standalone root now explicitly restores pointer events. The final build passes. All **six final marquee checks passed in 47.2 seconds**, with two intentional pointer-specific skips, including speed, smaller type, placement after Practice, direction reversal, mouse hover/drag, phone drag with native vertical scroll, Pause, reduced motion, static index, and accessibility. Across flux, responsive, and final marquee validation, 13 distinct checks are verified. Preview: **http://127.0.0.1:3001**. No new deployment has occurred.

## Compact technology marquee - 12 September 2026

The production preview at **http://127.0.0.1:3001/#toolkit** now contains two grey, bold typography lanes between Projects and Practice. Production compilation and TypeScript passed. The 43 names are available in a static expandable toolkit as well as the moving band. The compact signal/pipeline band is a recommendation only and has not been added.

The direction test measures signed travel across the repeating-copy seam; comparing raw transform coordinates incorrectly treated a seamless wrap as a reversal failure. Visual inspection confirms matching repeated copies and continuous motion. **Final production verification: 8 checks passed in 2.9 minutes; four intentional device-specific or duplicate-matrix skips.** Coverage includes right/left/right travel, mouse hover slowdown and drag, native horizontal touch drag with vertical page scrolling, local Pause, reduced motion, keyboard access to the full list, an axe accessibility scan of the toolkit, chapter tracking after resize, and the eight-size responsive matrix. Captures: [desktop](screenshots/desktop-technology-band.png) and [phone](screenshots/mobile-technology-band.png).

## Motion polish and launch preparation - 12 September 2026

The local production review is at **http://127.0.0.1:3001**. Vercel publishing is prepared but has not occurred; no account/project is linked. See [LAUNCH.md](LAUNCH.md).

Production build and TypeScript checks passed after adding parallax, a 12-second project-divider sweep, a 460ms phone touch trail, and reversible section reveals. The release also includes Node 24.x and exact direct dependency versions, canonical metadata, robots, sitemap, and a generated 1200x630 social image. Direct versions agree with the lockfile.

Astra Ultra reviewed desktop and phone Copper/Ink captures and real CDP touch gestures. Native swipes scrolled 205px, light was visibly painted, and the canvas cleared within 650ms of release. The review found two final corrections: cap the exit boundary relative to the header to preserve chapter labels, and separate the mobile sentences in the work introduction. Those corrections are included in the final successful production rebuild. Fresh desktop/phone captures verify chapter labels at full opacity below the header (140px desktop, 111px phone). The complete production suite passed 70 checks in 8.8 minutes, with 12 intentional pointer-specific or duplicate-matrix skips, before the final exit-boundary/copy refinements. The focused final production regression passed **15 checks in 3.8 minutes**, with one intentional desktop skip for the native phone gesture. It covers section exit/re-entry, the visible loop, phone touch painting and cleanup, Pause/reduced motion, metadata routes, chapter-label preservation, keyboard navigation, settings, and accessibility on desktop and mobile. No application errors remained.

The contact suite intercepts all provider requests. Physical iOS/Android performance, Vercel-hosted behavior, domain/DNS, and real inbox delivery remain unverified. No award or performance-score claim is made.

Current captures: [desktop work](screenshots/desktop-motion-polished.png), [phone work](screenshots/mobile-motion-polished.png), [phone touch](screenshots/astra-motion-phone-copper-touch-live.png), and [social preview](screenshots/social-preview.png).

Previous verification records are preserved below.

## Previous verification - 11 September 2026

The Observatory prototype is built and running locally at **http://127.0.0.1:3001**. This is the production build, not a mockup image.

## Final checks

| Check | Result |
| --- | --- |
| TypeScript (`npm.cmd run typecheck`) | Passed |
| Production build (`npm.cmd run build`) | Passed without build warnings; home page prerendered |
| Latest Practice copy checks | Caption/component inspection passed on desktop and mobile; keyboard navigation passed twice per viewport after correcting test synchronization |
| Latest compact-window transition checks | 12 passed in 1.9 minutes; 6 intentional duplicate-matrix skips |
| Previous full production regression before the compact-window transition | 63 passed in 7.3 minutes; 11 intentional pointer-specific or duplicate-matrix skips |
| Previous pacing refinement browser checks | 26 passed: 20 audio/diagram/motion checks plus 6 keyboard/settings/accessibility checks; 6 intentional duplicate-matrix skips |
| Earlier full-portfolio baseline | 60 unique checks passed across the full suite and accessibility rerun; 8 intentional skips. Short-window motion assumptions were later found incorrect; see the correction below. |
| Desktop viewport | 1440 × 1000 |
| Mobile viewport | 390 × 844, Pixel 7 emulation |
| Responsive matrix | 320×568, 360×740, 390×844, 430×932, 768×1024, 844×390, 1024×768, 1440×1000; all passed |
| HTTP preview checks | Copper, Ink and Silver URLs return 200 |
| Git whitespace check | Passed |

## Practice copy refinement

Removed the fourth principle, Delivery ownership. The section retains Systems engineering, Applied intelligence, and Operational clarity. The illustration caption now reads “INSIDE THE PRODUCT / Software, engineered end to end.” with “I build interfaces, backend systems, and AI workflows.” This explicitly includes interface development and preserves the professional engineering tone.

The production build passed. Caption and component-inspection checks passed on desktop and mobile. The keyboard check exposed a timing issue: its next click could interrupt native smooth scrolling before the chapter reached its destination. The chapter indicator correctly reflected the resulting viewport. The test now waits for the chapter's top to reach the viewport top before clicking its principle; keyboard navigation then passed twice each on desktop and mobile (four checks in 35.8 seconds). Application navigation is unchanged. Existing animation recordings predate this copy-only refinement.

## Compact window and continuous Interface transition

The owner rejected the earlier window's size and its fade into a separate icon. The application is now a persistent child of the Interface button. On desktop its bounds shrink from 220×136px to 52px wide; on phones they start at 200×124px. It moves from 32% to 12% of stage height and retains full opacity throughout. Fine chrome recedes while the same window outline and diamond remain visible. The original scroll interval and looping glows are preserved.

An independent visual review sampled the start, quarter reveal, .52 reveal, and settled system at 1366×650, 390×844, and 320×568. It verified the same DOM object, full effective opacity, monotonic movement, final Interface alignment, click/focus, and no final overlap or horizontal overflow. Window widths were 220→140→52px on desktop and 200→130→52px on phones. A transient text/node collision found during the review was corrected by clearing the separate introductory copy at .22 progress.

The final production diagram/motion run passed **12 checks in 1.9 minutes**, with six intentional duplicate-matrix skips. It verifies persistent DOM identity, effective opacity through ancestors, shrinking/movement, alignment, reverse restoration, more than two full traffic cycles at rest, short landscape, responsive bounds, Pause/reduced motion, and accessibility in all three materials. Refreshed quarter-reveal captures confirm the text overlap is gone. The updated 35.5-second [motion recording](motion/product-loop-laptop.webm) also verifies a visible shrinking window and eight or nine active traffic connections at rest. Typecheck, production build, and Git whitespace checks passed.

## Previous application window and repository cleanup

The opening application window now includes window controls, a navigation rail, selected Overview tab, canvas grid, and status strip. A shallow 3D rhombus sits at its centre with a long diagonal approximately 1.61 times its width. The application surface uses the existing rise/fade sequence, and the revealed interface symbol carries a matching diamond. Travelling light has a wider, more faded radial halo with additional blur and softer arrival illumination.

Independent visual review covered 1366×650, 390×844, 320×568, and the Ink material. The window remained below the header and above the footer, including the small-phone window top at 101px below an 88px header. The initial upward movement was visible, and traffic continued at a fixed .52 reveal position and in the settled system. No clipped content, horizontal overflow, or page errors were found. Captures are `screenshots/qa-product-v4-*`.

The cleanup removed 59 unused legacy files totaling 35.7 MiB, plus one obsolete generated report artifact. Import-graph verification found 25 reachable application files and no missing imports. Typecheck and production build passed. The three material URLs and current SVG icon returned HTTP 200; removed template PDF, old video, old mouse script, and private résumé URLs returned HTTP 404. The personal résumé and reference folder remain excluded by Git. See [REPOSITORY-CLEANUP.md](REPOSITORY-CLEANUP.md) for the deletion inventory and safeguards.

The complete production browser suite passed **63 checks in 7.3 minutes**, with 11 intentional skips for pointer-specific cases or viewport matrices already covered by the other project. Coverage includes desktop/mobile projects, career and contact interactions, audio controls, cursor/drag behavior, loading/fallbacks, keyboard navigation, accessibility, responsive bounds, the application reveal, and continuous traffic at rest. All contact requests were intercepted; no real message was sent. The [motion recording](motion/product-loop-laptop.webm) was refreshed to show the current application surface and diffuse light treatment.

## Previous Vision and pacing refinement

The owner requested the earlier rhombus with its glowing centre, a shorter hold after the product appears, subtler travelling light, revised copy, and adjusted audio levels. The Vision-to-product progress mapping remains 274px on desktop and 216px on phones. Components settle at .72 progress; the stage releases approximately 32px later. This reduces total sticky scrolling from 380/300px to 229/188px without accelerating the initial reveal. Traffic now begins at .48 progress, as Vision disappears.

The production checks passed 20 audio/diagram/motion cases in 2.3 minutes, with six intentional duplicate-matrix skips. Ordinary wheel input verifies the original quarter-distance Vision rise/fade, visible moving traffic at a fixed .52 reveal position, more than two full loops at rest, and the shorter post-settlement handoff. The existing portrait, tablet, short-laptop, landscape, reduced-motion, Pause/Resume, and three-material accessibility checks passed. Six additional keyboard/settings/accessibility cases passed on desktop and mobile in 36.8 seconds.

An independent visual review at 1366×650 and 390×844 confirmed that the rhombus and circular light read clearly, the softer glows visibly move at rest, and the caption, default inspection message, and Delivery ownership principle fit. The measured remaining hold was 31.72px on desktop and 32.48px on phone. No page errors or horizontal overflow were found. Captures are `screenshots/qa-product-v3-*`; the reproducible [motion recording](motion/product-loop-laptop.webm) includes Vision, the upward reveal, early flow, and more than two complete cycles at a fixed scroll position.

Audio retains the first composition and manual controls. Default volume is 30%; the interaction envelope compensates for the lower master level, increasing its default output peak by 8%. Source comparison against the recovered first hook confirms all other audio behavior is unchanged. Typecheck, production build, all three material URLs (HTTP 200), and the Git whitespace check passed.

## Reported motion failure and correction

The owner's repeated report was reproduced using ordinary wheel scrolling on the production preview. At 1366×650, 1536×695, and 844×390, the site had motion enabled and reduced motion was off, but the diagram immediately expanded, hid the vision, and never populated any light-ray coordinates. A 1024×768 control viewport worked.

Cause: the `short` viewport media query was included in the `still()` motion predicate. It therefore disabled both the reveal and the continuous loop. Earlier tests incorrectly accepted a short-screen still fallback, so their passing results did not cover the owner's experience. Increasing ray count or brightness could not address that cause.

Correction: only explicit Pause and reduced motion stop animation. Short laptop windows retain the sticky reveal. Windows at or below 520px high use an unpinned scroll reveal, with traffic continuing while the diagram is visible. New real-wheel tests observe more than two full request cycles without additional scroll and exercise resize, re-entry, and preferences independently.

The earlier targeted audio/diagram run passed 17 checks, but is historical evidence only. Its short-screen assumptions and partial audio restoration have been superseded by this correction.

Evidence for that earlier correction: three new production motion regressions passed in 54 seconds, including more than 24 seconds of visible traffic at fixed scroll. The updated audio and diagram checks passed 17 tests in 1.3 minutes, with three intentional duplicate-matrix skips. A 35-second recording was captured at 1366×650 and reviewed through the reveal and four live frames spanning 25.5 seconds at unchanged scroll. Each live frame contained eight or nine active connections. At that point the audio restoration was identical to the original hook after newline normalization. The current recording has since been refreshed for the latest refinement above; `scripts/record-product-motion.cjs` reproduces it.

Four additional production page/settings checks passed on desktop and mobile in 17.9 seconds, confirming original sound defaults, explicit enable/mute, material persistence, and motion controls. This correction has 24 passing targeted checks in total. Production build, source equality, HTTP 200, and Git whitespace checks also passed.

The earlier full baseline run used:

```powershell
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3001'
npm.cmd run test:e2e
```

The full production run completed with 59 passes, eight intentional skips, and one desktop axe timeout in 6.2 minutes. A focused rerun exposed a timing race: the scan sampled the loading cover during its exit fade, before removal. Experience tests now wait for the cover to leave the DOM before visual/contrast checks. The identical desktop and mobile accessibility checks then both passed in 13.4 seconds, with zero violations. The application build did not change during this correction; other functional tests were not repeated unnecessarily.

```powershell
npm.cmd run test:e2e -- tests/experience.spec.ts --grep 'key scenes and settings' --output=test-results-accessibility
```

## Behaviors exercised

- Readable initial content, rendered artwork, local fonts, and the original sound controls: initially off and manually enabled; the latest default is 30% volume.
- Relay source/enrich/qualify controls and the inspect-system dialog.
- Dialog focus restoration and Escape dismissal.
- LLM context slider updates simulated token count and latency; trace selection changes the explanation.
- AIDA query selection changes prepared SQL, parameters, and example result rows.
- Keyboard index, chapter navigation, active chapter indication, and the three Practice principles: Systems engineering, Applied intelligence, and Operational clarity.
- Three material treatments, saved preference, motion control, and audio toggle.
- Chronological year-only career dates, expanded contributions and skills, previous/next navigation, heading focus, scroll reset, and focus restoration.
- No résumé links or viewer. The owner's local source document is preserved and ignored by Git.
- Confirmed direct email, casual note composer, themed dropdown selection, validation, exact provider payload, success, retained failed drafts, retry, and duplicate-send prevention.
- Reduced-motion preference and a usable SVG fallback with WebGL unavailable.
- Axe checks for the page and settings on desktop and mobile.

Independent artwork checks additionally verified that a reduced-motion canvas remains unchanged across time, arrow-key rotation changes the render, and R restores the original image. Launching Chrome with WebGL disabled displayed the 60-path SVG fallback. Desktop and mobile artwork captures showed no JavaScript errors.

The atmosphere was checked for pointer response, reduced-motion and touch behavior, and stopped canvas painting after motion settled. Native touch scrolling over the artwork remains available. [RESPONSIVE-REVIEW.md](RESPONSIVE-REVIEW.md) records the eight-viewport audit and corrections to typography, artwork placement, touch targets, long dropdown values, and dialog bounds.

## Current Practice and cursor refinement

- A short editorial passage connects the diagram to the Practice section. The compact application window stays visible and shrinks directly into Interface while the engineering opens underneath. Its introductory copy clears separately. Runtime is removed; observability spans the system. Names and roles appear on focus, hover, and tap. The final window is 52px wide; other icons measure 23px on desktop and 20px on phones.
- The window waits until the complete stage is visible below navigation. The original 274px desktop / 216px phone progress mapping remains; Interface reaches its position by .52 and the other nodes finish opening at .72. A further 32px releases the stage. Total sticky scrolling is 229/188px. Reverse scrolling expands the same window into its opening state.
- Nine staggered transmissions follow request/response, tools, background jobs, authentication, primary data, and caching, covering all 14 connectors. Small radial glows and short diffuse tails show exchanges; arrival illumination is soft. Flow starts at .48 expansion as Interface reaches its position. Signals stop offscreen, in hidden tabs, and when motion is paused. Pause preserves the track height, including when a dialog opens. Reduced motion presents a still hierarchy; short viewport height never disables animation.
- Browser checks measure reveal progress, actual signal movement, unchanged page height on pause, stage bounds, horizontal overflow, and component overlap. Compact portrait/tablet checks now include 320×568, 320×640, 360×740, 768×1024, 1024×768, 1366×650, 1536×695, and 844×650. Separate ordinary-wheel checks cover the unpinned 844×390 reveal and continuous flow.
- Targeted axe scans of the new figure found zero WCAG 2/2.1 A/AA violations across copper, ink, and silver at desktop and phone widths. Assembled, opening, and connected desktop/mobile captures were visually reviewed.
- The desktop cursor's dot was measured at the exact pointer coordinates. Its following ring changes size over links, sculpture hits, and active drags. Inputs and selectable hero text restore native cursors. The cursor does not intercept clicks, steal dialog focus, or prevent dropdown selection. Touch, reduced motion, and paused motion use native behavior.
- Sculpture checks prove that both the exposed left loop and right loop begin a drag; empty right canvas and the central opening do not. A drag changes the rendered image with ambient motion frozen. A real Chromium touch gesture on the form scrolls the page and clears drag capture when the browser takes over.
- The transparent hero wrapper was intercepting the visible left side of the model. Restricting its pointer events to actual text and controls resolves this, while a lightweight geometric pick surface prevents dragging empty canvas. Rendered geometry, materials, poses, transitions, and rotation equations are unchanged.
- Resizing from Contact to the taller Practice could retain a stale active chapter. Selection now recalculates from all four chapter positions during scroll, resize, and intersection updates. The reproduction passes across phone, tablet, landscape, and desktop sizes.

Current product captures: `screenshots/product-assembled-desktop.png`, `product-opening-desktop.png`, `product-connected-desktop.png`, and the corresponding `-mobile.png` files. The earlier `system-map-*` captures record the superseded sheet illustration. Cursor behavior is captured in `screenshots/cursor-drag-desktop.png`.

The independent compact-system review inspected desktop 1440×1000, phone 390×844, and small phone 320×640. Trails were visibly moving by 60% of the runway, touch inspection worked, and the bottom components cleared the status text by 28px and 8px on the two phones. Captures: `screenshots/qa-product-v2-*`.

## Loading and audio revision

- The loading screen waits for local font readiness and a successful first WebGL render, or the SVG fallback. Browser checks exercise genuine readiness, an artwork event that arrives before fonts, WebGL failure, a held readiness signal with a six-second timeout, and immediate reduced-motion Continue. There is no fabricated progress indicator or minimum delay.
- The complete initial audio source was recovered and verified against its successful creation patch at 2026-09-10T12:35:06.875Z. All 107 baseline lines match after newline normalization; baseline SHA-256: `6cf5e6b3b09669b63c9b06e4ae9624735b1833dce2f0e027185520aab9d9fb79`. The current source subsequently changes only the owner-requested default volume and interaction peak; this historical hash is not the current file hash.
- Audio checks exercise manual enable, initial Off/30%, original fade/mute behavior with one graph, hidden-tab suspend/resume, and return to these defaults on reload. The later saved preferences and global first-interaction startup no longer apply. Gain compensation raises the default interaction output peak from 0.0084 to 0.009072, an 8% increase despite the lower master volume.
- The original D-major composition, voice levels, modulation, filter, chime pitches/timing, and control lifecycle remain. Audio is locally generated. Loading readiness does not establish a universal frame-rate guarantee or eliminate device-specific rendering limits.

All eight contact tests intercept EmailJS and use simulated responses. No test message was sent, and actual inbox delivery remains unverified. The restored provider route has its recipient configured in the owner's EmailJS dashboard; the displayed direct email is `gshyam2603@gmail.com`.

## Additional material and accessibility review

[QA-ADDITIONAL.md](QA-ADDITIONAL.md) records 54 automated scans across palettes, project states, and widths. The review found and corrected the Ink treatment's secondary-text contrast, then verified all nine affected desktop/mobile/tablet combinations with zero violations. A separate navigation-digit contrast correction is included in the final full-suite pass.

The refinement review scanned the career panel and the contact composer with its dropdown both open and closed, across all three palettes and desktop/mobile widths. See [REFINEMENT-ACCESSIBILITY.md](REFINEMENT-ACCESSIBILITY.md). The settings footnote contrast was also corrected, and exhibit controls now have scroll margins to remain clear of fixed navigation.

A mobile keyboard test initially pressed K before React installed its event listener. The test now waits for the client-rendered clock before sending keyboard input; the same keyboard/navigation check subsequently passed three times each on desktop and mobile. This changes test synchronization, not application behavior.

Entrance animations were allowed to finish before measuring contrast; additional model scans used reduced motion. Automated checks are evidence of the tested states, not a complete assistive-technology or WCAG conformance assessment.

## Visual artifacts

- `screenshots/desktop-overview.png`
- `screenshots/mobile-overview.png`
- `screenshots/desktop-field-notes.png`
- `screenshots/mobile-field-notes.png`
- `screenshots/desktop-systems.png`
- `screenshots/mobile-systems.png`
- `screenshots/art-review-desktop.png`
- `screenshots/art-review-mobile.png`
- `screenshots/mobile-career-details.png`
- `screenshots/mobile-contact-note.png`
- `screenshots/mobile-loading.png`
- `screenshots/responsive-*` for the detailed viewport review
- `screenshots/qa-*` for the independent material/model audit

The readable prototype source, design rationale, content provenance, and run instructions are included in the repository.

## Scope and remaining editorial inputs

This is one complete concept with three visual treatments. Project interactions are intentionally labelled simulations; no live lead source, database, model provider, or telemetry service is connected. Contact supports direct email and explicit-send EmailJS notes. The owner confirmed the email and career dates and cancelled the résumé feature. Detailed current-project artifacts and substantiated outcomes remain editorial inputs for future work.

Testing used Chrome with software WebGL available; physical iOS/Safari devices and every GPU configuration were not tested. The static fallback and reduced-motion behavior were verified. No public deployment or remote Git write was performed.
