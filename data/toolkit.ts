// Owner-supplied toolkit, plus technologies already documented in the portfolio.
export const toolkitGroups = [
  { name: "Languages", tools: ["Python", "Java", "JavaScript", "Go", "Groovy"] },
  { name: "Backend", tools: ["FastAPI", "Flask", "Django", "Express.js", "Node.js", "REST APIs", "Microservices"] },
  { name: "AI & automation", tools: ["LLMs", "Agentic AI", "Workflow Automation", "Vector Databases", "Model Evaluation", "LangChain", "Langfuse", "RAG"] },
  { name: "Frontend", tools: ["React.js", "Next.js", "Vue.js"] },
  { name: "Databases", tools: ["MySQL", "PostgreSQL", "Oracle SQL", "MongoDB", "Redis", "Firebase", "ClickHouse"] },
  { name: "Observability", tools: ["Prometheus", "OpenTelemetry", "SkyWalking", "eBPF"] },
  { name: "Cloud", tools: ["AWS", "Azure", "Oracle Cloud (OCI)"] },
  { name: "Delivery", tools: ["Git", "Docker", "Kubernetes", "CI/CD", "Linux", "Nginx"] },
] as const;

export const toolkitRows = [
  [...toolkitGroups[0].tools, ...toolkitGroups[1].tools, ...toolkitGroups[3].tools, ...toolkitGroups[6].tools, ...toolkitGroups[7].tools],
  ["LangChain", "Langfuse", ...toolkitGroups[2].tools.filter(tool => tool !== "LangChain" && tool !== "Langfuse"), ...toolkitGroups[5].tools, ...toolkitGroups[4].tools],
];
