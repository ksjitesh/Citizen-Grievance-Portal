import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Clock3,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

import {
  getAllComplaints,
  getComplaintStats,
} from "../services/complaintService";

function formatTimeAgo(dateValue) {
  if (!dateValue) {
    return "Recently";
  }

  const createdTime = new Date(dateValue).getTime();

  if (Number.isNaN(createdTime)) {
    return "Recently";
  }

  const difference = Date.now() - createdTime;

  const minutes = Math.floor(
    difference / (1000 * 60)
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks < 5) {
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  return new Date(dateValue).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function getPriorityClasses(priority) {
  switch (priority) {
    case "High":
    case "Critical":
      return "bg-orange-50 text-[#B45309] dark:bg-orange-950/30 dark:text-[#F28C28]";

    case "Low":
      return "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400";

    default:
      return "bg-blue-50 text-[#0B1F3A] dark:bg-blue-950/30 dark:text-blue-300";
  }
}

function getStatusClasses(status) {
  switch (status) {
    case "Resolved":
      return "bg-green-50 text-[#15803D] dark:bg-green-950/30 dark:text-green-400";

    case "In Progress":
      return "bg-blue-50 text-[#0B1F3A] dark:bg-blue-950/30 dark:text-blue-300";

    case "Rejected":
      return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";

    case "Closed":
      return "bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400";

    default:
      return "bg-orange-50 text-[#B45309] dark:bg-orange-950/30 dark:text-[#F28C28]";
  }
}

function getComplaintIcon(status) {
  if (status === "Resolved") {
    return (
      <CheckCircle2
        size={18}
        className="text-[#15803D]"
      />
    );
  }

  if (status === "In Progress") {
    return (
      <Clock3
        size={18}
        className="text-[#0B1F3A] dark:text-blue-300"
      />
    );
  }

  return (
    <AlertCircle
      size={18}
      className="text-[#D97706] dark:text-[#F28C28]"
    />
  );
}

function DashboardPreview() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    active: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    closed: 0,
    resolutionRate: 0,
  });

  useEffect(() => {
    const loadDashboardData = () => {
      const storedComplaints =
        getAllComplaints();

      setComplaints(storedComplaints);

      setStats(
        getComplaintStats(
          storedComplaints
        )
      );
    };

    loadDashboardData();

    const handleStorageChange = () => {
      loadDashboardData();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  const recentComplaints =
    complaints.slice(0, 3);

  const categoryCounts =
    complaints.reduce(
      (accumulator, complaint) => {
        const category =
          complaint.category ||
          complaint.aiCategory ||
          "Other";

        accumulator[category] =
          (accumulator[category] || 0) + 1;

        return accumulator;
      },
      {}
    );

  const categoryEntries = Object.entries(
    categoryCounts
  ).sort((a, b) => b[1] - a[1]);

  const categoryTotal =
    categoryEntries.reduce(
      (sum, [, count]) => sum + count,
      0
    );

  const displayedCategories =
    categoryEntries.slice(0, 4);

  const categoryColors = [
    "text-[#F28C28]",
    "text-blue-300",
    "text-green-400",
    "text-slate-300",
  ];

  return (
    <section className="border-t border-slate-200 bg-[#F8FAFC] py-24 dark:border-neutral-800 dark:bg-black">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D97706] dark:text-[#F28C28]">
            One Platform
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0B1F3A] dark:text-white md:text-5xl">
            Designed for citizens and authorities
          </h2>

          <p className="mt-5 leading-7 text-slate-600 dark:text-neutral-400">
            A unified interface for submitting grievances,
            monitoring cases, and managing the resolution
            workflow.
          </p>
        </div>

        {/* Dashboard */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
          {/* Dashboard header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1F3A] text-white dark:bg-white dark:text-black">
                <LayoutDashboard size={20} />
              </div>

              <div>
                <p className="font-bold text-[#0B1F3A] dark:text-white">
                  Authority Dashboard
                </p>

                <p className="text-xs text-slate-500 dark:text-neutral-500">
                  Live grievance management overview
                </p>
              </div>
            </div>

            <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-[#15803D] dark:bg-green-950/30 dark:text-green-400">
              System Operational
            </span>
          </div>

          {/* Dashboard body */}
          <div className="grid gap-6 p-6 lg:grid-cols-3">
            {/* Main complaints */}
            <div className="lg:col-span-2">
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Total */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
                  <FileText
                    className="text-[#0B1F3A] dark:text-white"
                    size={21}
                  />

                  <p className="mt-4 text-2xl font-bold text-[#0B1F3A] dark:text-white">
                    {stats.total}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-neutral-500">
                    Total grievances
                  </p>
                </div>

                {/* In Progress */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
                  <Clock3
                    className="text-[#D97706] dark:text-[#F28C28]"
                    size={21}
                  />

                  <p className="mt-4 text-2xl font-bold text-[#0B1F3A] dark:text-white">
                    {stats.inProgress}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-neutral-500">
                    In progress
                  </p>
                </div>

                {/* Resolved */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
                  <CheckCircle2
                    className="text-[#15803D]"
                    size={21}
                  />

                  <p className="mt-4 text-2xl font-bold text-[#0B1F3A] dark:text-white">
                    {stats.resolved}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-neutral-500">
                    Resolved
                  </p>
                </div>
              </div>

              {/* Complaint list */}
              <div className="mt-6 rounded-xl border border-slate-200 dark:border-neutral-800">
                <div className="border-b border-slate-200 px-5 py-4 dark:border-neutral-800">
                  <p className="font-semibold text-[#0B1F3A] dark:text-white">
                    Recent Grievances
                  </p>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-neutral-800">
                  {recentComplaints.length > 0 ? (
                    recentComplaints.map(
                      (complaint) => (
                        <div
                          key={complaint.id}
                          className="flex items-center justify-between gap-4 px-5 py-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#D97706] dark:bg-orange-950/30 dark:text-[#F28C28]">
                              {getComplaintIcon(
                                complaint.status
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#0B1F3A] dark:text-white">
                                {complaint.title ||
                                  "Untitled grievance"}
                              </p>

                              <p className="truncate text-xs text-slate-500 dark:text-neutral-500">
                                {complaint.ward
                                  ? `Ward ${complaint.ward} • `
                                  : ""}
                                {formatTimeAgo(
                                  complaint.createdAt
                                )}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              complaint.status
                            )}`}
                          >
                            {complaint.status ||
                              "Submitted"}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="px-5 py-10 text-center">
                      <FileText
                        size={26}
                        className="mx-auto text-slate-300 dark:text-neutral-700"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-neutral-400">
                        No grievances submitted yet
                      </p>

                      <p className="mt-1 text-xs text-slate-400 dark:text-neutral-600">
                        Submitted grievances will appear
                        here automatically.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="rounded-xl border border-slate-200 bg-[#0B1F3A] p-6 text-white dark:border-neutral-800 dark:bg-[#0A0A0A]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    Resolution Overview
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Based on submitted grievances
                  </p>
                </div>

                <TrendingUp
                  size={21}
                  className="text-[#F28C28]"
                />
              </div>

              <div className="mt-10">
                <p className="text-4xl font-bold">
                  {stats.resolutionRate}%
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Resolution rate
                </p>
              </div>

              {/* Progress */}
              <div className="mt-8">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-slate-400">
                    Overall progress
                  </span>

                  <span className="font-semibold text-[#F28C28]">
                    {stats.resolutionRate}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#F28C28] transition-all duration-500"
                    style={{
                      width: `${stats.resolutionRate}%`,
                    }}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mt-10">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Categories
                  </p>

                  <p className="text-xs text-slate-500">
                    {categoryTotal} total
                  </p>
                </div>

                {displayedCategories.length > 0 ? (
                  <div className="space-y-4">
                    {displayedCategories.map(
                      ([category, count], index) => {
                        const percentage =
                          categoryTotal > 0
                            ? Math.round(
                                (count /
                                  categoryTotal) *
                                  100
                              )
                            : 0;

                        return (
                          <div
                            key={category}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-slate-300">
                              {category}
                            </span>

                            <span
                              className={`text-sm font-semibold ${
                                categoryColors[
                                  index
                                ] ||
                                "text-slate-300"
                              }`}
                            >
                              {percentage}%
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-slate-400">
                    Category analytics will appear after
                    grievances are submitted.
                  </p>
                )}
              </div>

              {/* Additional status info */}
              {stats.total > 0 && (
                <div className="mt-10 border-t border-white/10 pt-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Submitted
                    </span>

                    <span className="font-semibold text-white">
                      {stats.submitted}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Active
                    </span>

                    <span className="font-semibold text-white">
                      {stats.active}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Closed
                    </span>

                    <span className="font-semibold text-white">
                      {stats.closed}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPreview;