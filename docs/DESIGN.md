# The Observatory: design direction

The portfolio presents Ghanashyam's AI and systems engineering practice as an explorable instrument. A kinetic armillary gives the experience a recognizable visual identity: five machined rings around a matte black ceramic core with a diffuse halo, with warm light travelling through the form. Readable editorial content and interactive project models explain the work. The visual story is connection, inspection and understanding.

This MVP contains **one experience with three visual treatments**, selectable in Experience settings. It does not contain three independently designed websites. The material choice changes the interface palette and sculpture finish while preserving the same content, navigation and interactions.

## Material treatments

| Treatment | Interface | Artwork and intended feeling |
| --- | --- | --- |
| Observatory / copper, default | Warm graphite `#111210`, porcelain `#e9e7df`, copper accent `#d8a680` | Machined copper rings and a matte black ceramic core with a diffuse halo; tactile detail and warm travelling light. |
| Field notes / ink | Paper `#e8e5dc`, dark ink `#242b26`, brown accent `#73583f` | The same armillary with an ink-compatible finish; a technical notebook with an editorial character. |
| After hours / silver | Blue-black `#0e1419`, pale silver `#e4e9eb`, blue-grey accent `#afc9d7` | The same armillary with a cool metallic finish; a more nocturnal, cinematic atmosphere. |

Fine rules, figure annotations, subtle grain and careful spacing carry the identity across treatments. Manrope provides clear variable-weight typography; DM Mono distinguishes labels, measurements and interface details. System Georgia supplies the occasional italic phrase. Meaningful content remains readable without motion or sound.

The material choice is saved locally when browser storage is available. Sound uses the first composition: initially off, manually enabled, with the owner's latest 30% default and slightly stronger interaction chimes. Reload restores these defaults.

## Journey and interactions

The four chapters use native document scrolling. Persistent chapter links, an Index dialog and a skip-to-work link provide direct access. Press `K` to open the index and `Escape` to close dialogs.

| Chapter | Purpose and interaction |
| --- | --- |
| 01 / The signal | Introduces the engineer and the kinetic armillary. Drag the form and release for an inertial settle; when focused, use arrow keys to rotate and `R` to reset. |
| 02 / Selected systems | Switch among Relay, observability and AIDA. Explore each model inline or open its inspection dialog for more context and source links. |
| 03 / The practice | Expand engineering principles, inspect selected skills, and follow the career record from ContentEaseAI to Oracle. Open an entry for contributions and tools, then move between roles inside the detail dialog. |
| 04 / An open channel | Write a small note in a browser dialog, or use the confirmed email and professional profile links. The explicit Send note action uses the owner's existing EmailJS route. |

The project models demonstrate ideas using illustrative data:

- **Relay:** step through Source, Enrich and Qualify using a fictional company. This describes a conceptual lead-intelligence workflow, with human review before outreach.
- **Observability:** inspect request spans and adjust a context-budget slider. Token counts and latency follow a simple illustrative relationship; the model does not estimate quality or claim measured savings.
- **AIDA:** choose a predefined natural-language question and inspect parameterized SQL and illustrative results. No database or model endpoint is connected to this portfolio demo.

Content provenance and outstanding factual questions are recorded in [CONTENT-SOURCES.md](CONTENT-SOURCES.md).

The experience timeline stays concise: **2023 → 2024–25 → 2025 → 2025–Present**, in chronological order. These year-only labels follow the owner's latest preference. Exact month ranges stay in the source notes; ContentEaseAI is limited to its confirmed 2023 period. Contributions, location, and technology detail appear only when an entry is opened. A compact skills list reinforces the engineering, applied-AI, and observability focus without badges, ratings, or proficiency charts.

The note composer resembles a short piece of correspondence: choose a topic, write a message, and add a reply address. A name is optional and a simple “Hi” is sufficient. Delivery feedback is explicit; a rejected request keeps the draft available for retry and leaves a direct email link visible. It is an email interaction, not a chatbot or live chat. Nothing is sent on open or while typing. Inbox delivery has not been tested; automated tests intercept the provider completely.

