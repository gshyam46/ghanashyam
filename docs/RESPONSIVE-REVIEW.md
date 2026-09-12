# Responsive review

Reviewed 10 September 2026 against the local Next.js development server at `http://127.0.0.1:3000`. This review covers the portfolio, project exhibits, experience details, contact note, settings, and the custom dropdown. Resume work was cancelled and is outside this review.

## Method

- Chromium with desktop and touch contexts at 320×568, 360×740, 390×844, 430×932, 768×1024, 844×390 landscape, 1024×768, and 1440×1000.
- Checked document and dialog scroll widths, popup viewport bounds, visible text placement, chapter navigation, and modal controls.
- Exercised all four career entries and checked their dates, long company names, and pagination. The final content uses year-only dates in chronological order, as requested after the initial responsive audit.
- Opened the note, selected its longest topic, and filled its message/name/reply fields. No messages were sent; the email provider endpoint was blocked in the audit browser.
- Exercised settings, including changing the material and the volume control. Checked that short screens can scroll to controls and close dialogs.
- Used reduced motion for stable geometry checks. A real Chromium touch-event swipe over the 3D artwork confirmed that vertical page scrolling is preserved (`touch-action: pan-y`; page moved to scroll position 504).
- Separately verified dropdown mouse and touch selection, arrows, Home/End, Enter, Escape, Tab, typeahead, focus restoration, nested dialog behavior, outside dismissal, upward placement, and palette inheritance. An axe WCAG 2/2.1 A/AA scan of the expanded dropdown reported no violations.

## Final verification

The corrected layout was checked again at every viewport. All audited interactions completed with zero JavaScript page errors. The seven issues listed below were corrected and rechecked.

| Viewport | Page width | Career details | Contact note and dropdown | Settings |
| --- | --- | --- | --- | --- |
| 320×568 | 320px, no overflow | Pass | Pass | Pass |
| 360×740 | 360px, no overflow | Pass | Pass | Pass |
| 390×844 | 390px, no overflow | Pass | Pass | Pass |
| 430×932 | 430px, no overflow | Pass | Pass | Pass |
| 768×1024 | 768px, no overflow | Pass | Pass | Pass |
| 844×390 landscape | 844px, no overflow | Pass | Pass | Pass |
| 1024×768 | 1024px, no overflow | Pass | Pass | Pass |
| 1440×1000 | 1440px, no overflow | Pass | Pass | Pass |

- At all six touch viewports, artwork starts 10px below the work CTA; it no longer crosses the hero text or button. At 390×844, the CTA ends at y=439 and the artwork begins at y=449. At 768×1024, those positions are y=513 and y=523.
- The complete landscape heading ends at y=287, above the navigation bar beginning at y=326. Small and short screens continue naturally into the remaining hero content by scrolling.
- All touch chapter links are at least 44×44px and have explicit accessible chapter names. The smallest layout uses numbered links to preserve space.
- Every career entry has zero internal horizontal overflow. Every Next action resets the dialog to scroll position 0, making the date and heading immediately visible. ContentEaseAI fits at 320px. The subsequent year-only date change is covered by the final experience tests.
- The longest selected note topic wraps within the 320px dialog: both client and scroll widths are 284px. All touch input and textarea fonts are 16px.
- All expanded contact dropdowns remain within the screen. The send button can be scrolled fully into view at every size. Sticky close controls remain reachable in short dialogs.
- Visually inspected the final 320px, 360px, 390px, 768px, 844px landscape, and 1024px captures. The development-tools overlay is hidden only in the audit browser's screenshot stylesheet.

The later desktop regression check also passed all three previously failing tests: Relay inspection and focus restoration, observability/AIDA interactions, and full-page/settings accessibility (3 passed in 13.7s). Exhibit controls now have scroll margins that reserve space for the fixed header and navigation. The settings footnote uses the muted text color to meet its contrast requirement.

## Issues corrected during the audit

All eight viewports had matching document and viewport widths. All contact dropdowns stayed inside the viewport. All career, contact, and settings controls could be reached, and the audited browser pages produced no JavaScript page errors.

The audit identified these refinements, which were passed to the implementation owner, corrected, and verified:

1. At 320px, the ContentEaseAI title made the career dialog wider than its content area.
2. Career pagination preserved a scrolled-down position on short screens, hiding the next role's heading and date.
3. Touch tablet and landscape contact fields retained a font size below 16px.
4. At 768px, the desktop artwork crossed the hero heading and description. At 430px, it touched the work CTA.
5. The initial landscape composition placed part of the heading beneath the fixed navigation bar.
6. The original compact chapter controls needed larger touch targets and accessible chapter names.
7. The first refinement's topic sizing prevented a long selected value from shrinking, causing note-dialog overflow at 320px.

## Screenshots

Screenshots live under `docs/screenshots/` with the prefix `responsive-<width>x<height>-` and suffixes `hero`, `career`, `note-options`, `note-fields`, and `settings`. Final captures replace earlier captures at the same paths.

## Review scope

These are Chromium viewport and touch-emulation checks, not physical-device Safari/Android tests. Mobile keyboard and safe-area behavior should also be checked on actual iOS and Android devices before release. Email delivery was not exercised by this review.
