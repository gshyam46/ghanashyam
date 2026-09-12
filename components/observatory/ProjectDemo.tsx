"use client";

import { useId, useState, type CSSProperties } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Database,
  FileSearch,
  GitBranch,
  Layers3,
  Network,
  ScanLine,
  SlidersHorizontal,
  Sparkles,
  Terminal,
} from "lucide-react";
import type { ProjectId } from "@/data/portfolio";
import Select from "./Select";
import "./project-demo.css";

interface ProjectDemoProps {
  project: ProjectId;
  expanded?: boolean;
  onInteract?: () => void;
}

const relayStages = [
  { name: "Source", icon: ScanLine, title: "Find the useful signal.", description: "A new engineering team suggests a changing set of needs." },
  { name: "Enrich", icon: Layers3, title: "Give the signal context.", description: "Connect the observation to what this company is building." },
  { name: "Qualify", icon: GitBranch, title: "Make a considered next move.", description: "Use explicit criteria to decide whether a conversation is useful." },
];

function RelayDemo({ onInteract }: Pick<ProjectDemoProps, "onInteract">) {
  const [stage, setStage] = useState(0);
  const content = relayStages[stage];
  const choose = (next: number) => { setStage(next); onInteract?.(); };

  return (
    <>
      <div className="demo-appbar">
        <span className="demo-appname"><Network size={15} aria-hidden="true" /> relay<span className="demo-app-divider">/</span><span className="demo-subtitle">intelligence studio</span></span>
        <span className="demo-tiny">WORKFLOW 01</span>
      </div>
      <div className="demo-relay-stages" aria-label="Lead intelligence stages">
        {relayStages.map(({ name, icon: Icon }, index) => (
          <button key={name} className={`demo-stage ${stage === index ? "demo-stage-active" : ""}`} type="button" aria-pressed={stage === index} onClick={() => choose(index)}>
            <span className="demo-stage-icon"><Icon size={16} aria-hidden="true" /></span>
            <span>{name}</span><span className="demo-stage-number">0{index + 1}</span>
          </button>
        ))}
      </div>
      <div className="demo-relay-record">
        <div className="demo-company-mark" aria-hidden="true">k<span>↗</span></div>
        <div><strong>Kestrel</strong><span>Example company · developer infrastructure</span></div>
        <span className="demo-record-code">AC—014</span>
      </div>
      <div className="demo-stage-content" key={stage}>
        <div className="demo-section-label">{stage === 0 ? "SIGNALS IN VIEW" : stage === 1 ? "CONNECTED CONTEXT" : "DECISION NOTES"}</div>
        <h4>{content.title}</h4>
        <p className="demo-description">{content.description}</p>
        {stage === 0 && (
          <div className="demo-signal-list">
            <div className="demo-signal demo-signal-selected"><FileSearch size={16} aria-hidden="true" /><span><strong>Engineering team expansion</strong><small>Careers page · example source</small></span><ArrowDownRight size={15} aria-hidden="true" /></div>
            <div className="demo-signal"><GitBranch size={16} aria-hidden="true" /><span><strong>New developer API</strong><small>Product changelog · example source</small></span><span className="demo-signal-dot" /></div>
          </div>
        )}
        {stage === 1 && (
          <div className="demo-context-grid">
            <div><span>WHAT CHANGED</span><strong>More services. More complexity.</strong></div>
            <div><span>RELEVANT NEED</span><strong>Visibility across the stack.</strong></div>
            <div className="demo-context-note"><span className="demo-note-line" />Two signals, one useful hypothesis.</div>
          </div>
        )}
        {stage === 2 && (
          <div className="demo-qualification">
            <div><Check size={13} aria-hidden="true" /><span>Technical fit</span><strong>Infrastructure team</strong></div>
            <div><Check size={13} aria-hidden="true" /><span>Relevant timing</span><strong>Active expansion</strong></div>
            <p><span className="demo-status-dot" /> Prepare research for a human review.</p>
          </div>
        )}
      </div>
      <div className="demo-bottom-bar"><span>CONTEXT BEFORE OUTREACH</span><button type="button" onClick={() => choose((stage + 1) % 3)}>{stage === 2 ? "Explore again" : "Next stage"}<ArrowRight size={14} aria-hidden="true" /></button></div>
    </>
  );
}

