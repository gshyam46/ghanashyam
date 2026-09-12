"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, LoaderCircle, Mail, Send, X } from "lucide-react";
import { profile } from "@/data/portfolio";
import { contactConfig } from "@/data/contact-config";
import Select from "./Select";
import "./contact-note.css";

export const noteTopics = [
  { value: "hello", label: "just saying hi" },
  { value: "ai", label: "an AI system" },
  { value: "opportunity", label: "an engineering opportunity" },
  { value: "collaboration", label: "an interesting collaboration" },
  { value: "observability", label: "observability & optimization" },
];

export default function ContactNote({ onOpenChange, onInteract }: { onOpenChange: (open: boolean) => void; onInteract: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const previousOverflow = useRef("");
  const submitting = useRef(false);
  const [topic, setTopic] = useState("hello");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState<"email" | "message" | null>(null);

  const open = () => {
    previousOverflow.current = document.body.style.overflow;
    dialog.current?.showModal();
    document.body.style.overflow = "hidden";
    onOpenChange(true); onInteract();
  };
  const closed = () => { document.body.style.overflow = previousOverflow.current; onOpenChange(false); };
  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    setInvalid(null); setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setInvalid("email"); setError("Add a valid email so I can reply.");
      dialog.current?.querySelector<HTMLInputElement>("#note-email")?.focus(); return;
    }
    if (message.trim().length < 2) {
      setInvalid("message"); setError("A short hello is enough. Add your message above.");
      dialog.current?.querySelector<HTMLTextAreaElement>("#note-message")?.focus(); return;
    }
    submitting.current = true; setStatus("sending");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(contactConfig.endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({
          service_id: contactConfig.serviceId, template_id: contactConfig.templateId, user_id: contactConfig.publicKey,
          template_params: {
            from_name: name.trim() || "Portfolio visitor", from_email: email.trim(),
            subject: `Portfolio · ${noteTopics.find(option => option.value === topic)?.label || "Hello"}`,
            message: message.trim(),
          },
        }),
      });
      if (!response.ok) throw new Error("Message provider did not accept the note.");
      setStatus("sent"); setMessage(""); onInteract();
    } catch {
      setStatus("error"); setError("Your note hasn’t been sent. Please try again, or use the email link below.");
    } finally { clearTimeout(timeout); submitting.current = false; }
  };

  return <>
    <div className="conversation-starter note-invitation">
      <div><span className="eyebrow">AN IDEA, A QUESTION, OR SIMPLY A HELLO</span><p>What’s on your mind?</p></div>
      <button className="text-link" onClick={open} aria-haspopup="dialog">Write me a note <ArrowUpRight size={17} /></button>
    </div>
    <dialog className="experience-dialog note-dialog" ref={dialog} onClose={closed} aria-labelledby="note-title" onClick={event => { if (event.target === dialog.current) dialog.current?.close(); }}>
      <div className="dialog-inner">
        <div className="dialog-top"><p className="eyebrow">TO / GHANASHYAM</p><button className="close-button" onClick={() => dialog.current?.close()} aria-label="Close note"><X size={20} /></button></div>
        <div className="note-heading"><Mail size={23} strokeWidth={1.2} /><h2 id="note-title">A little <em>hello.</em></h2><p>No perfect opening line required.</p></div>
        {status === "sent" ? <div className="note-success" role="status"><span><Check size={27} strokeWidth={1.3} /></span><h3>Thank you for the note.</h3><p>Your message has been sent.<br />I’ll reply to <strong>{email}</strong>.</p><button className="text-link" onClick={() => { setStatus("idle"); setError(""); }}>Write another note <ArrowUpRight size={16} /></button></div> : <form className="note-form" onSubmit={send} noValidate>
          <div className="note-topic"><span aria-hidden="true">A note about</span><Select id="note-topic" label="A note about" value={topic} options={noteTopics} onChange={value => { setTopic(value); onInteract(); }} /></div>
          <label className="sr-only" htmlFor="note-message">Your message</label>
          <textarea id="note-message" value={message} onChange={event => { setMessage(event.target.value); if (invalid === "message") { setInvalid(null); setError(""); } }} placeholder="A quick hello. Something you’re curious about. An idea you can’t stop thinking about…" rows={5} maxLength={4000} aria-invalid={invalid === "message"} aria-describedby={invalid === "message" ? "note-feedback" : undefined} disabled={status === "sending"} />
          <div className="note-sender"><div><label htmlFor="note-name">FROM</label><input id="note-name" name="name" autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Your name (optional)" maxLength={100} disabled={status === "sending"} /></div><div><label htmlFor="note-email">REPLY TO</label><input id="note-email" name="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={event => { setEmail(event.target.value); if (invalid === "email") { setInvalid(null); setError(""); } }} placeholder="you@example.com" maxLength={254} aria-invalid={invalid === "email"} aria-describedby={invalid === "email" ? "note-feedback" : undefined} disabled={status === "sending"} /></div></div>
          {error && <p id="note-feedback" className="note-feedback" role="alert">{error}</p>}
          <div className="note-send-row"><span>A small note. A possible beginning.</span><button className="primary-button" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send note"}{status === "sending" ? <LoaderCircle className="note-spinner" size={16} /> : <Send size={16} />}</button></div>
          <span className="sr-only" role="status">{status === "sending" ? "Sending your message." : ""}</span>
        </form>}
        <div className="note-direct"><span>Or, straight to my inbox</span><a href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={13} /></a></div>
      </div>
    </dialog>
  </>;
}
