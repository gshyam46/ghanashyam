export type ProjectId = "relay" | "observability" | "aida";

export const profile = {
  name: "Ghanashyam G",
  role: "AI software engineer",
  github: "https://github.com/gshyam46",
  linkedin: "https://www.linkedin.com/in/ghanashyam-45844624a/",
  email: "gshyam2603@gmail.com",
};

export const projects = [
  {
    id: "relay" as ProjectId,
    number: "01",
    name: "Relay",
    category: "LEAD INTELLIGENCE · AUTOMATION",
    headline: "From scattered signals\nto meaningful connections.",
    description: "AI-powered lead intelligence and outbound automation. Bringing research, context, and the next useful action into one connected workflow.",
    focus: ["Lead intelligence", "AI integration", "Automation"],
    source: "",
    sourceLabel: "",
    live: "https://relay.ghanashyam.dev",
    liveLabel: "Visit Relay",
    detail: "A connected approach to finding and understanding potential customers. This exhibit explores the lead intelligence workflow: collecting signals, building context, and preparing a considered next step.",
    principle: "Useful automation starts with better context.",
  },
  {
    id: "observability" as ProjectId,
    number: "02",
    name: "Sillage",
    category: "AI OBSERVABILITY · COST & RELIABILITY",
    headline: "Understand the evidence\nyour AI leaves behind.",
    description: "Understanding cost and reliability problems in AI workflows. Connecting model calls, timing, usage, and failure evidence into a legible account of what an AI application actually did.",
    focus: ["OpenTelemetry", "Cost & reliability", "Incident detection"],
    source: "",
    sourceLabel: "",
    live: "https://sillage.ghanashyam.dev",
    liveLabel: "Visit Sillage",
    detail: "Sillage reads execution traces and turns them into a legible account of a system's behaviour: where time is spent, how context grows, and where a cost or reliability problem begins. Early and still evolving, built with the same care as production software.",
    principle: "You can improve what you can understand.",
  },
  {
    id: "aida" as ProjectId,
    number: "03",
    name: "AIDA",
    category: "NATURAL LANGUAGE · DATA SYSTEMS",
    headline: "A simpler conversation\nwith complex data.",
    description: "A transparent natural-language-to-SQL pipeline. From semantic interpretation to validated, read-only queries, with the intermediate steps open for inspection.",
    focus: ["FastAPI", "Next.js", "SQLite"],
    source: "",
    sourceLabel: "",
    live: "https://aida.ghanashyam.dev",
    liveLabel: "Visit AIDA",
    detail: "AIDA turns natural language into executable SQL through explicit stages: semantic parsing, normalization, validation, compilation, and execution. Read-only, parameterized queries keep the execution boundary clear.",
    principle: "Intelligence should make its reasoning inspectable.",
  },
];

export const practice = [
  { number: "01", name: "Systems engineering", detail: "Start with the whole system. Understand the boundaries, the failure modes, and the people who will depend on it.", tags: "ARCHITECTURE / DISTRIBUTED SYSTEMS / INTEGRATION" },
  { number: "02", name: "Applied intelligence", detail: "Put intelligence where it is useful. Connect models, tools, and context into agentic workflows with a clear purpose.", tags: "AGENTIC SYSTEMS / AI INTEGRATION / AUTOMATION" },
  { number: "03", name: "Operational clarity", detail: "Make behavior visible. Connect traces, metrics, and logs so that understanding a system becomes part of operating it.", tags: "OBSERVABILITY / TELEMETRY / LLM OPTIMIZATION" },
];

export const experience = [
  {
    company: "Oracle", fullCompany: "Oracle", role: "Associate Consultant", period: "2025–Present", location: "Bengaluru · Hybrid",
    description: "A year building, releasing, and supporting Oracle Health Insurance software in production.",
    highlights: [
  "Work with clients to turn requirements into scalable backend solutions across Policy, Claims, and Gateway modules, using Java and Groovy.",
  "Build premium calculations, policy rules, validations, and lifecycle logic, along with claims workflows covering sum insured, adjudication, and accumulator tracking.",
  "As part of the Forward Deployed Implementation team, take end-to-end ownership of high-priority production issues under tight deadlines, delivering fixes through JUnit testing, validation, and deployment.",
  "Optimise Oracle SQL queries for high-volume transactions and improve the efficiency of datasets and reports, and build client dashboards and documentation that make ongoing support and audit preparation simpler.",
  "Use AI-assisted development to reduce debugging time, write more efficient code, and improve traceability across database schemas, APIs, and business flows, while working within compliance requirements."
],
    technologies: ["Java", "Oracle SQL", "Groovy", "JUnit", "OCI", "RAG", "AI assisted development"],
  },
  {
    company: "CodeXray", fullCompany: "Codifinary Technologies · CodeXray", role: "Software Developer · Contract", period: "2025", location: "Remote",
    description: "Observability across distributed applications with OpenTelemetry and SkyWalking.",
    highlights: [
      "Owned proof-of-concepts from solution research and architecture through backend implementation, frontend integration, and deployment.",
      "Designed a reusable observability solution with OpenTelemetry, SkyWalking agents, and transformers across multiple applications.",
      "Standardized metrics, traces, and logs across distributed systems to improve diagnostics.",
      "Worked with clients on requirements, solution demonstrations, deployment, and team training.",
    ],
    technologies: ["OpenTelemetry", "SkyWalking", "Distributed tracing", "Backend systems", "System design"],
  },
  {
    company: "Vizares", fullCompany: "Vizares", role: "Software Developer Intern", period: "2024–25", location: "Bengaluru",
    description: "Telemetry pipelines and dashboards with Go, Vue.js, and OpenTelemetry.",
    highlights: [
      "Led core feature development for an observability platform using Go, Vue.js, OpenTelemetry, eBPF, and node exporters.",
      "Built real-time telemetry pipelines and dashboards for time-series data, traces, and custom visualizations.",
      "Delivered end-user monitoring, executive and custom dashboards, trace views, application views, and instance views.",
      "Built Docker-based microservices for telemetry ingestion and metric storage, and mentored fellow interns.",
    ],
    technologies: ["Go", "Vue.js", "OpenTelemetry", "eBPF", "Prometheus", "ClickHouse", "PostgreSQL", "Docker"],
  },
  {
    company: "ContentEaseAI", fullCompany: "ContentEaseAI", role: "Software Developer Intern", period: "2023", location: "Tempe, Arizona · Remote",
    description: "AI-powered content workflows, backend integration, and caching.",
    highlights: [
      "Developed a key feature for an AI-powered browser extension with Vue.js, FastAPI, and AWS.",
      "Connected interactive website data collection with AI-driven content summarization.",
      "Used MapReduce for long-context summarization and Redis caching to avoid redundant computation.",
      "Implemented authentication, authorization, role-based access, payments, and session management.",
    ],
    technologies: ["FastAPI", "Vue.js", "AWS", "Redis", "LLMs", "MapReduce", "RBAC"],
  },
].reverse();

export const skillGroups = [
  { name: "Software engineering", tools: "Python · Go · Java · SQL" },
  { name: "Applied AI", tools: "LLM integration · Agentic workflows · Automation · Model evaluation" },
  { name: "Observability", tools: "OpenTelemetry · SkyWalking · Telemetry pipelines" },
];