Dropdowns use the same materials, fine borders, typography, and selected-state detail as the rest of the interface. Their menus place themselves above or below the trigger to remain within the viewport, including inside dialogs. They support keyboard navigation, type-ahead, selection, and dismissal. Small-text sizes, button targets, and dialog scrolling were refined while retaining the original spacing and character.

On phones and tablets, the sculpture follows the complete introduction so it cannot obscure the text. Navigation compresses to available width, forms stack naturally, and dialog controls remain reachable in short landscape viewports. Responsive coverage exercises 320×568, 360×740, 390×844, 430×932, 768×1024, 844×390, 1024×768, and 1440×1000; check the verification report for the actual latest results.

## Motion, sound and fallbacks

Motion follows a small set of behaviors: five nested rings turning slowly about different axes, a travelling warm light, settled content transitions, line emphasis and quiet control feedback. The armillary aligns with chapter poses and changes prominence as visitors move through the page. Project content remains the foreground when visitors inspect the work.

A sparse mathematical field adds depth behind the sculpture: partial curves, plotted points, and fine crosses. Nearby samples respond gently to the mouse; chapter changes alter the field's orientation and depth. A small amount of scroll parallax separates the artwork, introduction, and annotations. Sections reveal as they enter view, without changing native scroll behavior. The choice keeps the Observatory's instrument-like identity instead of introducing unrelated space imagery.

On desktop, a small dot tracks the pointer immediately while a faint ring follows with a short ease. The ring expands over controls, introduces directional marks over the sculpture, and contracts during a drag. Text selection and inputs retain native behavior; keyboard navigation hides the decoration. A pointer-transparent manual popover keeps it visible over dialogs and menus without changing their focus. The enhancement requires a fine pointer, an available Popover API, and motion enabled; other cases retain the browser cursor. Both the ring and atmospheric canvas stop drawing once movement settles.

The owner selected the second sculpture concept: a kinetic armillary with five machined copper rings and a matte black ceramic core with a diffuse halo. This replaces the earlier woven trefoil and supersedes the instruction to retain that sculpture unchanged. The rings, travelling light, drag inertia, and chapter alignment belong to this new form; the surrounding layout, material selector, native scrolling, keyboard controls, Pause, reduced motion, and SVG fallback remain part of the experience. Earlier trefoil screenshots and hit-area checks are historical evidence, not verification of the replacement.

Between the practice notes and career timeline, “INSIDE THE PRODUCT / Software, engineered end to end.” introduces the illustration. The short supporting sentence is “I build interfaces, backend systems, and AI workflows.” This includes interface development and uses direct engineering language. The Practice section keeps three principles: Systems engineering, Applied intelligence, and Operational clarity. A compact application window frames a tall, thin rhombus with a glowing circular centre. Its long diagonal is approximately 1.6 times its width. The window measures 220×136px on desktop and 200×124px on phones, around 60% less area than its previous version. Quiet controls, navigation, tabs, and a status strip retain the application character. The window itself is the Interface component: it stays visible as it moves from 32% to 12% of the stage height and shrinks to 52px wide by .52 reveal progress. Fine chrome recedes as it becomes small, while its silhouette and diamond persist. The introductory copy fades independently. Authenticated API boundaries, application services, agents, retrieval, models, queues, workers, data, a vector index, caching, tools, and integrations open underneath. Observability accompanies the whole system.

