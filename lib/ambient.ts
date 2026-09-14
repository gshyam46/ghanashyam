"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_VOLUME = 30;
// Touch chimes must read as a clear foreground accent over the ambient bed, not blend into it.
const INTERACTION_PEAK = 0.08;

/** An original, quiet D-major soundscape. No media files or third-party audio. */
export function useAmbientSound() {
  const [enabled, setEnabled] = useState(false);
  const [available, setAvailable] = useState(true);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const context = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const enabledRef = useRef(false);
  const volumeRef = useRef(DEFAULT_VOLUME);
  const lastTone = useRef(0);

  const initialize = useCallback(() => {
    if (context.current) return context.current;
    if (!window.AudioContext) { setAvailable(false); return null; }
    const ctx = new AudioContext();
    const output = ctx.createGain();
    output.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    filter.connect(output);
    output.connect(ctx.destination);
    // Slowly breathing, consonant voices. No abrupt loops, percussion, or speech.
    [146.832, 220, 293.665, 369.994, 440].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index % 2 === 0 ? -3 : 3;
      const voice = ctx.createGain();
      voice.gain.value = index === 0 ? 0.055 : 0.02;
      const breath = ctx.createOscillator();
      breath.frequency.value = 0.025 + index * 0.011;
      const depth = ctx.createGain();
      depth.gain.value = 0.015;
      breath.connect(depth);
      depth.connect(voice.gain);
      oscillator.connect(voice);
      voice.connect(filter);
      oscillator.start();
      breath.start();
    });
    // Mobile browsers can drop a running context back to suspended/interrupted on their own
    // (audio-session interruptions, backgrounding); reclaim it without waiting for another tap.
    ctx.addEventListener("statechange", () => {
      if (enabledRef.current && !document.hidden && ctx.state !== "running") void ctx.resume().catch(() => {});
    });
    context.current = ctx;
    master.current = output;
    return ctx;
  }, []);

  const toggle = useCallback(async () => {
    try {
      const ctx = initialize();
      if (!ctx || !master.current) return;
      await ctx.resume();
      const next = !enabledRef.current;
      enabledRef.current = next;
      setEnabled(next);
      master.current.gain.cancelScheduledValues(ctx.currentTime);
      master.current.gain.setTargetAtTime(next ? volumeRef.current / 100 : 0, ctx.currentTime, 0.65);
    } catch { setAvailable(false); setEnabled(false); enabledRef.current = false; }
  }, [initialize]);

  const changeVolume = useCallback((value: number) => {
    volumeRef.current = value;
    setVolume(value);
    if (context.current && master.current && enabledRef.current) {
      master.current.gain.setTargetAtTime(value / 100, context.current.currentTime, 0.2);
    }
  }, []);

  const chime = useCallback((step = 0) => {
    const ctx = context.current;
    if (!ctx || !master.current || !enabledRef.current || ctx.state !== "running") return;
    if (ctx.currentTime - lastTone.current < 0.13) return;
    lastTone.current = ctx.currentTime;
    const note = ctx.createOscillator();
    const envelope = ctx.createGain();
    note.frequency.value = [587.33, 659.25, 739.99, 880][step % 4];
    envelope.gain.setValueAtTime(0, ctx.currentTime);
    envelope.gain.linearRampToValueAtTime(INTERACTION_PEAK, ctx.currentTime + 0.025);
    envelope.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);
    note.connect(envelope);
    envelope.connect(master.current);
    note.start();
    note.stop(ctx.currentTime + 0.9);
    note.onended = () => { note.disconnect(); envelope.disconnect(); };
  }, []);

  useEffect(() => {
    const visibility = () => {
      const ctx = context.current;
      if (!ctx) return;
      if (document.hidden) void ctx.suspend().catch(() => {});
      else if (enabledRef.current) void ctx.resume().catch(() => {});
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      void context.current?.close().catch(() => {});
      context.current = null;
      master.current = null;
    };
  }, []);

  return { enabled, available, volume, toggle, changeVolume, chime };
}
