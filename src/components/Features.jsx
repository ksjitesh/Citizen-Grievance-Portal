import {
  Brain,
  MapPin,
  ShieldCheck,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Classification",
    description:
      "Automatically understand grievance details and identify the relevant category and department.",
  },
  {
    icon: MapPin,
    title: "Smart Routing",
    description:
      "Route complaints toward the appropriate department and administrative zone.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Tracking",
    description:
      "Keep citizens informed with clear complaint status and resolution updates.",
  },
  {
    icon: Clock,
    title: "Priority Detection",
    description:
      "Help authorities identify complaints that may require faster attention.",
  },
];

function Features() {
  return (
    <section className="relative overflow-hidden border-t border-slate-200 bg-white py-24 dark:border-neutral-800 dark:bg-black">

      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}
        <div className="max-w-2xl">

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D97706]">
            Platform Capabilities
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white md:text-5xl">
            Smarter grievance management,
            <span className="block text-slate-500 dark:text-neutral-400">
              from submission to resolution.
            </span>
          </h2>

          <p className="mt-5 leading-7 text-slate-600 dark:text-neutral-400">
            Intelligent tools help citizens communicate problems clearly while
            giving authorities better information to process and resolve them.
          </p>

        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-6 transition-all dark:border-neutral-800 dark:bg-neutral-950 duration-300 hover:-translate-y-2 hover:border-orange-200 hover:bg-white hover:shadow-xl dark:hover:border-orange-900/60 dark:hover:bg-neutral-900"
              >

                {/* Top accent */}
                <div className="absolute left-0 right-0 top-0 h-0.5 w-0 bg-[#F28C28] transition-all duration-500 group-hover:w-full" />

                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0B1F3A] shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:text-white duration-300 group-hover:border-orange-200 group-hover:bg-orange-50 group-hover:text-[#D97706]">
                  <Icon size={23} />
                </div>

                <h3 className="mt-6 text-lg font-bold text-[#0B1F3A] dark:text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-neutral-400">
                  {feature.description}
                </p>

                <div className="mt-6 h-0.5 w-8 rounded-full bg-[#F28C28] transition-all duration-300 group-hover:w-14" aria-hidden="true" />

              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}

export default Features;