The remaining symbols are 23px on desktop and 20px on phones. Hover, focus, and tap expose a concise name and role below the illustration; the resting message is “Designed to work together.” Nine staggered transmissions cover request/response, background jobs, tools, authentication, primary data, and caching. Each head uses a 6px-radius fading halo with a .65px blur; tails use 2px blur and arrivals illuminate gently. Traffic remains visibly moving at rest and begins at .48 progress as the window reaches the Interface position. The introductory copy clears by .22 progress to avoid crossing the emerging nodes. The original reveal mapping remains 274px on desktop and 216px on phones; component positions finish at .72 progress. The stage releases 32px later, retaining the 229/188px sticky interval. There is no wheel/touch interception. Reduced motion shows the expanded system directly. Short laptop windows retain the sticky reveal; windows at or below 520px high use an unpinned scroll reveal while data flow keeps looping. Viewport height never disables motion. Pausing or opening a dialog stops motion without changing page geometry. This is a conceptual architecture, with no additional project or performance claims.

Experience settings expose motion and sound controls. The implementation responds to the operating system's reduced-motion preference, provides a static SVG sculpture fallback, and stops background rendering when appropriate. The sculpture is progressively loaded; visitors can read and navigate the document independently of WebGL.

The soundscape is the original Web Audio composition: D-major sine voicing, a 1200 Hz low-pass filter, slow amplitude modulation, and light interaction chimes. Its first hook was restored against the initial creation patch. The latest authorized adjustment changes the default master volume from 35% to 30% and compensates the interaction envelope to make its default output peak 8% stronger (0.0084 to 0.009072). Manual Off/On control, original fades, and hidden-tab suspend/resume remain. Later stereo/reverb, automatic startup, and stored audio preferences are removed. There are no music-file downloads, vocals or third-party recordings.

A branded loading screen waits for the two local font faces and a successful first sculpture render or SVG fallback. It reads a persistent readiness attribute as well as an event, so a fast-rendering sculpture cannot race the loader. Two animation frames allow committed layout to paint before dismissal. There is no fabricated percentage or minimum delay: Continue/Escape, a six-second cap, reduced-motion dismissal, and a CSS/no-script escape prevent a permanent cover. This prepares the entrance; offscreen suspension and bounded animation work address ongoing performance separately.

## References and original work

Reviewed September 2026. These links informed design principles; the applications below are interpretations for this portfolio.