const traceDescriptions = [
  { name: "route.request", label: "ROUTING", description: "Choose the execution path before retrieving context." },
  { name: "retrieve.context", label: "RETRIEVAL", description: "Retrieve candidate context for this example request." },
  { name: "prepare.prompt", label: "CONTEXT", description: "Adjust the context budget below to change the prepared input." },
  { name: "llm.generate", label: "GENERATION", description: "This model uses a simple input-size relationship to illustrate latency." },
];

function ObservabilityDemo({ onInteract }: Pick<ProjectDemoProps, "onInteract">) {
  const [selected, setSelected] = useState(3);
  const [budget, setBudget] = useState(65);
  const budgetId = useId();
  const tokens = 1200 + budget * 56;
  const generation = Math.round(120 + tokens * 0.125);
  const duration = generation + 76;
  const spans = [
    { offset: 0, duration: 12 },
    { offset: 12, duration: 44 },
    { offset: 56, duration: 20 },
    { offset: 76, duration: generation },
  ];

  return (
    <>
      <div className="demo-appbar"><span className="demo-appname"><SlidersHorizontal size={15} aria-hidden="true" /> trace<span className="demo-app-divider">/</span><span className="demo-subtitle">request anatomy</span></span><span className="demo-tiny">SIMULATION</span></div>
      <div className="demo-trace-summary"><div><span className="demo-section-label">EXAMPLE EXECUTION</span><h4>research.agent <ArrowDownRight size={17} aria-hidden="true" /></h4></div><div className="demo-duration"><strong>{(duration / 1000).toFixed(2)}<span>s</span></strong><span>MODELLED LATENCY</span></div></div>
      <div className="demo-waterfall" aria-label="Simulated request trace. Select a span for details.">
        <div className="demo-waterfall-ruler" aria-hidden="true"><span>SPAN</span><div><span>0</span><span>{Math.round(duration / 2)} ms</span><span>{duration} ms</span></div></div>
        {traceDescriptions.map((trace, index) => (
          <button type="button" key={trace.name} className={`demo-trace-row ${selected === index ? "demo-trace-selected" : ""}`} aria-pressed={selected === index} aria-label={`${trace.name}, ${spans[index].duration} milliseconds, simulated`} onClick={() => { setSelected(index); onInteract?.(); }}>
            <span className="demo-trace-name"><span className="demo-trace-branch" aria-hidden="true" />{trace.name}</span>
            <span className="demo-trace-track"><span className="demo-trace-bar" style={{ left: `${spans[index].offset / duration * 100}%`, width: `${Math.max(3, spans[index].duration / duration * 100)}%` }} /><span className="demo-trace-value">{spans[index].duration} ms</span></span>
          </button>
        ))}
      </div>
      <div className="demo-trace-explanation" key={selected}><span>{traceDescriptions[selected].label}</span><p>{traceDescriptions[selected].description}</p></div>
      <div className="demo-budget-control">
        <div className="demo-budget-heading"><label htmlFor={budgetId}>Context budget</label><output htmlFor={budgetId}>{budget}% <span>·</span> {tokens.toLocaleString("en-US")} input tokens</output></div>
        <input id={budgetId} type="range" min="25" max="100" step="5" value={budget} aria-valuetext={`${budget} percent, ${tokens} simulated input tokens`} onChange={event => { setBudget(Number(event.target.value)); onInteract?.(); }} style={{ "--demo-range": `${(budget - 25) / 75 * 100}%` } as CSSProperties} />
        <div className="demo-slider-labels"><span>Less context</span><span>More context</span></div>
      </div>
      <div className="demo-bottom-bar demo-bottom-note"><span>ILLUSTRATIVE RELATIONSHIP · QUALITY IS NOT ESTIMATED</span></div>
    </>
  );
}

