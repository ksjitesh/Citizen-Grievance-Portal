function Stats() {
  const stats = [
    {
      value: "24/7",
      label: "Complaint Access",
      description: "Submit and track grievances anytime",
    },
    {
      value: "AI",
      label: "Smart Classification",
      description: "Intelligent complaint understanding",
    },
    {
      value: "100%",
      label: "Status Transparency",
      description: "Clear visibility of complaint progress",
    },
    {
      value: "1",
      label: "Unified Platform",
      description: "Citizens and authorities connected",
    },
  ];

  return (
    <section className="border-y border-slate-200 bg-[#F8FAFC] py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
          >
            <p className="text-3xl font-bold tracking-tight text-[#D97706] transition-transform duration-300 group-hover:scale-110 md:text-4xl">
              {stat.value}
            </p>

            <p className="mt-3 font-semibold text-[#0B1F3A]">
              {stat.label}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {stat.description}
            </p>

            <div className="mx-auto mt-5 h-0.5 w-8 bg-[#F28C28] transition-all duration-300 group-hover:w-14" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default Stats;