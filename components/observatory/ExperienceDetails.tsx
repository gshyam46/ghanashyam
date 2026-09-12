"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { experience } from "@/data/portfolio";
import "./experience-details.css";

export default function ExperienceDetails({ onOpenChange, onInteract }: { onOpenChange: (open: boolean) => void; onInteract: () => void }) {
  const [selected, setSelected] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const previousOverflow = useRef("");
  const item = experience[selected];

  useEffect(() => {
    if (dialog.current?.open) {
      dialog.current.scrollTop = 0;
      dialog.current.querySelector<HTMLElement>("#career-title")?.focus({ preventScroll: true });
    }
  }, [selected]);

  useEffect(() => () => {
    if (dialog.current?.open) document.body.style.overflow = previousOverflow.current;
  }, []);

  const inspect = (index: number) => {
    setSelected(index);
    previousOverflow.current = document.body.style.overflow;
    dialog.current?.showModal();
    document.body.style.overflow = "hidden";
    onOpenChange(true);
    onInteract();
  };
  const closed = () => { document.body.style.overflow = previousOverflow.current; onOpenChange(false); };
  const change = (direction: number) => { setSelected(index => (index + direction + experience.length) % experience.length); onInteract(); };

  return <>
    <div className="experience-list">
      {experience.map((job, index) => <article className="experience-item" key={job.company}>
        <span className="experience-period">{job.period}</span>
        <h3>{job.company}</h3><p>{job.role}</p>
        <span className="experience-detail">{job.description}</span>
        <button className="experience-inspect" onClick={() => inspect(index)} aria-label={`Read about ${job.fullCompany} experience`} aria-haspopup="dialog"><span>Look closer</span><ArrowUpRight size={15} /></button>
      </article>)}
    </div>
    <dialog ref={dialog} className="experience-dialog career-dialog" aria-labelledby="career-title" onClose={closed} onClick={event => { if (event.target === dialog.current) dialog.current?.close(); }}>
      <div className="dialog-inner">
        <div className="dialog-top"><p className="eyebrow">A CLOSER LOOK / EXPERIENCE {String(selected + 1).padStart(2, "0")}</p><button className="close-button" aria-label="Close experience details" onClick={() => dialog.current?.close()}><X size={20} /></button></div>
        <div className="career-content" key={selected}>
          <span className="career-date">{item.period}</span><h2 id="career-title" tabIndex={-1}>{item.company}<span aria-hidden="true">↗</span></h2>
          <p className="career-role">{item.role}</p><p className="career-location">{item.fullCompany !== item.company ? `${item.fullCompany} / ` : ""}{item.location}</p>
          <div className="career-contribution"><h3 className="eyebrow">THE WORK</h3><ul>{item.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul></div>
          <div className="career-tools"><h3 className="eyebrow">TOOLS & DISCIPLINES</h3><div>{item.technologies.map(tool => <span key={tool}>{tool}</span>)}</div></div>
        </div>
        <div className="career-pagination"><span>{String(selected + 1).padStart(2, "0")} / {String(experience.length).padStart(2, "0")}</span><div><button onClick={() => change(-1)} aria-label="Previous experience"><ChevronLeft size={18} /></button><button onClick={() => change(1)} aria-label="Next experience"><ChevronRight size={18} /></button></div></div>
      </div>
    </dialog>
  </>;
}