const queries = [
  {
    question: "Which orders are above $200?",
    sql: "SELECT id, customer, total\nFROM orders\nWHERE total > :minimum;",
    parameter: ":minimum = 200",
    columns: ["id", "customer", "total"],
    rows: [["1042", "Kestrel", "$280.00"], ["1045", "Folio", "$420.00"]],
  },
  {
    question: "What is the completed order revenue?",
    sql: "SELECT SUM(total) AS revenue\nFROM orders\nWHERE status = :status;",
    parameter: ':status = "completed"',
    columns: ["revenue"],
    rows: [["$825.00"]],
  },
  {
    question: "How many orders are pending?",
    sql: "SELECT COUNT(*) AS pending_orders\nFROM orders\nWHERE status = :status;",
    parameter: ':status = "pending"',
    columns: ["pending_orders"],
    rows: [["3"]],
  },
];

function AidaDemo({ onInteract }: Pick<ProjectDemoProps, "onInteract">) {
  const [selected, setSelected] = useState(0);
  const queryId = useId();
  const query = queries[selected];

  return (
    <>
      <div className="demo-appbar"><span className="demo-appname"><Database size={15} aria-hidden="true" /> aida<span className="demo-app-divider">/</span><span className="demo-subtitle">query workspace</span></span><span className="demo-tiny">SQLITE MODEL</span></div>
      <div className="demo-query-field"><label className="demo-section-label" htmlFor={queryId}>START WITH A QUESTION</label><div className="demo-query-select"><Sparkles size={16} aria-hidden="true" /><Select id={queryId} label="START WITH A QUESTION" value={String(selected)} options={queries.map((item, index) => ({ value: String(index), label: item.question }))} onChange={value => { setSelected(Number(value)); onInteract?.(); }} /></div></div>
      <div className="demo-query-pipeline" aria-label="Illustrated query pipeline"><span>Interpret</span><ArrowRight size={11} aria-hidden="true" /><span>Validate</span><ArrowRight size={11} aria-hidden="true" /><span>Compile</span><span className="demo-readonly"><Check size={11} aria-hidden="true" /> Read-only</span></div>
      <div className="demo-query-output" key={selected}>
        <div className="demo-sql-header"><span><Terminal size={12} aria-hidden="true" /> PREPARED SQL</span><span>orders.sqlite</span></div>
        <pre className="demo-sql"><code>{query.sql.split(/\b(SELECT|FROM|WHERE|AS|SUM|COUNT)\b/g).map((token, index) => <span key={index} className={/^(SELECT|FROM|WHERE|AS|SUM|COUNT)$/.test(token) ? "demo-sql-keyword" : undefined}>{token}</span>)}</code></pre>
        <div className="demo-sql-parameter"><span>PARAMETER</span><code>{query.parameter}</code></div>
        <div className="demo-table-wrap"><table className="demo-table"><caption>Illustrative results for the selected example query</caption><thead><tr>{query.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead><tbody>{query.rows.map((row, index) => <tr key={index}>{row.map((value, column) => <td key={column}>{value}</td>)}</tr>)}</tbody></table></div>
      </div>
      <div className="demo-bottom-bar demo-bottom-note"><span>PREDEFINED EXAMPLES · NO DATABASE CONNECTED</span><span>{query.rows.length} {query.rows.length === 1 ? "ROW" : "ROWS"}</span></div>
    </>
  );
}

export default function ProjectDemo({ project, expanded = false, onInteract }: ProjectDemoProps) {
  return (
    <div className={`demo-shell demo-${project}${expanded ? " demo-expanded" : ""}`}>
      <div className="demo-window" aria-label={`${project === "relay" ? "Relay lead intelligence" : project === "observability" ? "LLM observability" : "AIDA query"} interactive illustration`}>
        {project === "relay" ? <RelayDemo onInteract={onInteract} /> : project === "observability" ? <ObservabilityDemo onInteract={onInteract} /> : <AidaDemo onInteract={onInteract} />}
      </div>
      <div className="demo-model-label"><span aria-hidden="true" />INTERACTIVE MODEL <span className="demo-label-separator">·</span> ILLUSTRATIVE DATA</div>
    </div>
  );
}
