"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import "./select.css";

interface SelectProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}

/** A select-only combobox. Focus stays on the trigger while the list is explored. */
export default function Select({ id, label, value, options, onChange, className = "" }: SelectProps) {
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const [placement, setPlacement] = useState<"above" | "below">("below");
  const [position, setPosition] = useState<CSSProperties>({ visibility: "hidden" });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLSpanElement>(null);
  const searchRef = useRef({ text: "", time: 0 });
  const listId = `${id}-options`;
  const labelId = `${id}-label`;

  const close = (restoreFocus = false) => {
    setOpen(false);
    searchRef.current = { text: "", time: 0 };
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  const commit = (index: number) => {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    close(true);
  };

  const show = (index = selectedIndex) => {
    setActiveIndex(index);
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const list = listRef.current;
    if (!trigger || !list) return;

    // The top layer avoids overflow clipping without moving the list out of its
    // theme or its owning dialog. Manual mode keeps dismissal under our control.
    list.showPopover?.();

    const reposition = () => {
      const rect = trigger.getBoundingClientRect();
      const viewport = window.visualViewport;
      const leftEdge = (viewport?.offsetLeft ?? 0) + 12;
      const topEdge = (viewport?.offsetTop ?? 0) + 12;
      const rightEdge = leftEdge + (viewport?.width ?? window.innerWidth) - 24;
      const bottomEdge = topEdge + (viewport?.height ?? window.innerHeight) - 24;
      const width = Math.min(Math.max(rect.width, 220), rightEdge - leftEdge);
      const roomBelow = bottomEdge - rect.bottom - 7;
      const roomAbove = rect.top - topEdge - 7;
      const desiredHeight = Math.min(options.length * 48 + 12, 304);
      const above = roomBelow < desiredHeight && roomAbove > roomBelow;
      const maxHeight = Math.max(44, Math.min(304, above ? roomAbove : roomBelow));
      setPlacement(above ? "above" : "below");
      setPosition({
        visibility: "visible",
        left: Math.max(leftEdge, Math.min(rect.left, rightEdge - width)),
        top: above ? undefined : rect.bottom + 7,
        bottom: above ? window.innerHeight - rect.top + 7 : undefined,
        width,
        maxHeight,
      });
    };

    const dismissOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!trigger.contains(target) && !list.contains(target)) setOpen(false);
    };

    const scroll = (event: Event) => {
      // Scrolling within the choices should never disturb their placement.
      if (event.target instanceof Node && list.contains(event.target)) return;
      reposition();
      const rect = trigger.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) setOpen(false);
    };

    reposition();
    const observer = new ResizeObserver(reposition);
    observer.observe(trigger);
    document.addEventListener("pointerdown", dismissOutside, true);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", scroll, true);
    window.visualViewport?.addEventListener("resize", reposition);
    window.visualViewport?.addEventListener("scroll", reposition);

    return () => {
      if (list.matches(":popover-open")) list.hidePopover?.();
      observer.disconnect();
      document.removeEventListener("pointerdown", dismissOutside, true);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", scroll, true);
      window.visualViewport?.removeEventListener("resize", reposition);
      window.visualViewport?.removeEventListener("scroll", reposition);
    };
  }, [open, options.length]);

  useLayoutEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const option = document.getElementById(`${listId}-${activeIndex}`);
    if (!list || !option) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [activeIndex, open, listId, position]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!options.length) return;
    const { key } = event;
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(key)) {
      event.preventDefault();
      event.stopPropagation();
      searchRef.current = { text: "", time: 0 };
      if (key === "Home") show(0);
      else if (key === "End") show(options.length - 1);
      else if (!open) show();
      else setActiveIndex(index => Math.max(0, Math.min(options.length - 1, index + (key === "ArrowDown" ? 1 : -1))));
      return;
    }
    if (key === "Enter" || key === " ") {
      event.preventDefault();
      event.stopPropagation();
      if (open) commit(activeIndex);
      else show();
      return;
    }
    if (key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (key === "Tab" && open) {
      const option = options[activeIndex];
      if (option && option.value !== value) onChange(option.value);
      close();
      return;
    }
    if (key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      event.stopPropagation();
      const now = Date.now();
      const previous = now - searchRef.current.time < 650 ? searchRef.current.text : "";
      const text = previous + key.toLocaleLowerCase();
      searchRef.current = { text, time: now };
      const repeated = [...text].every(character => character === text[0]);
      const query = repeated ? text[0] : text;
      const start = (open ? activeIndex : selectedIndex) + (repeated ? 1 : 0);
      for (let offset = 0; offset < options.length; offset++) {
        const index = (start + offset) % options.length;
        if (options[index].label.toLocaleLowerCase().startsWith(query)) {
          show(index);
          break;
        }
      }
    }
  };

  return (
    <span className={`observatory-select ${className}`} data-open={open || undefined}>
      <span className="observatory-select-label" id={labelId}>{label}</span>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        className="observatory-select-trigger"
        role="combobox"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        disabled={!options.length}
        onClick={() => { if (open) close(); else show(); }}
        onKeyDown={onKeyDown}
        onBlur={event => {
          if (!listRef.current?.contains(event.relatedTarget as Node | null)) close();
        }}
      >
        <span className="observatory-select-value">{options[selectedIndex]?.label ?? "Choose an option"}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && (
        <span
          id={listId}
          ref={listRef}
          className="observatory-select-list"
          role="listbox"
          aria-labelledby={labelId}
          popover="manual"
          data-placement={placement}
          style={position}
          onMouseDown={event => event.preventDefault()}
        >
          {options.map((option, index) => (
            <span
              id={`${listId}-${index}`}
              key={option.value}
              className="observatory-select-option"
              role="option"
              aria-selected={option.value === value}
              data-active={index === activeIndex || undefined}
              onPointerMove={event => { if (event.pointerType !== "touch") setActiveIndex(index); }}
              onPointerDown={event => { if (event.pointerType !== "touch") event.preventDefault(); }}
              onClick={() => commit(index)}
            >
              <span>{option.label}</span>
              {option.value === value && <Check size={14} aria-hidden="true" />}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
