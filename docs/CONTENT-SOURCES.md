# Portfolio content sources

Reviewed 10 September 2026. “Verified” below means found in the supplied portfolio or the owner's public repositories; it does not imply independent verification of employment, credentials, or project performance.

Legacy paths below identify the source files inspected during content verification. Those unused components, constants, and public assets were subsequently removed from this checkout at the owner's request; confirmed content is maintained in `data/portfolio.ts` and `data/contact-config.ts`. See [REPOSITORY-CLEANUP.md](REPOSITORY-CLEANUP.md). The personal résumé remains private and ignored.

## Identity and contact

| Item | Verified value | Source |
| --- | --- | --- |
| Name | Ghanashyam G | [GitHub profile](https://github.com/gshyam46), profile API, older portfolio `Bio.name` |
| Display name | Ghanashyam | `components/ui/HeroContent.tsx` in the supplied repository |
| Positioning | AI software engineer; systems engineering, AI integration and automation, agentic systems, observability | Current user brief; supplied `HeroContent.tsx` |
| GitHub | https://github.com/gshyam46 | Current user-provided repository and [GitHub profile](https://github.com/gshyam46) |
| LinkedIn | https://www.linkedin.com/in/ghanashyam-45844624a/ | Owner's [older portfolio Bio object](https://github.com/gshyam46/gshyam46.github.io/blob/main/src/data/constants.js); destination profile access not independently checked |
| Reference portfolio | https://ghanashyamg.vercel.app | User brief; live page and client bundle retrieved |
| Email | gshyam2603@gmail.com | Explicit owner confirmation during this task; also present in the live portfolio's public résumé |

The owner explicitly confirmed the contact email above. The note composer reuses the EmailJS service/template configuration from the [older Contact component](https://github.com/gshyam46/gshyam46.github.io/blob/main/src/components/Contact/index.js), with the existing `from_email`, `from_name`, `subject`, and `message` fields. Its recipient is configured in the provider dashboard and is not visible in the public component. No inbox delivery was tested; the eight contact browser tests use intercepted provider responses. Only an explicit **Send note** action calls the external provider. See [CONTACT-RESEARCH.md](CONTACT-RESEARCH.md) for the complete contract and evidence.

The old portfolio also contains Twitter, Instagram and Facebook profile links; they were not checked for currency and are unnecessary for this professional MVP.

## Project content suitable for the MVP

### Relay / Lead Intelligence

- The user explicitly identifies lead intelligence as a latest project.
- The public [Relay repository](https://github.com/gshyam46/relay) and [README](https://github.com/gshyam46/relay/blob/main/README.md) describe it as AI-powered lead intelligence and outbound automation.
- At review time, the public tree contains only `README.md` and `LICENSE`. No implementation, integrations, production deployment or results can be verified from that tree.
- Safe portfolio wording: **“AI-powered lead intelligence and outbound automation.”** Present any interactive visualization as a conceptual demonstration.
- Need confirmation: preferred project name, exact implemented features, technology choices, live demo and measurable results.

### Observability / LLM optimization

- The user explicitly identifies observability and LLM optimization as current work.
- Supplied `constants/experience.ts` documents observability work with OpenTelemetry, SkyWalking, distributed metrics/traces/logs, Go, Vue.js, eBPF, Prometheus, ClickHouse, PostgreSQL and Docker. These are career-source details, not proof of the latest project's stack.
- The owner's public [cost-guardian repository](https://github.com/gshyam46/cost-guardian) contains only a license. [SentinelX](https://github.com/gshyam46/SentinelX) contains a title-only README and a license. The `skywalking-transformer` repository returned an empty-repository response. None establish the current project's precise name or implementation.
- Safe portfolio wording: **“Observability and LLM optimization — making AI systems easier to understand, measure and improve.”** This is positioning based on the user's stated focus.
- Need confirmation: project title, implemented capabilities, public URL, screenshots, intended audience, and real latency/cost/quality measurements.
- Do not present illustrative request timings, savings, model comparisons, uptime or throughput as achieved results. Label interactive sample traces as simulated.

### AIDA

- The public [AIDA repository](https://github.com/gshyam46/AIDA) contains frontend and backend source, and its [README](https://github.com/gshyam46/AIDA/blob/main/README.md) documents a natural-language-to-SQL MVP for SQLite.
- Documented stack: Next.js/React, FastAPI, SQLite and LiteLLM. The tree includes the corresponding frontend components and backend pipeline modules.
- Documented sequence: semantic parsing, normalization, validation, SQL compilation and execution. The UI exposes intermediate interpretation and generated SQL.
- Documented boundaries: read-only parameterized queries, basic single-table queries and aggregations; joins, subqueries and write operations are outside the README's v0 scope.
- Safe portfolio wording: **“A transparent natural-language-to-SQL pipeline that turns questions into validated, read-only SQLite queries.”**
- This project was inspected as source material; its application tests were not executed during portfolio content research.
- Do not reuse `constants/publications.ts` to claim a peer-reviewed publication: it says preprint / independent research and points to `example.com`.

## Career source and display chronology

The owner explicitly confirmed the following dates. They also agree with the live portfolio's public `GHANASHYAM_G.pdf` and the supplied local `resume/GHANASHYAM_G.pdf`. The latest instruction is to show **years only**, in chronological order, while keeping month-level facts in this source record.

| Company | Role | Confirmed source dates | Website label |
| --- | --- | --- | --- |
| ContentEaseAI | Software Developer Intern | May 2023 – November 2023 | 2023 |
| Vizares | Software Developer Intern | December 2024 – June 2025 | 2024–25 |
| Codifinary Technologies / CodeXray | Software Developer, contract | June 2025 – August 2025 | 2025 |
| Oracle | Associate Consultant | August 2025 – Present | 2025–Present |

The supplied `constants/experience.ts` incorrectly repeats June–August 2025 for Vizares and ContentEaseAI. The 2023 portfolio's older `constants.js` also has an incomplete, conflicting ContentEaseAI snapshot. Explicit owner confirmation takes precedence over those entries. ContentEaseAI remains **2023**, without extending it into 2024.

The expanded experience panels use contributions, locations, and technologies from `constants/experience.ts` and the verified résumé sources. Oracle detail describes OHI product enablement and implementation tasks, policy/claims/billing workflows, enterprise testing, and OCI/AI training. CodeXray and Vizares explain observability work; ContentEaseAI explains the AI browser-extension workflow, summarization, caching, and access controls. The panels do not add unsourced performance metrics, client counts, awards, or hiring availability.

The selected skills follow the owner's latest supplied profile and approved curation: Software engineering (Python, Go, Java, SQL), Applied AI (LLM integration, agentic workflows, automation, model evaluation), and Observability (OpenTelemetry, SkyWalking, telemetry pipelines). Technology-specific experience details remain available inside the career panels. These communicate the stated practice, not independently assessed proficiency levels. No skill scores or proficiency percentages are invented.

The Practice illustration depicts a conceptual software architecture with 15 components: interface, identity, API boundary, event intake, application services, agent orchestration, queue, retrieval, model gateway, workers, primary data, vector index, cache, tools, and integrations. Vision is the introductory intent; observability spans the system. Moving signals illustrate requests, responses, and asynchronous work. These components are not a claim about a particular deployed stack. Relay, LLM observability, and AIDA remain the selected projects. The fourth Practice principle, Product craft, expresses a working approach to usability, evaluation, and dependable delivery, without adding employment or outcome claims.

## Excluded template material

- **`public/resume.pdf` belongs to HTET MYAT, not Ghanashyam.** PDF text extraction identifies that name, another person's contact details and a Yangon location. Do not offer this file as Ghanashyam's CV or copy any of its facts.
- The older `Bio` object's CV links returned HTTP 404. A valid public résumé was subsequently found on the live site and used to resolve content, but the owner then **cancelled the résumé feature entirely**. Do not add a résumé button, viewer, download action, or replacement public PDF for this iteration. The user's local résumé remains untouched.
- `components/Footer.tsx` contains another template's email and “WebChain Dev” copyright. Neither belongs in the new portfolio.
- `constants/projects.ts` was excluded as instructed because it contains placeholder project material.
- Generic certificate-provider homepage URLs do not verify individual credentials. Do not claim verified certificates from those links alone.

## Publication checklist

The MVP can use the sourced identity, owner-confirmed email and dates, professional focus, Relay description, AIDA overview, and links above. Current-project implementation details and evidence for measurable outcomes remain outstanding. Live inbox delivery through the existing EmailJS service has not been verified. The résumé feature is intentionally outside scope. The website's design may aspire to awards; no award-winning claim is substantiated by the reviewed sources.
