# Portfolio requirements — owner brief

This is the source of truth for the requested experience. It records the owner's intent, including corrections. An automated check or implementation detail does not override the owner's report that the result is not working or does not match the brief.

## Preserve the established portfolio

- Keep the existing premium, restrained visual direction and professional AI/software engineering positioning.
- Use the owner-selected kinetic armillary described below. This supersedes the earlier instruction to keep the original woven trefoil, its appearance, movement, and transitions unchanged.
- Keep the existing selected projects. Do not add another platform or project without a separate decision.
- Keep the curated skills, inspectable work experience, confirmed year-only career dates, styled controls, and subtle contact composer.
- Keep the cancelled résumé feature absent.
- Support phones, tablets, laptops, landscape, and different browser-window ratios. A short browser window is not a request to disable animation.

## Sculpture: selected kinetic armillary

The owner chose the second proposed sculpture with “do the second,” referring to the copper nested-ring armillary mockup. Replace the woven trefoil with **five machined copper rings nested around a softly glowing ceramic core**, with warm light travelling through the form. The rings should move slowly about different axes, respond to dragging with a gentle inertial settle, and align with the page's chapter poses.

Keep the established page composition, three material treatments, phone layouts, native scrolling, keyboard rotation/reset, Pause, reduced-motion support, and a static SVG fallback. The new sculpture should feel like a precise instrument within the existing Observatory. Earlier screenshots, recordings, and passed checks remain historical evidence for the previous implementation; verify the armillary's appearance, movement, interaction, and fallback separately before claiming it is checked or deployed.

## The Practice: idea to a working software product

### Purpose and placement

Place the illustration within “03 / THE PRACTICE — See the whole. Care for the details.” It should express how the engineer thinks about a complete product. Brief copy above or beside it must connect it to the portfolio; it must not feel like an unrelated diagram inserted between sections.

The owner described a finished product opening to reveal what goes into it, similar in principle to a product being dissected into its internal parts. This is a whole software product, not an observability-only demonstration and not repeated flat sheets separating.

### Required visual sequence

1. **The application interface.** Present a small, carefully detailed application window, with an elongated 3D rhombus and glowing circle in its centre. The owner rejected the 350px desktop / 300px phone window as too large; reduce its footprint substantially. The rhombus's length must exceed its width. Window chrome, navigation, tabs, and fine interface details should make this feel like the product people use. Do not spend the reveal while it is still below the viewport.
2. **A continuous transition into Interface.** As the visitor scrolls down, the same application window shrinks and moves into its place as the Interface component. It must remain visibly continuous throughout the transition. Do not fade the window away and replace it with a separate icon. The introductory copy can fade while the engineering opens beneath the interface in a structured hierarchy.
3. **Connected architecture.** The revealed parts remain connected as one working product. Preserve the established Vision-to-product transition pace. Reduce the extra scroll after the components appear; the owner should not need another scroll to start the traffic. Keep a brief handoff to the career content using ordinary scrolling.
4. **Continuous operation.** As the system appears, subtle travelling glows carry data along several connections simultaneously. The owner rejected the brighter rays and wants softer light, still visibly moving at normal viewing size. The operation repeats continuously, including when the visitor stops scrolling. It is not a one-time entrance, a still glowing line, or activity that requires repeated scrolling.
5. **Return and re-entry.** Reverse scrolling can reassemble the product. Leaving and returning to the illustration must resume the working loop correctly.

The owner's words: “some light rays should keep flowing” and “it should go in loop again and again.” Their latest “transaction” wording is interpreted as the previously requested **transition**, alongside the explicit requirement to depict data exchanges.

### Architecture and visual treatment

- Vision is the guiding intent. It is not a runtime service handling requests.
- Show the interface/frontend, backend/API and application logic, and the components they depend on: AI agents, model calls, tools/integrations, retrieval/RAG, databases/storage, caching, authentication, and asynchronous jobs where appropriate.
- Observability spans the system. It must not become the subject of the entire illustration.
- Use sensible component relationships and understandable data paths; do not add meaningless components just to increase the count. Remove the generic “runtime” tile.
- Icons are welcome if they improve clarity, but they must be small and restrained. The oversized illustrations were rejected.
- Avoid a wall of persistent component labels. Concise names/roles can appear on hover, keyboard focus, or tap.
- Small, soft glows must be visibly moving at normal viewing size. The latest correction asks for additional blur and a faded halo around the travelling light. Avoid long bright bars or hard light heads. Follow the connections and gently illuminate a receiving component.
- No exact icon count, packet count, animation library, scroll distance, or number of layers was prescribed by the owner. Those are implementation choices and must serve the experience above.

### Motion and accessibility

Normal-motion visitors should see both the reveal and the repeating data flow on supported screen ratios. Do not silently disable them because the viewport is short. Explicit Pause and an operating-system reduced-motion preference remain respected; the still presentation must remain clear and usable. Offscreen/hidden-tab work can stop for efficiency and must resume on return.

