import { Link } from "react-router-dom";
import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Users,
  Bell,
  CheckCircle2,
  Check,
  CalendarCheck,
  FileText,
  Mail,
  PenLine,
  PieChart,
  Search,
  ShieldCheck,
  MapPin,
  ChevronRight,
  Sparkles,
  Star,
} from "lucide-react";
import Button from "../components/ui/Button";
import Logo from "../components/ui/Logo";

/* ─── DATA ─────────────────────────────────────────────── */

const PIPELINE = [
  {
    id: "saved",
    label: "Saved",
    color: "bg-sky-500",
    ring: "ring-sky-500/30",
    text: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/8 dark:bg-sky-500/10",
    cards: [
      {
        id: "c1",
        title: "Frontend Engineer",
        company: "Figma",
        tag: "Remote",
        salary: "$145k",
      },
      {
        id: "c2",
        title: "Design Systems Lead",
        company: "Vercel",
        tag: "SF",
        salary: "$160k",
      },
    ],
  },
  {
    id: "applied",
    label: "Applied",
    color: "bg-indigo-500",
    ring: "ring-indigo-500/30",
    text: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/8 dark:bg-indigo-500/10",
    cards: [
      {
        id: "c3",
        title: "Product Manager",
        company: "Linear",
        tag: "Remote",
        salary: "$170k",
      },
      {
        id: "c4",
        title: "Growth Engineer",
        company: "Notion",
        tag: "NYC",
        salary: "$155k",
      },
    ],
  },
  {
    id: "interview",
    label: "Interview",
    color: "bg-amber-500",
    ring: "ring-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/8 dark:bg-amber-500/10",
    cards: [
      {
        id: "c5",
        title: "Staff Engineer",
        company: "Stripe",
        tag: "Remote",
        salary: "$210k",
      },
    ],
  },
  {
    id: "offer",
    label: "Offer",
    color: "bg-emerald-500",
    ring: "ring-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/8 dark:bg-emerald-500/10",
    cards: [
      {
        id: "c6",
        title: "Platform Lead",
        company: "Loom",
        tag: "Remote",
        salary: "$195k",
      },
    ],
  },
];

const FAQS = [
  {
    id: "volume",
    q: "Is this only for high-volume searches?",
    a: "No. It helps even with a small search because the hard part is remembering context and timing, not just counting applications.",
  },
  {
    id: "spreadsheet",
    q: "Can it replace my spreadsheet?",
    a: "Yes. You still get structure and filtering, but with contacts, reminders, activities, and stage history built around the way a search actually moves.",
  },
  {
    id: "after",
    q: "What do I keep after the search ends?",
    a: "Your outcomes, offer notes, negotiation details, contacts, and lessons stay organized for the next move instead of disappearing into old rows.",
  },
  {
    id: "prep",
    q: "How does the AI prep feature work?",
    a: "It reads your saved role notes, contact history, and interview stage to surface what matters before a conversation — without you having to set anything up manually.",
  },
];

const LOGOS = [
  "Stripe",
  "Linear",
  "Notion",
  "Vercel",
  "Figma",
  "Loom",
  "Raycast",
  "Arc",
];

/* ─── SMALL COMPONENTS ──────────────────────────────────── */

