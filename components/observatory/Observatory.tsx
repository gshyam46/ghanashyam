"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Mail, Pause, Play, Settings2, Volume2, VolumeX, X } from "lucide-react";
import { practice, profile, projects, skillGroups } from "@/data/portfolio";
import { useAmbientSound } from "@/lib/ambient";
import ProjectDemo from "./ProjectDemo";
import Atmosphere from "./Atmosphere";
import Cursor from "./Cursor";
import TouchLight from "./TouchLight";
import ScrollMotion from "./ScrollMotion";
import LoadingScreen from "./LoadingScreen";
import SystemMap from "./SystemMap";
import ExperienceDetails from "./ExperienceDetails";
import ContactNote from "./ContactNote";
import TechnologyMarquee from "./TechnologyMarquee";
import EnergyFlux from "./EnergyFlux";

const Sculpture = dynamic(() => import("./Sculpture"), { ssr: false });
const chapters = [
  { id: "signal", name: "The signal", short: "Overview" },
  { id: "systems", name: "Selected systems", short: "Work" },
  { id: "practice", name: "The practice", short: "About" },
  { id: "contact", name: "An open channel", short: "Contact" },
] as const;
type Scene = typeof chapters[number]["id"];
type Palette = "copper" | "silver" | "ink";
const treatments: { id: Palette; name: string; caption: string; note: string }[] = [
  { id: "copper", name: "Observatory", caption: "Warm metal. Quiet depth.", note: "01 / COPPER" },
  { id: "ink", name: "Field notes", caption: "Paper, graphite, clarity.", note: "02 / GRAPHITE" },
  { id: "silver", name: "After hours", caption: "Silver in the blue hour.", note: "03 / SILVER" },
];

function Mark({ className = "" }: { className?: string }) {
  return <svg className={className} width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden="true"><ellipse cx="20" cy="20" rx="17" ry="9" transform="rotate(-40 20 20)" stroke="currentColor" strokeWidth="1.3"/><ellipse cx="20" cy="20" rx="17" ry="9" transform="rotate(40 20 20)" stroke="currentColor" strokeWidth="1.3"/><circle cx="20" cy="20" r="2.5" fill="currentColor"/></svg>;
}

