# Refinement accessibility review — 11 September 2026

**18 scoped axe scans reported zero confirmed violations** for WCAG 2.0/2.1 A and AA. The review covered the current career details and contact note on the local development preview (`http://127.0.0.1:3000`).

| Coverage | States |
| --- | --- |
| Viewports | Desktop 1440 × 1000; Pixel 7 emulation at 390 × 844 |
| Materials | Copper, Ink, Silver |
| Components | Career dialog; contact composer with topic dropdown closed; contact composer with topic dropdown open |

Chrome ran with reduced motion, with local fonts ready before each scan. EmailJS requests were intercepted; **zero email requests occurred**, and no note was submitted.

Two axe results required direct inspection:

- Desktop career text produced background-overlap uncertainty. Live hit testing confirmed that the affected content was unobscured. Foreground-to-dialog-background contrast measured **6.76:1 in Copper, 5.41:1 in Ink, and 7.22:1 in Silver**, exceeding the 4.5:1 requirement. Three targeted follow-up scans found no confirmed violations.
- The open topic dropdown required review of its popup reference. In all six material/viewport combinations, `aria-controls` resolved to the visible listbox and `aria-activedescendant` resolved to an option inside it. Keyboard focus remained on the combobox trigger.

Current phone captures:

- [Career details](screenshots/mobile-career-details.png)
- [Contact note](screenshots/mobile-contact-note.png)

This is a targeted automated and browser inspection record, not a complete assistive-technology or physical-device conformance assessment.
