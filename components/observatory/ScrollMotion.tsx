"use client";

import { useEffect } from "react";
import "./scroll-motion.css";

/** Native scroll owns navigation; only decorative opacity and translation change. */
export default function ScrollMotion({ paused }: { paused: boolean }) {
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const elements = document.querySelectorAll<HTMLElement>(".section-topline, .work-heading, .project-exhibit, .practice-layout, .experience-list, .contact-content, .conversation-starter");
    const sweep = document.querySelector<HTMLElement>(".signal-sweep");
    let sweepVisible = false;
    const updateSweep = () => {
      if (sweep) sweep.dataset.running = String(sweepVisible && !paused && !preference.matches && !document.hidden);
    };
    const getExitEdge = () => Math.round(Math.min(innerHeight * .18, (document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 88) + 24));
    let exitEdge = getExitEdge();
    const createReveal = () => new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const element = entry.target as HTMLElement;
        element.dataset.reveal = paused || preference.matches || entry.isIntersecting ? "shown"
          : entry.boundingClientRect.bottom < exitEdge ? "departed" : "pending";
      });
    }, { rootMargin: `-${exitEdge}px 0px -48px 0px`, threshold: 0 });
    let reveal = createReveal();
    const resize = () => {
      exitEdge = getExitEdge();
      reveal.disconnect();
      reveal = createReveal();
      elements.forEach(element => reveal.observe(element));
    };
    const light = new IntersectionObserver(entries => {
      sweepVisible = entries.some(entry => entry.isIntersecting);
      updateSweep();
    });
    elements.forEach(element => {
      // Start readable, including without JavaScript and when motion is paused.
      element.dataset.reveal = "shown";
      reveal.observe(element);
    });
    if (sweep) light.observe(sweep);
    const updatePreference = () => {
      elements.forEach(element => {
        element.dataset.reveal = "shown";
        reveal.unobserve(element);
        reveal.observe(element);
      });
      updateSweep();
    };
    updateSweep();
    preference.addEventListener("change", updatePreference);
    document.addEventListener("visibilitychange", updateSweep);
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      reveal.disconnect();
      light.disconnect();
      preference.removeEventListener("change", updatePreference);
      document.removeEventListener("visibilitychange", updateSweep);
      window.removeEventListener("resize", resize);
      elements.forEach(element => delete element.dataset.reveal);
      if (sweep) sweep.dataset.running = "false";
    };
  }, [paused]);
  return null;
}