| Reference | Relevant lesson |
| --- | --- |
| [Igloo: Awwwards case study](https://www.awwwards.com/igloo-inc-case-study.html) | Build a coherent visual journey around distinctive objects, with interaction and sound reinforcing the same material language. Its case study also emphasizes browser prototyping and continuous performance measurement. |
| [Lusion](https://lusion.co/) | Treat artwork, motion and implementation as one composition, while keeping project navigation legible. |
| [Bruno Simon](https://bruno-simon.com/) | Let the experience demonstrate engineering capability, and provide explicit controls for audio, navigation and interaction. |
| [Terminal Industries](https://terminal-industries.com/) | Explain AI through concrete operating behavior and useful outcomes. |
| [Anime.js](https://animejs.com/) | Demonstrate an idea through a controllable example. The portfolio uses its own implementation and does not depend on Anime.js. |
| [Rauno Freiberg: Invisible Details of Interaction Design](https://rauno.me/craft/interaction-design) | Consider immediate feedback, spatial relationships, interruptibility and the frequency of an interaction when choosing motion. |
| [Linear: Behind the latest design refresh](https://linear.app/now/behind-the-latest-design-refresh) | Reduce icon weight and competing structure while retaining useful density. |
| [Stripe: The Connect front-end experience](https://stripe.com/blog/connect-front-end-experience) | Use coordinated component transitions and keep animation responsive. |
| [Vercel Fluid Compute](https://vercel.com/fluid) | Explain a system through requests, AI work, and asynchronous tasks. |

The Observatory experience uses original layout, interaction code, procedural Three.js armillary geometry, SVG mark/fallback, grain treatment and Web Audio composition. **No source code, models, textures, photographs, recordings or videos were copied from the design-reference websites.** The owner's supplied repository and public project descriptions provide portfolio content.

Third-party building blocks remain their authors' work: Next.js, React, Three.js, Lucide icons and the font packages. Manrope and DM Mono are open-source fonts distributed under the SIL Open Font License; see the [Manrope license](https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt) and [DM Mono license](https://github.com/google/fonts/blob/main/ofl/dmmono/OFL.txt). They are self-hosted through Fontsource packages. Georgia is a system-font fallback, not a bundled font asset. Preserve dependency and font notices when distributing the build.

## What to develop after choosing a direction

The settings selector is a material comparison within this MVP. A later design iteration can turn the preferred treatment into a more distinct composition:

- **Observatory:** deepen the sculpture-to-project relationship, with each project revealing a different view of a connected system.
- **Field notes:** develop an editorial layout around annotated diagrams, architecture sketches and concise engineering case studies.
- **After hours:** develop a spatial signal-room experience with a wider canvas, directional light and carefully scoped data interactions.

These are candidate next directions, not implemented alternate sites. Real project captures and confirmed outcomes would add specificity before extending the visual story. The owner cancelled the résumé feature, so this iteration adds no résumé button, paper-opening effect, viewer, or download. Award recognition is an aspiration; this portfolio makes no claim of having won an award.

## Motion polish - 12 September 2026

The sculpture remains the dominant moving form. Its desktop scroll lift is capped at 30px, with the copy and caption moving at smaller opposing ratios; the phone uses a subtle background-only depth shift. One 12-second light sweep follows the project-selector divider from left to right. It pauses outside the viewport, in hidden tabs, and while a dialog is open.

Section groups ease in from 18px below and depart with a 12px upward lift near the upper viewport edge. Re-entry works in both directions. No sticky architecture ancestor is transformed; native scrolling remains in charge. Focused content remains fully visible.

A bounded, theme-matched phone touch trail pairs soft radial light with a fine connecting glint. It lasts 460ms, caps history at 18 samples, redraws only while visible, uses passive touch listeners, and clears for pinch gestures, text fields, dialogs, hidden tabs, Pause, and reduced motion. Astra Ultra reviewed the composition and recommended the visible divider placement, shallow exit band, and continuous touch highlight.

## Working toolkit

Two tightly tracked grey typography lanes bridge Projects and Practice. Their continuous native-animation-frame translation defaults to 24px/s to the right, eases left on upward scrolling, and resumes right on downward scrolling. Hover reduces speed to one fifth; individual names brighten, and horizontal dragging scrubs a row. Pointer gestures retain native vertical scrolling and pinch zoom. The static expandable toolkit avoids requiring visitors to chase moving text.

The local Pause button, global Pause, reduced motion, hidden tabs, and offscreen observation stop continuous work. The 43 tools combine the owner list with Groovy, RAG, OpenTelemetry, SkyWalking, and eBPF already documented in the portfolio. Prometheus appears under observability. LangChain and Langfuse were explicitly requested by the owner; their role was checked against [LangChain](https://www.langchain.com/oss-overview) and [Langfuse](https://langfuse.com/docs).

Suggested additional interaction, pending selection: a shallow Follow the signal band (Intent, Context, Decision, Action, Trace), with one travelling copper pulse and hover/tap/focus explanations. Keep it 80-100px tall; do not duplicate the large architecture reveal or crowd the marquee.

## Intertwined energy and quieter typography

The two bands now serve different moments: a bright interactive flux field closes Projects and introduces Practice; the grey technology marquee follows the complete Practice content and career history. Marquee text is now 26-44px (previously 38-72px) and baseline speed is 58px/s (previously 24px/s). Hover slowdown and scroll reversal remain. The standalone marquee has its own page padding, and the surrounding chapter spacing is reduced.

The energy field uses intertwined luminous SVG filaments, soft bloom, moving highlights, pointer deformation, and user-triggered pulses. It stays shallow and uses the existing material colors. Its resting geometry remains visible with motion paused or reduced.
