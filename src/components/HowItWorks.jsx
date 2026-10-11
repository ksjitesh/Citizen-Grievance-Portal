import {
  FileText,
  Brain,
  Building2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Submit Grievance",
    description:
      "Citizens describe the civic issue, add a location, and optionally upload supporting evidence.",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI Analysis",
    description:
      "The system analyzes the complaint, identifies its category, detects priority signals, and summarizes the case.",
  },
  {
    number: "03",
    icon: Building2,
    title: "Smart Routing",
    description:
      "The grievance is suggested for the relevant department and administrative area.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Track Resolution",
    description:
      "Citizens can follow the complaint status while authorities manage the resolution workflow.",
  },
];

function HowItWorks() {
  return (
    <section className="border-t border-slate-200 bg-white py-24 dark:border-neutral-800 dark:bg-black">
      <div className="mx-auto max-w-7xl px-6">

        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D97706]">
            How It Works
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white md:text-5xl">
            From complaint to resolution
          </h2>

          <p className="mt-5 leading-7 text-slate-600 dark:text-neutral-400">
            CivicAI connects citizens and authorities through a structured,
            AI-assisted grievance management workflow.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {/* Connecting line */}
          <div className="absolute left-[12%] right-[12%] top-10 hidden h-px bg-slate-200 dark:bg-neutral-800 lg:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group relative text-center"
              >
                {/* Step icon */}
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#0B1F3A] shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-950 dark:text-white duration-300 group-hover:-translate-y-2 group-hover:border-orange-200 group-hover:bg-orange-50 group-hover:text-[#D97706] group-hover:shadow-lg dark:group-hover:border-orange-900/60 dark:group-hover:bg-orange-950/20 dark:group-hover:text-[#F28C28]">
                  <Icon size={28} />

                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#0B1F3A] text-[10px] font-bold text-white transition-colors duration-300 group-hover:bg-[#D97706]">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="mt-7 text-lg font-bold text-[#0B1F3A] dark:text-white">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-neutral-400">
                  {step.description}
                </p>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <ArrowRight
                    size={18}
                    className="absolute -right-5 top-8 hidden text-slate-300 dark:text-neutral-700 lg:block"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;