function Tag({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${className}`}
    >
      {children}
    </span>
  );
}

function AnimatedCounter({
  to,
  duration = 1800,
  suffix = "",
}: {
  to: number;
  duration?: number;
  suffix?: string;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setVal(to);
      return;
    }

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            setVal(Math.round(p * to));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration, prefersReducedMotion]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

/* ─── INTERACTIVE KANBAN PREVIEW ────────────────────────── */
/* Supports both HTML5 drag-and-drop (desktop) and tap-to-move
   (mobile/touch/keyboard), since draggable doesn't work on touch. */

type Card = {
  id: string;
  title: string;
  company: string;
  tag: string;
  salary: string;
};

type Column = {
  id: string;
  label: string;
  color: string;
  ring: string;
  text: string;
  bg: string;
  cards: Card[];
};

type DragState = {
  cardId: string;
  fromCol: string;
};

function KanbanDemo() {
  const [columns, setColumns] = useState<Column[]>(PIPELINE);

  const [dragging, setDragging] = useState<DragState | null>(null);

  const [over, setOver] = useState<string | null>(null);

  const [justMoved, setJustMoved] = useState<string | null>(null);

  const [selected, setSelected] = useState<DragState | null>(null);

  const findCard = (id: string) => {
    for (const col of columns) {
      const card = col.cards.find((c) => c.id === id);
      if (card) return { card, colId: col.id };
    }
    return null;
  };

  const moveCard = (cardId: string, fromCol: string, targetColId: string) => {
    if (fromCol === targetColId) return;
    const src = findCard(cardId);
    if (!src) return;
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === fromCol)
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        if (col.id === targetColId)
          return { ...col, cards: [...col.cards, src.card] };
        return col;
      }),
    );
    setJustMoved(cardId);
    setTimeout(() => setJustMoved(null), 1200);
  };

  const handleDragStart = (cardId: string, colId: string) => {
    setDragging({ cardId, fromCol: colId });
  };

  const handleDrop = (targetColId: string) => {
    if (!dragging) {
      setOver(null);
      return;
    }
    moveCard(dragging.cardId, dragging.fromCol, targetColId);
    setDragging(null);
    setOver(null);
  };

  // Tap-to-move fallback for touch/keyboard users: tap a card to select it,
  // then tap a column to move it there. Tapping the same card deselects.
  const handleCardActivate = (cardId: string, colId: string) => {
    if (selected?.cardId === cardId) {
      setSelected(null);
      return;
    }
    setSelected({ cardId, fromCol: colId });
  };

  const handleColumnActivate = (targetColId: string) => {
    if (!selected) return;
    moveCard(selected.cardId, selected.fromCol, targetColId);
    setSelected(null);
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-[640px]">
        {columns.map((col) => (
          <div
            key={col.id}
            role="group"
            aria-label={`${col.label} column, ${col.cards.length} roles`}
            className={`flex-1 min-w-[148px] rounded-xl border border-border/60 p-3 transition-all duration-200 ${
              over === col.id || (selected && selected.fromCol !== col.id)
                ? col.bg + " ring-2 " + col.ring
                : "bg-muted/20"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(col.id);
            }}
            onDragLeave={() => setOver(null)}
            onDrop={() => handleDrop(col.id)}
            onClick={() => handleColumnActivate(col.id)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${col.color}`}
                  aria-hidden="true"
                />
                <span className={`text-xs font-bold ${col.text}`}>
                  {col.label}
                </span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {col.cards.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              <AnimatePresence>
                {col.cards.map((card) => {
                  const isSelected = selected?.cardId === card.id;
                  return (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        boxShadow:
                          justMoved === card.id
                            ? "0 0 0 2px rgba(16,185,129,0.5)"
                            : "none",
                      }}
                      exit={{ opacity: 0, scale: 0.88 }}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        handleDragStart(card.id, col.id);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardActivate(card.id, col.id);
                      }}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      aria-label={`${card.title} at ${card.company}, ${card.salary}. ${isSelected ? "Selected — tap a column to move it." : "Tap to move."}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCardActivate(card.id, col.id);
                        }
                      }}
                      className={`rounded-lg border bg-card p-3 cursor-grab active:cursor-grabbing select-none transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                        dragging?.cardId === card.id
                          ? "opacity-40 border-dashed"
                          : isSelected
                            ? "border-sky-500 ring-2 ring-sky-500/40 shadow-md"
                            : "border-border/80 hover:border-sky-400/50 hover:shadow-md"
                      }`}
                    >
                      <p className="text-xs font-bold leading-tight">
                        {card.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        {card.company}
                        <span className="opacity-40" aria-hidden="true">
                          ·
                        </span>
                        <MapPin
                          className="w-2.5 h-2.5 inline"
                          aria-hidden="true"
                        />{" "}
                        {card.tag}
                      </p>
                      <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5">
                        {card.salary}
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {col.cards.length === 0 && (
                <div
                  className={`rounded-lg border-2 border-dashed border-border/40 p-4 text-center transition-colors ${over === col.id ? "border-sky-400/50 bg-sky-500/5" : ""}`}
                >
                  <p className="text-[10px] text-muted-foreground">Drop here</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-3 opacity-70">
        ↔ Drag on desktop, or tap a card then tap a column on mobile — it works
      </p>
    </div>
  );
}

/* ─── TABBED PREP PREVIEW ───────────────────────────────── */

const PREP_TABS = [
  {
    id: "focus",
    label: "Focus areas",
    meta: "5 flagged",
    icon: Star,
    accent: "sky",
    content: (
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          "System design",
          "Stakeholder tradeoffs",
          "Remote rituals",
          "Salary range",
          "Growth path",
        ].map((t) => (
          <span
            key={t}
            className="rounded-md bg-muted border border-border px-2.5 py-1 text-[11px] font-semibold"
          >
            {t}
          </span>
        ))}
      </div>
    ),
  },
  {
    id: "prep",
    label: "Prep checklist",
    meta: "2 of 3 done",
    icon: CheckCircle2,
    accent: "emerald",
    content: (
      <div className="space-y-2.5 pt-1">
        {[
          "Prepare a concise story for scaling the onboarding workflow.",
          "Ask about engineering–product planning rituals and decision ownership.",
          "Send a thank-you note within 24 hours if the loop moves forward.",
        ].map((item) => (
          <div
            key={item}
            className="flex gap-2.5 rounded-lg border border-border p-2.5"
          >
            <CheckCircle2
              className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {item}
            </p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "contacts",
    label: "Key contacts",
    meta: "2 people",
    icon: Users,
    accent: "indigo",
    content: (
      <div className="space-y-2.5 pt-1">
        {[
          {
            name: "Priya Nair",
            role: "Engineering recruiter",
            note: "Mentioned async culture",
          },
          {
            name: "David Kim",
            role: "Hiring manager",
            note: "Ex-Airbnb, cares about craft",
          },
        ].map((c) => (
          <div
            key={c.name}
            className="flex gap-3 rounded-lg border border-border p-2.5"
          >
            <div
              className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0"
              aria-hidden="true"
            >
              {c.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p className="text-xs font-bold">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {c.role} · {c.note}
              </p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

const PREP_ACCENTS = {
  sky: {
    text: "text-sky-600 dark:text-sky-400",
    bar: "bg-sky-500",
  },
  emerald: {
    text: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  indigo: {
    text: "text-indigo-600 dark:text-indigo-400",
    bar: "bg-indigo-500",
  },
};

/* Signature element: a readiness ring that visually pays off the
   section headline ("already prepared") instead of a static pill. */
function ReadinessRing({ value = 82 }: { value?: number }) {
  const prefersReducedMotion = useReducedMotion();
  const size = 44;
  const stroke = 3.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [progress, setProgress] = useState(prefersReducedMotion ? value : 0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const t = setTimeout(() => setProgress(value), 250);
    return () => clearTimeout(t);
  }, [value, prefersReducedMotion]);

  return (
    <div className="relative w-11 h-11 shrink-0" aria-hidden="true">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-amber-500/15"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c - (progress / 100) * c}
          strokeLinecap="round"
          className="text-amber-500 transition-[stroke-dashoffset] duration-[1400ms] ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">
        {value}%
      </span>
    </div>
  );
}

function PrepDesk() {
  const [active, setActive] = useState("focus");
  const tab = PREP_TABS.find((t) => t.id === active)!;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft-lg overflow-hidden">
      {/* Header — briefing memo */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-border/70 bg-gradient-to-b from-muted/40 to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg bg-slate-950 dark:bg-white flex items-center justify-center text-[11px] font-black text-white dark:text-slate-950 shrink-0 tracking-tight"
            aria-hidden="true"
          >
            SE
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">
              Staff Engineer @ Stripe
            </p>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">
              Brief · Tomorrow, 10:00 AM
            </p>
          </div>
        </div>
        <ReadinessRing value={82} />
      </div>

      <div className="flex">
        {/* Vertical folder-tab rail */}
        <div
          role="tablist"
          aria-label="Interview prep sections"
          className="flex flex-col shrink-0 w-[100px] sm:w-[124px] border-r border-border/70 bg-muted/20"
        >
          {PREP_TABS.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.id;
            const a = PREP_ACCENTS[t.accent as keyof typeof PREP_ACCENTS];
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`prep-panel-${t.id}`}
                id={`prep-tab-${t.id}`}
                onClick={() => setActive(t.id)}
                className={`relative flex flex-col items-start gap-1 px-3.5 py-3.5 text-left border-b border-border/50 last:border-b-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 ${
                  isActive ? "bg-card" : "hover:bg-card/60"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="prep-tab-indicator"
                    className={`absolute left-0 top-0 bottom-0 w-0.5 ${a.bar}`}
                  />
                )}
                <Icon
                  className={`w-3.5 h-3.5 ${isActive ? a.text : "text-muted-foreground"}`}
                  aria-hidden="true"
                />
                <span
                  className={`text-[11px] font-bold leading-tight ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {t.label}
                </span>
                <span className="text-[9px] text-muted-foreground/70 font-mono">
                  {t.meta}
                </span>
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div className="flex-1 min-w-0 p-4 sm:p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              id={`prep-panel-${active}`}
              role="tabpanel"
              aria-labelledby={`prep-tab-${active}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {tab.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─── FAQ ACCORDION ─────────────────────────────────────── */

function FAQ() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {FAQS.map((faq) => {
        const isOpen = open === faq.id;
        return (
          <div
            key={faq.id}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <button
              className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset"
              onClick={() => setOpen(isOpen ? null : faq.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${faq.id}`}
              id={`faq-trigger-${faq.id}`}
            >
              <span className="text-sm font-bold pr-4">{faq.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden="true"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </motion.span>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  id={`faq-panel-${faq.id}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${faq.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ─── SCROLLING LOGO STRIP ───────────────────────────────── */

function LogoStrip() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="overflow-hidden relative py-3">
      <div className="absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      {prefersReducedMotion ? (
        <div className="flex gap-10 whitespace-nowrap flex-wrap justify-center">
          {LOGOS.map((name) => (
            <span
              key={name}
              className="text-sm font-bold text-muted-foreground/50 tracking-wide"
            >
              {name}
            </span>
          ))}
        </div>
      ) : (
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="flex gap-10 whitespace-nowrap"
          aria-hidden="true"
        >
          {[...LOGOS, ...LOGOS].map((name, i) => (
            <span
              key={i}
              className="text-sm font-bold text-muted-foreground/50 tracking-wide"
            >
              {name}
            </span>
          ))}
        </motion.div>
      )}
      {/* Screen-reader-only static list, since the animated version is aria-hidden */}
      {!prefersReducedMotion && (
        <span className="sr-only">
          Trusted by candidates at {LOGOS.join(", ")}
        </span>
      )}
    </div>
  );
}

/* ─── MAIN LANDING ──────────────────────────────────────── */

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const prefersReducedMotion = useReducedMotion();
  const heroY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ["0%", "0%"] : ["0%", "12%"],
  );
  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.6],
    prefersReducedMotion ? [1, 1] : [1, 0],
  );

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-sky-400/20 font-sans">
      {/* Ambient hero glow */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-sky-500/5 blur-3xl" />
        <div className="absolute top-32 right-0 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <Logo size="md" withText />
        <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-muted-foreground">
          {[
            ["#pipeline", "Pipeline"],
            ["#prep", "Prep desk"],
            ["#faq", "FAQ"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="hover:text-foreground transition-colors relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-sm"
            >
              {label}
              <span
                className="absolute -bottom-0.5 left-0 w-0 h-px bg-sky-500 group-hover:w-full transition-all duration-300"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-sm"
          >
            Sign in
          </Link>
          <Link to="/register">
            <Button
              size="sm"
              className="rounded-lg px-5 bg-slate-950 text-white hover:bg-slate-800 border-none shadow-md dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              Get started
            </Button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        {/* ── Hero ── */}
        <section ref={heroRef} className="pt-16 pb-24 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-14 items-center">
            {/* Left */}
            <motion.div
              style={{ y: heroY, opacity: heroOpacity }}
              className="space-y-7"
            >
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-bold uppercase tracking-wider border border-amber-500/20"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse motion-reduce:animate-none"
                  aria-hidden="true"
                />
                A workspace for the messy middle
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.06]"
              >
                Your job search, <br />
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500">
                    finally in one piece.
                  </span>
                  {/* <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.7, duration: 0.5, ease: "easeOut" }}
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-sky-500 to-violet-500 origin-left rounded-full"
                    aria-hidden="true"
                  /> */}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg"
              >
                HireWire keeps every role, contact, note, and follow-up
                together; so your search feels intentional, not frantic.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.26 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link to="/register">
                  <Button
                    size="lg"
                    className="rounded-xl px-8 h-14 bg-slate-950 text-white hover:bg-slate-800 border-none shadow-lg dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 group"
                  >
                    Start a calmer search
                    <ArrowRight
                      className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform"
                      aria-hidden="true"
                    />
                  </Button>
                </Link>
                <a href="#pipeline">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-xl px-8 h-14 group"
                  >
                    See how it works
                    <ChevronRight
                      className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform"
                      aria-hidden="true"
                    />
                  </Button>
                </a>
              </motion.div>

              {/* Animated stat row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="flex items-center gap-8 pt-6 border-t border-border/40"
              >
                {[
                  { val: 6, suffix: "", label: "Pipeline stages" },
                  { val: 100, suffix: "%", label: "Private by default" },
                  { val: 0, suffix: "", label: "Forgotten follow-ups" },
                ].map(({ val, suffix, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-extrabold">
                      <AnimatedCounter to={val} suffix={suffix} />
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">
                      {label}
                    </p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right – live kanban */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl p-4 shadow-2xl shadow-slate-900/10">
                {/* Fake window chrome */}
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-border/50">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full border border-border/40">
                    hirewire.app / pipeline
                  </div>
                  <div className="w-16" />
                </div>
                <KanbanDemo />
              </div>

              {/* Floating notification badge — hidden below lg to avoid overflow/clipping on small screens */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: 1.1,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                className="hidden lg:flex absolute -bottom-5 -left-5 bg-card border border-border rounded-xl px-3.5 py-2.5 shadow-lg items-center gap-2.5 z-20"
              >
                <div
                  className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Bell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold">Stripe follow-up</p>
                  <p className="text-[10px] text-muted-foreground">
                    Due in 2 hours
                  </p>
                </div>
              </motion.div>

              {/* Floating offer badge — hidden below lg to avoid overflow/clipping on small screens */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: 1.3,
                  type: "spring",
                  stiffness: 240,
                  damping: 22,
                }}
                className="hidden lg:flex absolute -top-5 -right-4 bg-card border border-border rounded-xl px-3 py-2 shadow-lg items-center gap-2 z-20"
              >
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none"
                  aria-hidden="true"
                />
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Offer received 🎉
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Social proof strip ── */}
        <div className="border-y border-border/40 py-4 bg-muted/10 overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 text-center mb-2">
            Trusted by candidates at
          </p>
          <LogoStrip />
        </div>

        {/* ── Interactive Pipeline Section ── */}
        <section id="pipeline" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-14 items-start">
              {/* Sticky copy */}
              <div className="lg:sticky lg:top-24 space-y-5">
                <Tag className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20">
                  <Briefcase className="w-3 h-3" aria-hidden="true" /> Pipeline
                  clarity
                </Tag>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  Know what is active, stale, and needs your next move.
                </h2>
                <p className="text-muted-foreground text-base leading-relaxed">
                  A useful tracker answers the questions you ask every morning:
                  who needs a reply, which interview needs prep, which role
                  should be archived.
                </p>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {[
                    {
                      icon: Check,
                      text: "Roles, notes, contacts, and reminders in one record",
                    },
                    {
                      icon: Check,
                      text: "Filter by status, source, tag, or next follow-up",
                    },
                    {
                      icon: Check,
                      text: "Stage history keeps rejections and callbacks useful",
                    },
                    {
                      icon: Check,
                      text: "Built for searches with pauses, maybes, and overlaps",
                    },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex gap-2 items-start py-1.5"
                    >
                      <Icon
                        className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-600 dark:text-sky-400 hover:gap-3 transition-all mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-sm"
                >
                  Start your pipeline{" "}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>

              {/* Workflow cards */}
              <div className="space-y-4">
                {[
                  {
                    step: "01",
                    eyebrow: "Collect",
                    icon: Search,
                    color: "text-sky-600 dark:text-sky-400",
                    bg: "bg-sky-500/10 border-sky-500/15",
                    title: "Drop every promising role into one place",
                    desc: "Save the link, company, source, salary hint, and why it caught your eye before the tab disappears.",
                  },
                  {
                    step: "02",
                    eyebrow: "Shape",
                    icon: PenLine,
                    color: "text-indigo-600 dark:text-indigo-400",
                    bg: "bg-indigo-500/10 border-indigo-500/15",
                    title: "Add the notes future-you will actually need",
                    desc: "Capture prep thoughts, recruiter details, interview impressions, and the context that makes a search feel manageable.",
                  },
                  {
                    step: "03",
                    eyebrow: "Return",
                    icon: CalendarCheck,
                    color: "text-emerald-600 dark:text-emerald-400",
                    bg: "bg-emerald-500/10 border-emerald-500/15",
                    title: "Come back at exactly the right moment",
                    desc: "Keep follow-ups, thank-you notes, interviews, and decision dates attached to the role they belong to.",
                  },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={s.step}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      className="group flex gap-5 py-5 border-b border-border/50 last:border-b-0 hover:translate-x-0.5 transition-transform"
                    >
                      {/* Step number + icon column */}
                      <div className="flex flex-col items-center shrink-0 w-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${s.color} bg-transparent ring-1 ring-current/20`}
                          aria-hidden="true"
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {i < 2 && (
                          <div className="w-px flex-1 mt-2 bg-border/60" aria-hidden="true" />
                        )}
                      </div>
                      <div className="pb-2">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                            {s.step}
                          </span>
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${s.color}`}
                          >
                            {s.eyebrow}
                          </span>
                        </div>
                        <h3 className="text-base font-bold tracking-tight mb-1.5 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                          {s.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Prep Desk Interactive Section ── */}
        <section
          id="prep"
          className="py-24 px-6 bg-muted/15 border-y border-border/40"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 items-center">
              <div className="space-y-6">
              <Tag className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20">
                <Sparkles className="w-3 h-3" aria-hidden="true" />{" "}
                Context-aware prep
              </Tag>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Walk into every interview already prepared.
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed max-w-xl">
                Generic advice is noisy. HireWire keeps the ingredients close:
                the role, your notes, contact history, and the stage, so prep
                feels like a review, not a sprint.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  {
                    icon: FileText,
                    label: "Prep without starting cold",
                    desc: "Role details, must-haves, and last conversation in one view.",
                    color: "text-sky-600 dark:text-sky-400",
                    bg: "bg-sky-500/10 border-sky-500/15",
                  },
                  {
                    icon: Mail,
                    label: "Send warmer follow-ups",
                    desc: "Grounded in who you spoke with, what they mentioned, what's next.",
                    color: "text-amber-600 dark:text-amber-400",
                    bg: "bg-amber-500/10 border-amber-500/15",
                  },
                  {
                    icon: PieChart,
                    label: "See what is actually working",
                    desc: "When a week feels blurry, analytics show where momentum lives.",
                    color: "text-emerald-600 dark:text-emerald-400",
                    bg: "bg-emerald-500/10 border-emerald-500/15",
                  },
                ].map(({ icon: Icon, label, desc, color, bg }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="flex items-start gap-4 rounded-xl border border-transparent p-3 -mx-3 hover:border-border/60 hover:bg-card/60 transition-all duration-200 group"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${bg} group-hover:scale-105 transition-transform`}
                      aria-hidden="true"
                    >
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div className="pt-0.5">
                      <p className="text-sm font-bold mb-0.5 tracking-tight">{label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

              {/* Interactive tabbed prep card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <PrepDesk />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Who it helps ── */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <Tag className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 mb-4">
                <Users className="w-3 h-3" aria-hidden="true" /> Search styles
              </Tag>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Useful whether your search is quiet, intense, or somewhere in
                between.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  color: "from-sky-500 to-indigo-500",
                  badge: "Skill-fit notes",
                  title: "Career switchers",
                  desc: "Map target roles, skill gaps, referrals, and learning notes without losing the story behind each application.",
                  metric: { label: "Industries mapped", val: 4 },
                },
                {
                  color: "from-amber-500 to-rose-500",
                  badge: "Offer comparison",
                  title: "Senior candidates",
                  desc: "Separate confidential conversations, compensation signals, decision makers, and interview loops across companies.",
                  metric: { label: "Competing offers", val: 3 },
                  featured: true,
                },
                {
                  color: "from-emerald-400 to-teal-500",
                  badge: "Bulk actions",
                  title: "High-volume searches",
                  desc: "Move fast without going numb to the details. Filter by status, source, location, tags, and next follow-up.",
                  metric: { label: "Active applications", val: 27 },
                },
              ].map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.09 }}
                  className={`rounded-2xl border bg-card p-6 shadow-soft-md hover:shadow-lg transition-all relative overflow-hidden group ${
                    p.featured
                      ? "border-sky-400/50 ring-1 ring-sky-500/20"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  {p.featured && (
                    <div className="absolute top-0 right-0">
                      <div className="text-[9px] font-black uppercase tracking-widest bg-sky-500 text-white px-3 py-1 rounded-bl-xl">
                        Most common
                      </div>
                    </div>
                  )}
                  {/* Accent stripe instead of gradient icon box */}
                  <div
                    className={`w-8 h-0.5 rounded-full bg-gradient-to-r ${p.color} mb-5 opacity-80`}
                    aria-hidden="true"
                  />
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-border text-muted-foreground/60"
                    >
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold mb-3">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {p.desc}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {p.metric.label}
                    </span>
                    <span className="text-2xl font-extrabold">
                      <AnimatedCounter to={p.metric.val} duration={1400} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Privacy + FAQ ── */}
        <section
          id="faq"
          className="py-24 px-6 bg-muted/15 border-t border-border/40"
        >
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-14">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft-md h-fit lg:sticky lg:top-24">
              <div className="flex items-center gap-2.5 mb-5">
                <ShieldCheck
                  className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400"
                  aria-hidden="true"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Privacy
                </span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight mb-2.5">
                Private by default, practical by design.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                Career notes include salary goals, company concerns, and
                confidential conversations. HireWire treats them as serious
                records, not toy data.
              </p>
              <div className="space-y-3">
                {[
                  "Clean account-based access",
                  "Focused data model for job-search records",
                  "Export-friendly structure for long-term ownership",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2.5 text-sm font-semibold"
                  >
                    <Check
                      className="w-4 h-4 text-emerald-500 shrink-0"
                      aria-hidden="true"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
                  Questions candidates ask before switching
                </p>
                <h2 className="text-3xl font-extrabold tracking-tight">
                  Before you move your search out of spreadsheets.
                </h2>
              </div>
              <FAQ />
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-10 md:p-16 text-center text-white relative overflow-hidden border border-indigo-500/20 shadow-2xl"
            >
              <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.2),transparent_60%)] pointer-events-none"
                aria-hidden="true"
              />
              <div className="relative z-10 space-y-6">
                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">
                  Ready to wire your next career milestone?
                </p>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Your search.{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-300">
                    Finally organized.
                  </span>
                </h2>
                <p className="text-slate-300 text-base max-w-xl mx-auto leading-relaxed">
                  One workspace for every role, every person, and every next
                  step. No spreadsheet required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link to="/register">
                    <Button
                      size="lg"
                      className="rounded-xl px-10 h-14 bg-white text-slate-950 font-bold hover:bg-slate-50 border-0 shadow-xl hover:scale-[1.02] transition-all motion-reduce:hover:scale-100"
                    >
                      Create your account
                      <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-indigo-400"
                    aria-hidden="true"
                  />
                  Free tier forever. No card required.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-8 px-6 text-center text-muted-foreground bg-background/60 backdrop-blur-md">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Logo size="sm" withText />
        </div>
        <p className="text-xs">
          &copy; {new Date().getFullYear()} HireWire. Engineered for
          professionals.
        </p>
      </footer>
    </div>
  );
}