## Practice copy

Keep the engineer/freelancer positioning concise and professional. The diagram introduction now reads: “INSIDE THE PRODUCT / Software, engineered end to end.” followed by “I build interfaces, backend systems, and AI workflows.” Explicitly include interface development in the scope; avoid casual explanatory headlines. The resting inspection message remains “Designed to work together.” Component-specific names and roles remain available on interaction.

Keep three Practice principles: Systems engineering, Applied intelligence, and Operational clarity. Remove Delivery ownership; the owner felt the fourth point did not fit. The existing three explain the engineering practice without adding a filler principle.

## Audio: latest correction takes precedence

Keep the **first approved ambient composition**. The latest request now sets its default volume to **30%** and raises the other interaction sounds by **5–10%**. The selected increase is **8% relative to the prior default output**, compensating for the lower master volume so interactions actually become slightly louder. Do not redesign the composition.

The recovered source is `.reference/ambient-before.ts`: the original D-major composition, originally 35% volume, interaction chimes, and manual sound controls, initially off. Its 107 lines were compared with the successful initial creation patch dated 10 September 2026, and match after normalizing line endings. This establishes the first authored version rather than a later approximation. The current hook changes only the default volume and interaction peak from that source; the composition, fade/mute behavior, manual activation, and reset on reload remain. Browser audio restrictions still apply; never claim audible playback before it actually starts.

## Loading and performance

Provide a brief loading entrance that prepares the critical fonts and artwork before revealing the portfolio. Use real readiness, not fabricated progress or an arbitrary long delay. Provide a bounded fallback so loading cannot trap the visitor. Keep the ongoing experience efficient; a loading screen alone does not guarantee smooth rendering on every device.

## Repository cleanup and publishing preparation

Remove unused files from the older portfolio so the current project can be pushed to a separate repository. Trace active imports, asset use, and framework file conventions before deleting. Preserve the current application, configuration, dependencies, tests, and relevant documentation; retain personal source documents privately outside published content. Update the README to describe the cleaned project. The owner plans to push and host later; this request does not call for a remote push or deployment.

## Acceptance checks for the disputed motion

- Review actual on-screen movement, not just a `data-flow` attribute or the existence of SVG elements.
- Check a typical short laptop window as well as a tall desktop, phone portrait, and phone landscape.
- Use ordinary wheel/touch scrolling to observe the vision moving upward, fading, and revealing components.
- Stop as Vision fades out and components appear. Traffic must already be moving without another scroll. Confirm the remaining hold is shorter while the initial reveal pace is preserved.
- Stop scrolling at the connected state. Observe soft glows moving across several distinct connections simultaneously for at least two full loops.
- Leave and return; confirm motion resumes. Resize while the section is open; confirm it does not become silently still.
- Verify Pause/Resume and reduced motion independently from viewport sizing.
- Capture a short motion recording, not only screenshots, when confirming the disputed animation.

## Historical acceptance status before the armillary replacement

The earlier motion failure was reproduced at 1366×650, 1536×695, and 844×390 and corrected by separating viewport layout from motion preferences. The owner subsequently reported good progress and requested the refinements above.

The latest window is 220×136px on desktop and 200×124px on phones, approximately 60% less area than the rejected version. The same window remains visible, shrinking to 52px wide and moving into the Interface position as the engineering opens beneath it. The established short handoff, soft traffic, and audio settings remain. The completed cleanup removed 59 unused legacy files (35.7 MiB); personal source material remains private and ignored. The [motion recording](motion/product-loop-laptop.webm), [verification report](VERIFICATION.md), and [cleanup inventory](REPOSITORY-CLEANUP.md) document the result for owner review.

## Motion polish and launch request - 12 September 2026

The owner requested parallax, a looping left-to-right animation, glossy/light feedback on phone touch and swipe, reversible section transitions during scrolling, and preparation for Vercel publishing. The follow-up requested Astra at Ultra effort and an immersive, highly polished result with elegant technical communication. The implementation preserves the established composition and focuses motion on the artwork, project selector, and touch contact; it does not claim an award.

## Technology marquee and compact transition - 12 September 2026

The owner requested bold, low-opacity grey moving technology names, slow left-to-right travel, mouse interaction, and reversal when scrolling upward/downward. Place the marquee between Projects and Practice and use the supplied languages, backend, AI, frontend, data, cloud, and DevOps list, including LangChain and Langfuse. A separate compact interactive band was requested as a suggestion, not as an additional implemented feature.

## Two separate bands - owner correction

The owner clarified that the technology marquee belongs **after the entire Practice section**, and requested smaller lettering and increased speed. A separate compact **bright, intertwined flowing energy/flux band** belongs **between Projects and Practice**. This supersedes the earlier single-band placement and unimplemented pipeline suggestion. Retain interaction and the established visual materials.
