# Contact and resume source verification

Reviewed 10 September 2026. Read-only inspection only: no contact submissions, delivery tests, or external messages were sent.

## Existing email delivery integration

The working integration recalled by the owner is present in the [older portfolio Contact component](https://github.com/gshyam46/gshyam46.github.io/blob/main/src/components/Contact/index.js). It calls EmailJS `sendForm` with service `service_pi20arf`, template `template_g6xdg9a`, and a public browser key. The key is kept in `data/contact-config.ts`, alongside its exact public source; it is not repeated in this document.

The existing template field contract is:

| Field | Meaning |
| --- | --- |
| `from_email` | Visitor reply email |
| `from_name` | Visitor name |
| `subject` | Message subject |
| `message` | Visitor message |

The [official EmailJS REST API documentation](https://www.emailjs.com/docs/rest-api/send/) specifies `POST https://api.emailjs.com/api/v1.0/email/send`, JSON content type, and top-level `service_id`, `template_id`, `user_id` (public key), and `template_params`. Map the four existing field names above into `template_params`. No private access token is required by that documented API contract. The [sendForm documentation](https://www.emailjs.com/docs/sdk/send-form/) confirms that form field names must correspond to template variables.

The actual recipient is configured in the owner's EmailJS template, which is not public. The public key and service/template identifiers establish the old route, but do not prove that its service connection, quota, recipient, or current allowed origins are operational. No successful delivery is claimed. An owner-requested inbox test is still needed before claiming live delivery.

The current [GitHub main Contact.tsx](https://github.com/gshyam46/portfolio/blob/main/components/Contact.tsx) has presentation only: no send handler. The [live portfolio](https://ghanashyamg.vercel.app) differs from that branch: its page bundle includes `sendForm` with `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, and `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`. Those references remain environment accesses in the inspected public bundle, rather than resolved values. Its service configuration cannot be recovered from that bundle. The older explicitly configured route is used for this implementation; no additional local environment setup is required for those public defaults. To replace the service later, change the three identifiers together to match the owner's dashboard.

## Verified public resume and email

The live portfolio's resume modal and download button both point to [GHANASHYAM_G.pdf](https://ghanashyamg.vercel.app/GHANASHYAM_G.pdf). The URL returned HTTP 200 and `application/pdf`; the retrieved file contains 243,608 bytes and one page. Text extraction verifies the title **GHANASHYAM G**, the owner's GitHub username, the reference portfolio URL, and the contact email **gshyam2603@gmail.com**.

The owner subsequently cancelled the resume UI and download entirely. The temporary public copy was removed, and no resume link should be exposed by this portfolio. The unrelated template `public/resume.pdf` was also deleted during the requested legacy cleanup. The verified resume is only a source for career detail.

The local `resume/GHANASHYAM_G.pdf` was also inspected. It confirms the same identity, email, and experience dates, but contains an internal-document header. The user's local file was left untouched. No PDF from either source is newly published.

All three resume URLs found in the old Bio object's six historical revisions returned HTTP 404. The current live PDF resolves that missing-resume problem.

## Experience dates resolved from the resume

Both the public live resume and local supplied resume agree on these dates. The owner subsequently explicitly confirmed these dates and `gshyam2603@gmail.com` during this task:

| Employer | Role | Dates |
| --- | --- | --- |
| Oracle | Associate Consultant | Aug 2025 - Present |
| Codifinary Technologies | Software Developer | Jun 2025 - Aug 2025 |
| Vizares | Software Developer Intern | Dec 2024 - Jun 2025 |
| ContentEaseAI | Software Developer Intern | May 2023 - Nov 2023 |

These override the duplicate Jun-Aug 2025 entries in [GitHub main experience.ts](https://github.com/gshyam46/portfolio/blob/main/constants/experience.ts). The [older Bio/data source](https://github.com/gshyam46/gshyam46.github.io/blob/main/src/data/constants.js), last modified in September 2023, lists ContentEaseAI as Aug 2023 - Present; it is an older conflicting snapshot. The two current resume sources provide the consistent full chronology used here. Month precision is preserved without inventing exact day boundaries.

## Oracle detail suitable for the experience expansion

The public resume describes structured enablement and Oracle Health Insurance product training in Java, Oracle SQL, Groovy, JUnit, and frontend technologies; hands-on labs and implementation tasks across policies, claims, and billing workflows; and enterprise testing practices. It also lists OCI Foundations, OCI AI, and OCI Generative AI credentials and supplementary coursework. Treat these as the owner's resume statements. The resume does not establish production impact metrics for this role, so none should be invented.
