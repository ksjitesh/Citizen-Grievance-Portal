import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileText,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import HeroShowcase from "./HeroShowcase";

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[#F8FAFC] dark:border-neutral-800 dark:bg-black">
      <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18] [background-image:linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] [background-size:64px_64px] dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />

      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-orange-200/40 blur-[100px] dark:bg-orange-500/10" />

      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-slate-200/60 blur-[100px] dark:bg-white/[0.04]" />

      <div className="absolute left-0 right-0 top-0 h-1 bg-[#F28C28]" />

      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-24 sm:pb-20 sm:pt-28 lg:px-8 lg:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#B45309] shadow-sm dark:border-orange-900/60 dark:bg-neutral-950 dark:text-[#F28C28]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/50">
                <Sparkles size={12} />
              </span>

              AI-powered civic intelligence
            </div>

            <h1 className="mt-7 text-[clamp(3rem,6vw,5.6rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-[#0B1F3A] dark:text-white">
              Report a problem.

              <span className="mt-3 block text-[#D97706] dark:text-[#F28C28]">
                Move it forward.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 dark:text-neutral-400 sm:text-lg">
              CivicAI turns everyday civic complaints into structured cases —
              helping identify the issue, suggest the right department, surface
              priority signals, and keep citizens informed.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/report-grievance"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#0B1F3A] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition duration-300 hover:-translate-y-1 hover:bg-[#12355B] hover:shadow-xl dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Report a Grievance

                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/track-complaint"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/90 px-6 py-3.5 text-sm font-bold text-[#0B1F3A] transition duration-300 hover:-translate-y-1 hover:border-[#D97706] hover:bg-orange-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:hover:border-neutral-500 dark:hover:bg-neutral-900"
              >
                <MapPin size={17} />

                Track Complaint
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur-sm dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-950/80">
              <div className="px-4 py-4 sm:px-5">
                <p className="text-xl font-extrabold text-[#0B1F3A] dark:text-white">
                  24/7
                </p>

                <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-neutral-500">
                  Access
                </p>
              </div>

              <div className="px-4 py-4 sm:px-5">
                <p className="text-xl font-extrabold text-[#D97706] dark:text-[#F28C28]">
                  AI
                </p>

                <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-neutral-500">
                  Assisted
                </p>
              </div>

              <div className="px-4 py-4 sm:px-5">
                <p className="text-xl font-extrabold text-[#15803D] dark:text-green-500">
                  Live
                </p>

                <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-neutral-500">
                  Tracking
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-500 dark:text-neutral-500">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2
                  size={15}
                  className="text-[#15803D]"
                />
                Transparent workflow
              </span>

              <span className="inline-flex items-center gap-2">
                <ShieldCheck
                  size={15}
                  className="text-[#0B1F3A] dark:text-white"
                />
                Human-reviewed decisions
              </span>
            </div>
          </div>

          <div className="lg:pt-4">
            <HeroShowcase />
          </div>
        </div>

        <div className="mt-16 grid gap-3 border-t border-slate-200 pt-6 dark:border-neutral-800 sm:grid-cols-3">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-neutral-500">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#0B1F3A] dark:border-neutral-800 dark:bg-neutral-950 dark:text-white">
              <FileText size={17} />
            </div>

            <span>Structured grievance submission</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-neutral-500">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#D97706] dark:border-neutral-800 dark:bg-neutral-950 dark:text-[#F28C28]">
              <BrainCircuit size={17} />
            </div>

            <span>AI-assisted classification & routing</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-neutral-500">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#15803D] dark:border-neutral-800 dark:bg-neutral-950 dark:text-green-500">
              <TrendingUp size={17} />
            </div>

            <span>Resolution progress & analytics</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;