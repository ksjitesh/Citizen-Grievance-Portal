import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  Inbox,
  LoaderCircle,
  MapPin,
  Search,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  getComplaintsByUser,
  getComplaintStats,
} from "../services/complaintService";

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusClasses(status) {
  switch (status) {
    case "Resolved":
      return "border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-400";

    case "In Progress":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-400";

    case "Rejected":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400";

    case "Closed":
      return "border-slate-200 bg-slate-100 text-slate-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400";

    default:
      return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-[#F28C28]";
  }
}

function getPriorityClasses(priority) {
  switch (priority) {
    case "Critical":
      return "text-red-600 dark:text-red-400";

    case "High":
      return "text-orange-600 dark:text-orange-400";

    case "Low":
      return "text-slate-500 dark:text-slate-400";

    default:
      return "text-blue-600 dark:text-blue-400";
  }
}

function getStatusIcon(status) {
  if (status === "Resolved") {
    return (
      <CheckCircle2
        size={18}
        className="text-green-600 dark:text-green-400"
      />
    );
  }

  if (status === "In Progress") {
    return (
      <Clock3
        size={18}
        className="text-blue-600 dark:text-blue-400"
      />
    );
  }

  if (status === "Rejected") {
    return (
      <AlertCircle
        size={18}
        className="text-red-600 dark:text-red-400"
      />
    );
  }

  return (
    <FileText
      size={18}
      className="text-[#D97706] dark:text-[#F28C28]"
    />
  );
}

function MyGrievances() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const loadComplaints = () => {
    if (!user?.id) {
      setComplaints([]);
      setLoading(false);
      return;
    }

    const userComplaints =
      getComplaintsByUser(user.id);

    setComplaints(userComplaints);
    setLoading(false);
  };

  useEffect(() => {
    loadComplaints();

    const handleStorageChange = () => {
      loadComplaints();
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
  }, [user?.id]);

  const stats = useMemo(() => {
    return getComplaintStats(complaints);
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const matchesStatus =
        statusFilter === "All" ||
        complaint.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        complaint.referenceId,
        complaint.title,
        complaint.category,
        complaint.description,
        complaint.city,
        complaint.ward,
      ]
        .filter(Boolean)
        .some((value) =>
          value
            .toString()
            .toLowerCase()
            .includes(normalizedSearch)
        );
    });
  }, [
    complaints,
    searchQuery,
    statusFilter,
  ]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 transition-colors duration-300 dark:bg-black dark:text-white">
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-8 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#D97706] dark:text-slate-400 dark:hover:bg-[#111111] dark:hover:text-[#F28C28]"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D97706]/20 bg-[#D97706]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#B45309] dark:border-[#F28C28]/20 dark:bg-[#F28C28]/10 dark:text-[#F28C28]">
              <ShieldCheck size={14} />
              Citizen Portal
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              My Grievances
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              View and track all civic grievances
              submitted from your account.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/report-grievance")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#12355B] dark:bg-[#F28C28] dark:text-black dark:hover:bg-[#FB923C]"
          >
            <FileText size={17} />
            Report New Grievance
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-[#262626] dark:bg-[#0A0A0A]">
            <div className="flex items-center justify-between">
              <FileText
                size={21}
                className="text-[#0B1F3A] dark:text-white"
              />

              <span className="text-xs font-semibold text-slate-400">
                Total
              </span>
            </div>

            <p className="mt-4 text-3xl font-black">
              {stats.total}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              All submitted grievances
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-[#262626] dark:bg-[#0A0A0A]">
            <div className="flex items-center justify-between">
              <Clock3
                size={21}
                className="text-[#D97706] dark:text-[#F28C28]"
              />

              <span className="text-xs font-semibold text-slate-400">
                Active
              </span>
            </div>

            <p className="mt-4 text-3xl font-black">
              {stats.active}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              Currently being processed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-[#262626] dark:bg-[#0A0A0A]">
            <div className="flex items-center justify-between">
              <CheckCircle2
                size={21}
                className="text-green-600 dark:text-green-400"
              />

              <span className="text-xs font-semibold text-slate-400">
                Resolved
              </span>
            </div>

            <p className="mt-4 text-3xl font-black">
              {stats.resolved}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              Successfully resolved
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-[#262626] dark:bg-[#0A0A0A]">
            <div className="flex items-center justify-between">
              <CheckCircle2
                size={21}
                className="text-[#15803D]"
              />

              <span className="text-xs font-semibold text-slate-400">
                Rate
              </span>
            </div>

            <p className="mt-4 text-3xl font-black">
              {stats.resolutionRate}%
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              Resolution rate
            </p>
          </div>
        </div>

        {/* Filters */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#262626] dark:bg-[#0A0A0A] sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search by reference ID, title, category..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/10 dark:border-[#262626] dark:bg-[#111111] dark:text-white dark:placeholder:text-slate-600 dark:focus:border-[#F28C28]"
              />
            </div>

            <div className="relative">
              <Filter
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium outline-none dark:border-[#262626] dark:bg-[#111111] dark:text-white lg:w-48"
              >
                <option value="All">
                  All Status
                </option>
                <option value="Submitted">
                  Submitted
                </option>
                <option value="In Progress">
                  In Progress
                </option>
                <option value="Resolved">
                  Resolved
                </option>
                <option value="Rejected">
                  Rejected
                </option>
                <option value="Closed">
                  Closed
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Complaint List */}
        <section className="mt-6">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center dark:border-[#262626] dark:bg-[#0A0A0A]">
              <LoaderCircle
                size={30}
                className="mx-auto animate-spin text-[#D97706] dark:text-[#F28C28]"
              />

              <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                Loading your grievances...
              </p>
            </div>
          ) : filteredComplaints.length > 0 ? (
            <div className="space-y-4">
              {filteredComplaints.map(
                (complaint) => (
                  <article
                    key={complaint.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-[#262626] dark:bg-[#0A0A0A] sm:p-6"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                              complaint.status
                            )}`}
                          >
                            {getStatusIcon(
                              complaint.status
                            )}

                            {complaint.status ||
                              "Submitted"}
                          </span>

                          <span
                            className={`text-xs font-bold ${getPriorityClasses(
                              complaint.priority
                            )}`}
                          >
                            {complaint.priority ||
                              "Medium"}{" "}
                            Priority
                          </span>
                        </div>

                        <h2 className="mt-3 truncate text-lg font-bold text-[#0B1F3A] dark:text-white">
                          {complaint.title ||
                            "Untitled grievance"}
                        </h2>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {complaint.description ||
                            "No description available."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <FileText size={14} />
                            {complaint.referenceId}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={14} />
                            {formatDate(
                              complaint.createdAt
                            )}
                          </span>

                          {complaint.city && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={14} />
                              {complaint.city}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/track-complaint?reference=${encodeURIComponent(
                              complaint.referenceId
                            )}`
                          )
                        }
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-[#0B1F3A] transition hover:border-[#D97706] hover:bg-orange-50 hover:text-[#D97706] dark:border-[#2A2A2A] dark:text-white dark:hover:border-[#F28C28] dark:hover:bg-[#111111] dark:hover:text-[#F28C28]"
                      >
                        Track
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          ) : complaints.length > 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-[#2A2A2A] dark:bg-[#0A0A0A]">
              <Search
                size={30}
                className="mx-auto text-slate-300 dark:text-slate-700"
              />

              <h3 className="mt-4 text-lg font-bold">
                No matching grievances
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Try changing your search text or status
                filter.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-[#2A2A2A] dark:bg-[#0A0A0A]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-[#151515] dark:text-slate-400">
                <Inbox size={26} />
              </div>

              <h3 className="mt-5 text-lg font-bold">
                No grievances yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                You have not submitted any civic grievance
                from this account yet.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/report-grievance")
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#D97706] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#B45309] dark:bg-[#F28C28] dark:text-black dark:hover:bg-[#FB923C]"
              >
                Report Your First Grievance
                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default MyGrievances;