function Github({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.3 6.2-1.5 6.2-6.9A5.4 5.4 0 0 0 18.8 4a5 5 0 0 0-.1-4s-1.2-.4-4 1.5a13.4 13.4 0 0 0-7 0C4.9-.4 3.7 0 3.7 0a5 5 0 0 0-.1 4 5.4 5.4 0 0 0-1.5 3.8c0 5.4 3.2 6.6 6.2 6.9a3.4 3.4 0 0 0-.9 2.7V22" transform="translate(2 2) scale(.85)" /></svg>;
}

function Linkedin({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="9" width="4" height="12" rx=".5"/><circle cx="5" cy="4" r="2"/><path d="M11 21V9h4v2c1-3 6-3 6 2v8h-4v-7c0-2-2-2-2 0v7z"/></svg>;
}

export default function Observatory() {
  const [scene, setScene] = useState<Scene>("signal");
  const [palette, setPalette] = useState<Palette>("copper");
  const [paused, setPaused] = useState(false);
  const [projectIndex, setProjectIndex] = useState(0);
  const [principle, setPrinciple] = useState(0);
  const [time, setTime] = useState("INDIA / IST");
  const [dialogOpen, setDialogOpen] = useState(false);
  const projectDialog = useRef<HTMLDialogElement>(null);
  const settingsDialog = useRef<HTMLDialogElement>(null);
  const indexDialog = useRef<HTMLDialogElement>(null);
  const audio = useAmbientSound();
  const currentProject = projects[projectIndex];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPaused(preference.matches);
    const handleMotion = (event: MediaQueryListEvent) => setPaused(event.matches);
    preference.addEventListener("change", handleMotion);
    try {
      const saved = new URLSearchParams(window.location.search).get("theme") || localStorage.getItem("observatory-material");
      if (saved === "copper" || saved === "silver" || saved === "ink") setPalette(saved);
    } catch { /* Storage is optional. */ }
    const updateTime = () => setTime(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()) + " IST");
    updateTime();
    const timer = setInterval(updateTime, 30000);
    let sceneFrame = 0;
    const measureScene = () => {
      sceneFrame = 0;
      const marker = window.innerHeight * .45;
      let active: Scene = "signal";
      chapters.forEach(({ id }) => {
        if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= marker) active = id;
      });
      setScene(active);
    };
    const scheduleScene = () => { if (!sceneFrame) sceneFrame = requestAnimationFrame(measureScene); };
    // Re-evaluate every chapter after reflow; a tall chapter may remain visible
    // while another enters and leaves without generating a new entry for it.
    const observer = new IntersectionObserver(scheduleScene, { rootMargin: "-35% 0px -45% 0px", threshold: 0 });
    chapters.forEach(({ id }) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    window.addEventListener("scroll", scheduleScene, { passive: true });
    window.addEventListener("resize", scheduleScene, { passive: true });
    scheduleScene();
    const hero = document.querySelector<HTMLElement>(".hero-copy");
    const root = document.querySelector<HTMLElement>(".observatory");
    const measureArtwork = () => {
      if (hero && root) root.style.setProperty("--mobile-art-top", `${hero.offsetTop + hero.offsetHeight + 10}px`);
      scheduleScene();
    };
    const resizeObserver = new ResizeObserver(measureArtwork);
    if (hero) resizeObserver.observe(hero);
    void document.fonts.ready.then(measureArtwork);
    return () => {
      observer.disconnect(); resizeObserver.disconnect();
      cancelAnimationFrame(sceneFrame); clearInterval(timer);
      window.removeEventListener("scroll", scheduleScene); window.removeEventListener("resize", scheduleScene);
      preference.removeEventListener("change", handleMotion);
    };
  }, []);

  const openDialog = useCallback((dialog: HTMLDialogElement | null) => {
    if (!dialog) return;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback((dialog: HTMLDialogElement | null) => {
    dialog?.close();
    document.body.style.overflow = "";
    setDialogOpen(false);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement)?.tagName;
      if (event.defaultPrevented || ["INPUT", "TEXTAREA", "SELECT"].includes(tag) || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.toLowerCase() === "k" && !document.querySelector("dialog[open]")) {
        event.preventDefault(); openDialog(indexDialog.current);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openDialog]);

  const navigate = (id: Scene) => {
    closeDialog(indexDialog.current);
    audio.chime(chapters.findIndex((chapter) => chapter.id === id));
    document.getElementById(id)?.scrollIntoView({ behavior: paused ? "instant" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  const changePalette = (value: Palette) => {
    setPalette(value);
    audio.chime(treatments.findIndex((treatment) => treatment.id === value));
    try { localStorage.setItem("observatory-material", value); } catch { /* Storage is optional. */ }
    const url = new URL(window.location.href);
    url.searchParams.set("theme", value);
    history.replaceState(null, "", url);
  };

  const onDialogClose = () => { document.body.style.overflow = ""; setDialogOpen(false); };

  return (
    <div className="observatory" data-palette={palette} data-motion={paused ? "still" : "flow"}>
      <LoadingScreen />
      <a className="skip-link" href="#systems">Skip to selected work</a>
      <div className="grain" aria-hidden="true" />
      <Atmosphere paused={paused || dialogOpen} scene={scene} palette={palette} />
      <Cursor paused={paused} />
      <TouchLight paused={paused || dialogOpen} palette={palette} />
      <ScrollMotion paused={paused || dialogOpen} />
      <div className="page-guides" aria-hidden="true"><i /><i /></div>
      <div className="sculpture-layer" data-scene={scene} inert={scene !== "signal"}>
        <Sculpture scene={scene} palette={palette} paused={paused || dialogOpen} />
      </div>

      <header className="site-header">
        <a className="identity" href="#signal" onClick={(event) => { event.preventDefault(); navigate("signal"); }} aria-label="Ghanashyam G, back to overview">
          <Mark />
          <span><strong>GHANASHYAM G.</strong><span>AI SOFTWARE ENGINEER</span></span>
        </a>
        <button className="edition" onClick={() => openDialog(settingsDialog.current)} aria-label="Choose a visual direction"><span className="status-dot" /> {treatments.find(treatment => treatment.id === palette)?.name.toUpperCase()} <span className="edition-number">— {String(treatments.findIndex(treatment => treatment.id === palette) + 1).padStart(2, "0")} / 03</span><ChevronDown size={11} /></button>
        <div className="header-actions">
          <button className="index-trigger" onClick={() => openDialog(indexDialog.current)}>Index <span className="keycap">K</span></button>
          <a className="contact-link" href="#contact" onClick={(event) => { event.preventDefault(); navigate("contact"); }}>Let’s talk <ArrowUpRight size={16} /></a>
        </div>
      </header>

      <main id="main-content">
        <section className="chapter signal-section" id="signal" aria-labelledby="signal-title">
          <div className="hero-copy">
            <p className="eyebrow intro-reveal"><span className="little-cross">+</span> SYSTEMS THINKING. HUMAN OUTCOMES.</p>
            <h1 id="signal-title" className="intro-reveal">Engineering<br />the <em>invisible.</em></h1>
            <div className="hero-description intro-reveal">
              <span className="text-rule" />
              <p>I’m Ghanashyam. I build intelligent systems<br className="desktop-break" /> that connect complexity to something useful.</p>
            </div>
            <div className="hero-cta intro-reveal">
              <button className="round-link" onClick={() => navigate("systems")}><span className="circle-button"><ArrowDown size={18} /></span> Explore my work <span className="mini-count">[03]</span></button>
            </div>
          </div>
          <div className="mobile-art-space" aria-hidden="true" />
          <div className="artifact-caption" aria-hidden="true"><span className="artifact-line" /><span>FIG. 001</span><strong>The armillary</strong><span>INDEPENDENT PARTS. SHARED DIRECTION.</span></div>
          <div className="artifact-interaction"><span className="orbit-symbol">◎</span> DRAG THE FORM TO EXPLORE</div>
          <div className="hero-bottom"><span>AI INTEGRATION <i /> AGENTIC SYSTEMS <i /> OBSERVABILITY</span><span className="hero-note">A little curiosity goes a long way. <span>↘</span></span></div>
          <span className="margin-number" aria-hidden="true">01 — 04</span>
        </section>

        <section className="chapter systems-section" id="systems" aria-labelledby="systems-title">
          <div className="section-topline"><p className="eyebrow"><span className="little-cross">+</span> 02 / SELECTED SYSTEMS</p><span className="section-note">A FEW THINGS I’M THINKING THROUGH & BUILDING</span></div>
          <div className="work-heading"><h2 id="systems-title">Ideas, <em>in operation.</em></h2><p>The interesting part is how it works.<br /> Go ahead. Look inside.</p></div>
          <div className="project-tabs" role="tablist" aria-label="Selected systems">
            <div className="signal-sweep" aria-hidden="true"><i /></div>
            {projects.map((project, index) => <button key={project.id} role="tab" aria-selected={projectIndex === index} aria-controls="project-exhibit" id={`tab-${project.id}`} tabIndex={projectIndex === index ? 0 : -1} onClick={() => { setProjectIndex(index); audio.chime(index); }} onKeyDown={(event) => {
              let next = index;
              if (event.key === "ArrowRight") next = (index + 1) % projects.length;
              else if (event.key === "ArrowLeft") next = (index + projects.length - 1) % projects.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = projects.length - 1;
              else return;
              event.preventDefault(); setProjectIndex(next); document.getElementById(`tab-${projects[next].id}`)?.focus(); audio.chime(next);
            }}><span>{project.number}</span>{project.name}<ArrowUpRight size={17} /></button>)}
          </div>
          <div id="project-exhibit" className="project-exhibit" role="tabpanel" aria-labelledby={`tab-${currentProject.id}`}>
            <div className="project-story" key={currentProject.id}>
              <p className="eyebrow accent-text">{currentProject.category}</p>
              <h3>{currentProject.headline}</h3>
              <p className="project-description">{currentProject.description}</p>
              <div className="project-tags">{currentProject.focus.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <button className="text-link" onClick={() => { openDialog(projectDialog.current); audio.chime(projectIndex); }}>Inspect the system <ArrowUpRight size={18} /></button>
            </div>
            <div className="project-preview"><ProjectDemo project={currentProject.id} onInteract={() => audio.chime(projectIndex)} /></div>
          </div>
          <div className="section-footnote"><span>SELECT A SYSTEM. FOLLOW THE SIGNAL.</span><span>INDEPENDENT PROJECTS & ONGOING EXPLORATIONS ↗</span></div>
          <EnergyFlux paused={paused || dialogOpen} palette={palette} />
        </section>

        <section className="chapter practice-section" id="practice" aria-labelledby="practice-title">
          <div className="section-topline"><p className="eyebrow"><span className="little-cross">+</span> 03 / THE PRACTICE</p><span className="section-note">THE THINKING BEHIND THE THINGS</span></div>
          <div className="practice-layout">
            <div className="practice-intro"><h2 id="practice-title">See the whole.<br /><em>Care for the details.</em></h2><p>I work where software engineering meets applied AI. My interest is in the connective tissue: how systems communicate, how agents act, and how we understand what happens in between.</p><dl className="practice-toolkit" aria-label="Selected skills">{skillGroups.map(group => <div key={group.name}><dt>{group.name}</dt><dd>{group.tools}</dd></div>)}</dl><a className="text-link" href={profile.github} target="_blank" rel="noreferrer">Explore my GitHub <ArrowUpRight size={17} /></a></div>
            <div className="principles">
              {practice.map((item, index) => <div className={`principle ${principle === index ? "is-open" : ""}`} key={item.number}>
                <h3><button aria-expanded={principle === index} aria-controls={`principle-${index}`} onClick={() => { setPrinciple(principle === index ? -1 : index); audio.chime(index); }}><span>{item.number}</span>{item.name}<span className="principle-plus">{principle === index ? "−" : "+"}</span></button></h3>
                <div id={`principle-${index}`} className="principle-body" hidden={principle !== index}><p>{item.detail}</p><span>{item.tags}</span></div>
              </div>)}
            </div>
          </div>
          <SystemMap paused={paused || dialogOpen} />
          <div className="experience-heading"><span className="eyebrow">A FEW PLACES ALONG THE WAY</span><span className="section-note">EXPERIENCE / 2023 — PRESENT</span></div>
          <ExperienceDetails onOpenChange={setDialogOpen} onInteract={() => audio.chime(2)} />
        </section>

        <TechnologyMarquee paused={paused || dialogOpen} />

        <section className="chapter contact-section" id="contact" aria-labelledby="contact-title">
          <div className="section-topline"><p className="eyebrow"><span className="little-cross">+</span> 04 / AN OPEN CHANNEL</p><span className="section-note">GOOD THINGS START WITH A CONVERSATION</span></div>
          <div className="contact-content"><p className="contact-kicker">HAVE SOMETHING INTERESTING IN MIND?</p><h2 id="contact-title">Let’s build<br /><em>together.</em><ArrowUpRight className="contact-arrow" /></h2><p className="contact-description">A system to untangle. An idea to bring to life.<br />A conversation about what comes next.</p>
            <div className="contact-buttons"><a href={profile.email ? `mailto:${profile.email}` : profile.linkedin} target={profile.email ? undefined : "_blank"} rel="noreferrer" className="primary-button">Start a conversation {profile.email ? <Mail size={18} /> : <ArrowUpRight size={18} />}</a><a className="social-button" href={profile.github} target="_blank" rel="noreferrer" aria-label="Ghanashyam on GitHub"><Github size={20} /></a><a className="social-button" href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="Ghanashyam on LinkedIn"><Linkedin size={20} /></a></div>
          </div>
          <ContactNote onOpenChange={setDialogOpen} onInteract={() => audio.chime(3)} />
          <div className="signoff"><span>GHANASHYAM G. <i>© {new Date().getFullYear()}</i></span><span>THOUGHTFULLY ENGINEERED. ALWAYS EVOLVING.</span><button onClick={() => navigate("signal")}>Back to the beginning <ArrowRight size={15} /></button></div>
        </section>
      </main>

      <footer className="experience-bar">
        <div className="footer-location"><span className="status-dot" /><span>BASED IN INDIA</span><span className="local-time">{time}</span></div>
        <nav className="chapter-nav" aria-label="Chapters">{chapters.map((chapter, index) => <a key={chapter.id} href={`#${chapter.id}`} aria-label={`${chapter.short}, chapter ${index + 1}`} onClick={(event) => { event.preventDefault(); navigate(chapter.id); }} aria-current={scene === chapter.id ? "location" : undefined}><span className="chapter-digit">0{index + 1}</span><span className="chapter-name">{chapter.short}</span></a>)}</nav>
        <div className="experience-controls"><button className={`sound-button ${audio.enabled ? "is-on" : ""}`} data-sound-toggle="true" data-audio-state={!audio.enabled ? "muted" : audio.volume === 0 ? "silent" : "playing"} onClick={audio.toggle} aria-pressed={audio.enabled} disabled={!audio.available} aria-label={audio.available ? (audio.enabled ? "Mute ambient sound" : "Enable ambient sound") : "Ambient sound unavailable"} title={audio.enabled ? `Ambient sound · ${audio.volume}%` : "Enable the original ambient sound"}><span className="sound-bars" aria-hidden="true"><i /><i /><i /><i /></span><span>{audio.enabled ? "SOUND ON" : "SOUND OFF"}</span></button><button className="settings-trigger" onClick={() => openDialog(settingsDialog.current)} aria-label="Open experience settings"><Settings2 size={17} /></button></div>
      </footer>

      <dialog className="experience-dialog index-dialog" ref={indexDialog} onClose={onDialogClose} onClick={(event) => { if (event.target === indexDialog.current) closeDialog(indexDialog.current); }} aria-labelledby="index-title"><div className="dialog-inner"><div className="dialog-top"><p className="eyebrow" id="index-title">A LITTLE ORIENTATION</p><button className="close-button" onClick={() => closeDialog(indexDialog.current)} aria-label="Close index"><X size={21} /></button></div><h2>Follow your <em>curiosity.</em></h2><nav className="index-list" aria-label="Site index">{chapters.map((chapter, index) => <button key={chapter.id} onClick={() => navigate(chapter.id)}><span>0{index + 1}</span>{chapter.name}<ArrowUpRight size={22} /></button>)}</nav><p className="dialog-footnote">SCROLL TO WANDER · K TO OPEN INDEX · ESC TO CLOSE</p></div></dialog>

      <dialog className="experience-dialog settings-dialog" ref={settingsDialog} onClose={onDialogClose} onClick={(event) => { if (event.target === settingsDialog.current) closeDialog(settingsDialog.current); }} aria-labelledby="settings-title"><div className="dialog-inner"><div className="dialog-top"><p className="eyebrow">MAKE YOURSELF AT HOME</p><button className="close-button" onClick={() => closeDialog(settingsDialog.current)} aria-label="Close experience settings"><X size={21} /></button></div><h2 id="settings-title">Set the <em>atmosphere.</em></h2><p className="settings-description">Three materials. A different feeling.<br />The same curious mind.</p><fieldset className="treatment-options"><legend className="eyebrow">VISUAL DIRECTION</legend>{treatments.map((treatment) => <label className={`treatment-option ${palette === treatment.id ? "selected" : ""}`} key={treatment.id}><input type="radio" name="material" value={treatment.id} checked={palette === treatment.id} onChange={() => changePalette(treatment.id)} /><span className={`material-swatch material-${treatment.id}`}><Mark /></span><span className="material-description"><strong>{treatment.name}</strong><span>{treatment.caption}</span></span><span className="material-check">{palette === treatment.id ? <Check size={17} /> : <span />}</span></label>)}</fieldset><div className="setting-row"><div><strong>Ambient sound</strong><span>A quiet, slowly breathing soundscape.</span></div><button className="toggle-button" data-sound-toggle="true" onClick={audio.toggle} disabled={!audio.available} aria-pressed={audio.enabled}>{audio.enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}{audio.enabled ? "On" : "Off"}</button></div><label className="volume-control">Volume <input type="range" min="0" max="70" value={audio.volume} onChange={(event) => audio.changeVolume(Number(event.target.value))} /><span>{audio.volume}%</span></label><div className="setting-row"><div><strong>Motion</strong><span>Let the form breathe, or enjoy a still moment.</span></div><button className="toggle-button" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? "Resume" : "Pause"}</button></div><p className="dialog-footnote">SOUND ALWAYS STARTS OFF. YOUR SPACE, YOUR PACE.</p></div></dialog>

      <dialog className="experience-dialog project-dialog" ref={projectDialog} onClose={onDialogClose} onClick={(event) => { if (event.target === projectDialog.current) closeDialog(projectDialog.current); }} aria-labelledby="project-dialog-title"><div className="dialog-inner"><div className="dialog-top"><p className="eyebrow">SYSTEM {currentProject.number} / A CLOSER LOOK</p><button className="close-button" onClick={() => closeDialog(projectDialog.current)} aria-label="Close system inspection"><X size={21} /></button></div><div className="inspection-heading"><h2 id="project-dialog-title">{currentProject.name}<span>↗</span></h2><span className="eyebrow accent-text">{currentProject.category}</span></div><p className="inspection-detail">{currentProject.detail}</p><ProjectDemo project={currentProject.id} expanded onInteract={() => audio.chime(projectIndex)} /><div className="inspection-bottom"><p>“{currentProject.principle}”</p>{currentProject.source ? <a className="text-link" href={currentProject.source} target="_blank" rel="noreferrer">{currentProject.sourceLabel}<ArrowUpRight size={17} /></a> : <button className="text-link" onClick={() => { closeDialog(projectDialog.current); navigate("contact"); }}>Talk about this work <ChevronRight size={17} /></button>}</div></div></dialog>
    </div>
  );
}
