import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Copy,
  MapPin,
  Sparkles,
} from "lucide-react";

const slides = [
  {
    icon: BrainCircuit,
    label: "AI CLASSIFICATION",
    title: "Understand the complaint automatically.",
    description:
      "Convert an unstructured citizen report into a clear issue category and case summary for review.",
    tag: "Issue identified",
    metric: "98%",
    metricLabel: "structured",
  },
  {
    icon: MapPin,
    label: "SMART ROUTING",
    title: "Suggest the right department and zone.",
    description:
      "Use complaint category and location signals to recommend where the case should be routed.",
    tag: "Department suggested",
    metric: "01",
    metricLabel: "route",
  },
  {
    icon: AlertTriangle,
    label: "PRIORITY ASSISTANCE",
    title: "Surface cases that may need attention.",
    description:
      "Transparent priority signals help authorities review potentially urgent civic issues faster.",
    tag: "Review signal",
    metric: "HIGH",
    metricLabel: "priority",
  },
  {
    icon: Copy,
    label: "RELATED REPORTS",
    title: "Connect similar complaints.",
    description:
      "Potentially related reports can be surfaced so repeated problems are easier to understand.",
    tag: "Related cases",
    metric: "04",
    metricLabel: "matches",
  },
  {
    icon: BarChart3,
    label: "LIVE TRACKING",
    title: "Follow the case through resolution.",
    description:
      "Citizens and authorities can see a clear status journey from submission to resolution.",
    tag: "Case status",
    metric: "LIVE",
    metricLabel: "updated",
  },
];

function HeroShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = slides[activeIndex];
  const Icon = slide.icon;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[650px]">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-orange-200/40 blur-3xl dark:bg-orange-500/[0.06]" />

      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.14)] dark:border-neutral-800 dark:bg-[#080808] dark:shadow-[0_25px_90px_rgba(0,0,0,0.65)]">
        <div className="h-1 bg-[#F28C28]" />

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-neutral-800 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1F3A] text-white dark:bg-white dark:text-black">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#0B1F3A] dark:text-white">
                CivicAI Intelligence
              </p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-600">
                Grievance processing layer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[10px] font-bold text-[#15803D] dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            ACTIVE
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_180px]">
          <div className="relative min-h-[390px] overflow-hidden border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r dark:border-neutral-800">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-orange-100/70 blur-3xl dark:bg-orange-500/[0.05]" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-[#D97706] dark:border-orange-900/50 dark:bg-orange-950/20 dark:text-[#F28C28]">
                    <Icon size={27} />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right dark:border-neutral-800 dark:bg-neutral-950">
                    <p className="text-lg font-extrabold text-[#0B1F3A] dark:text-white">
                      {slide.metric}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-600">
                      {slide.metricLabel}
                    </p>
                  </div>
                </div>

                <p className="mt-8 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#D97706] dark:text-[#F28C28]">
                  {slide.label}
                </p>

                <h2 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-[#0B1F3A] dark:text-white sm:text-4xl">
                  {slide.title}
                </h2>

                <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600 dark:text-neutral-400">
                  {slide.description}
                </p>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-600">
                      Workflow
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#0B1F3A] dark:text-white">
                      <CheckCircle2 size={15} className="text-[#15803D]" />
                      {slide.tag}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-600">
                      Review
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#0B1F3A] dark:text-white">
                      <span className="h-2 w-2 rounded-full bg-[#F28C28]" />
                      Human oversight
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="hidden bg-slate-50 p-5 dark:bg-[#050505] lg:block">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-slate-400 dark:text-neutral-600">
              Pipeline
            </p>

            <div className="mt-5 space-y-2">
              {[
                ["01", "Submitted"],
                ["02", "AI Analysis"],
                ["03", "Routing"],
                ["04", "Authority Review"],
                ["05", "Resolution"],
              ].map(([number, label], index) => (
                <div
                  key={label}
                  className={`rounded-xl border p-3 transition-all duration-300 ${
                    index === activeIndex
                      ? "border-orange-200 bg-white shadow-sm dark:border-orange-900/60 dark:bg-neutral-900"
                      : "border-transparent bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[9px] font-extrabold ${
                        index === activeIndex
                          ? "text-[#D97706] dark:text-[#F28C28]"
                          : "text-slate-400 dark:text-neutral-700"
                      }`}
                    >
                      {number}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        index === activeIndex
                          ? "text-[#0B1F3A] dark:text-white"
                          : "text-slate-500 dark:text-neutral-600"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-950/10">
              <p className="text-[9px] font-bold uppercase tracking-wider text-green-700 dark:text-green-500">
                Control principle
              </p>
              <p className="mt-2 text-[10px] leading-5 text-green-800/80 dark:text-green-500/80">
                AI assists. Authorized officials review and decide.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 dark:border-neutral-800 sm:px-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-neutral-600">
            Feature {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </div>

          <div className="flex items-center gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show feature ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "w-8 bg-[#F28C28]"
                    : "w-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-neutral-700 dark:hover:bg-neutral-500"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroShowcase;
