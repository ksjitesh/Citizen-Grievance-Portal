import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  Filter,
  Gauge,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllComplaints,
  getComplaintStats,
  updateComplaint,
} from "../services/complaintService";

import {
  findPossibleDuplicates,
  getAIStatusLabel,
} from "../services/aiService";

const STATUS_OPTIONS = [
  "All",
  "Submitted",
  "In Progress",
  "Resolved",
  "Rejected",
  "Closed",
];

const PRIORITY_OPTIONS = [
  "All",
  "Critical",
  "High",
  "Medium",
  "Low",
];

const STATUS_CONFIG = {
  Submitted: {
    icon: Clock3,
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  },

  "In Progress": {
    icon: RefreshCw,
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  },

  Resolved: {
    icon: CheckCircle2,
    className:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900",
  },

  Rejected: {
    icon: XCircle,
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  },

  Closed: {
    icon: ShieldCheck,
    className:
      "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-700",
  },
};

const PRIORITY_CONFIG = {
  Critical:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",

  High:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900",

  Medium:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",

  Low:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900",
};

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatShortDate(dateValue) {
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

function getLocationText(complaint) {
  const parts = [
    complaint.locality,
    complaint.ward,
    complaint.city,
    complaint.state,
    complaint.pincode,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  if (complaint.address) {
    return complaint.address;
  }

  return "Location not provided";
}

function hasCoordinates(complaint) {
  return (
    typeof complaint?.latitude === "number" &&
    typeof complaint?.longitude === "number"
  );
}

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      icon: Clock3,
      className:
        "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-700",
    }
  );
}

function StatusBadge({ status }) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon size={13} />
      {status || "Unknown"}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const className =
    PRIORITY_CONFIG[priority] ||
    "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {priority || "Unknown"}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
  accent,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-[#262626] dark:bg-[#0A0A0A]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-neutral-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-neutral-500">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function AuthorityDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const [loading, setLoading] = useState(true);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [statusNote, setStatusNote] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadComplaints = () => {
      setLoading(true);

      const data = getAllComplaints();

      setComplaints(
        Array.isArray(data) ? data : []
      );

      setLoading(false);
    };

    loadComplaints();

    const handleUpdate = () => {
      loadComplaints();
    };

    window.addEventListener(
      "civicai-complaints-updated",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "civicai-complaints-updated",
        handleUpdate
      );
    };
  }, [refreshKey]);

  const stats = useMemo(() => {
    return getComplaintStats(complaints);
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          complaint.referenceId,
          complaint.title,
          complaint.description,
          complaint.citizenName,
          complaint.citizenEmail,
          complaint.category,
          complaint.aiCategory,
          complaint.department,
          complaint.city,
          complaint.locality,
          complaint.ward,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(normalizedSearch)
          );

      const matchesStatus =
        statusFilter === "All" ||
        complaint.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        complaint.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    complaints,
    searchQuery,
    statusFilter,
    priorityFilter,
  ]);

  const selectedDuplicates = useMemo(() => {
    if (!selectedComplaint) {
      return [];
    }

    return findPossibleDuplicates(
      selectedComplaint,
      complaints.filter(
        (complaint) =>
          complaint.id !==
          selectedComplaint.id
      )
    );
  }, [
    selectedComplaint,
    complaints,
  ]);

  const handleRefresh = () => {
    setRefreshKey((current) => current + 1);
  };

  const openComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setStatusNote("");
  };

  const closeComplaint = () => {
    if (updatingStatus) {
      return;
    }

    setSelectedComplaint(null);
    setStatusNote("");
  };

  const handleStatusUpdate = (
    nextStatus
  ) => {
    if (
      !selectedComplaint ||
      !nextStatus ||
      nextStatus ===
        selectedComplaint.status
    ) {
      return;
    }

    setUpdatingStatus(true);

    const result = updateComplaint(
      selectedComplaint.id,
      {
        status: nextStatus,
        statusNote:
          statusNote.trim() ||
          `Authority updated the complaint status to ${nextStatus}.`,
      }
    );

    if (result.success) {
      setSelectedComplaint(
        result.complaint
      );

      setStatusNote("");

      setComplaints(
        getAllComplaints()
      );
    }

    setUpdatingStatus(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-black dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
            >
              <ArrowLeft size={17} />
              Back to Portal
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1F3A] text-white dark:bg-white dark:text-black">
                <ShieldCheck
                  size={24}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Authority Dashboard
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
                  CivicAI grievance management and
                  case monitoring
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-[#262626] dark:bg-[#0A0A0A] dark:text-neutral-200 dark:hover:bg-[#111111]"
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Complaints"
            value={stats.total}
            icon={FileText}
            description="All registered grievances"
            accent="bg-slate-100 text-slate-700 dark:bg-neutral-900 dark:text-white"
          />

          <StatCard
            label="Submitted"
            value={stats.submitted}
            icon={Clock3}
            description="Awaiting processing"
            accent="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
          />

          <StatCard
            label="Active Cases"
            value={stats.active}
            icon={Gauge}
            description="Currently under action"
            accent="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          />

          <StatCard
            label="Resolved"
            value={`${stats.resolutionRate}%`}
            icon={CheckCircle2}
            description={`${stats.resolved} resolved complaints`}
            accent="bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
          />
        </div>

        {/* FILTER AREA */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#262626] dark:bg-[#0A0A0A]">
          <div className="mb-4 flex items-center gap-2">
            <Filter
              size={18}
              className="text-[#D97706]"
            />

            <h2 className="font-semibold">
              Complaint Management
            </h2>

            <span className="ml-auto text-xs text-slate-500 dark:text-neutral-500">
              {filteredComplaints.length} of{" "}
              {complaints.length} cases
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_190px_190px_auto]">
            {/* SEARCH */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search reference, citizen, category, department..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/10 dark:border-[#262626] dark:bg-[#111111] dark:text-white dark:placeholder:text-neutral-600"
              />
            </div>

            {/* STATUS */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-medium outline-none focus:border-[#D97706] dark:border-[#262626] dark:bg-[#111111] dark:text-white"
              >
                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status === "All"
                        ? "All Statuses"
                        : status}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* PRIORITY */}
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-medium outline-none focus:border-[#D97706] dark:border-[#262626] dark:bg-[#111111] dark:text-white"
              >
                {PRIORITY_OPTIONS.map(
                  (priority) => (
                    <option
                      key={priority}
                      value={priority}
                    >
                      {priority === "All"
                        ? "All Priorities"
                        : priority}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* RESET */}
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
                setPriorityFilter("All");
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-[#262626] dark:bg-[#0A0A0A] dark:text-neutral-300 dark:hover:bg-[#111111]"
            >
              Reset
            </button>
          </div>
        </div>

        {/* COMPLAINT TABLE */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#262626] dark:bg-[#0A0A0A]">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-neutral-400">
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />
                Loading complaints...
              </div>
            </div>
          ) : filteredComplaints.length ===
            0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-neutral-900 dark:text-neutral-400">
                <FileText size={28} />
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                No complaints found
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-neutral-500">
                Try changing your search query or
                filters. New citizen grievances will
                appear here automatically.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-[#262626] dark:bg-[#111111]">
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-500">
                        Complaint
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-500">
                        Citizen
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-500">
                        AI Classification
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-500">
                        Priority
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-500">
                        Date
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredComplaints.map(
                      (complaint) => {
                        const duplicateCount =
                          findPossibleDuplicates(
                            complaint,
                            complaints.filter(
                              (item) =>
                                item.id !==
                                complaint.id
                            )
                          ).length;

                        return (
                          <tr
                            key={complaint.id}
                            className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-[#1c1c1c] dark:hover:bg-[#111111]"
                          >
                            <td className="px-5 py-4">
                              <div className="max-w-[260px]">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-semibold">
                                    {complaint.title ||
                                      "Untitled grievance"}
                                  </p>

                                  {duplicateCount >
                                    0 && (
                                    <span
                                      title={`${duplicateCount} possible duplicate case(s)`}
                                      className="shrink-0 text-orange-500"
                                    >
                                      <AlertTriangle
                                        size={
                                          15
                                        }
                                      />
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 text-xs font-medium text-[#D97706]">
                                  {complaint.referenceId ||
                                    "No reference"}
                                </p>

                                <p className="mt-1 truncate text-xs text-slate-500 dark:text-neutral-500">
                                  {getLocationText(
                                    complaint
                                  )}
                                </p>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm font-medium">
                                {complaint.citizenName ||
                                  "Anonymous"}
                              </p>

                              <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500 dark:text-neutral-500">
                                {complaint.citizenEmail ||
                                  "No email"}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <div className="max-w-[220px]">
                                <p className="text-sm font-medium">
                                  {complaint.aiCategory ||
                                    complaint.category ||
                                    "Other"}
                                </p>

                                <p className="mt-1 truncate text-xs text-slate-500 dark:text-neutral-500">
                                  {complaint.department ||
                                    "General Administration"}
                                </p>

                                {complaint.aiConfidence !==
                                  null &&
                                  complaint.aiConfidence !==
                                    undefined && (
                                    <p className="mt-1 text-[11px] text-slate-400 dark:text-neutral-600">
                                      {Math.round(
                                        complaint.aiConfidence *
                                          100
                                      )}
                                      % confidence
                                    </p>
                                  )}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <PriorityBadge
                                priority={
                                  complaint.priority
                                }
                              />
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge
                                status={
                                  complaint.status
                                }
                              />
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm text-slate-600 dark:text-neutral-300">
                                {formatShortDate(
                                  complaint.createdAt
                                )}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  openComplaint(
                                    complaint
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-[#262626] dark:text-neutral-200 dark:hover:bg-[#111111]"
                              >
                                <Eye size={15} />
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET CARDS */}
              <div className="divide-y divide-slate-100 lg:hidden dark:divide-[#1c1c1c]">
                {filteredComplaints.map(
                  (complaint) => {
                    const duplicateCount =
                      findPossibleDuplicates(
                        complaint,
                        complaints.filter(
                          (item) =>
                            item.id !==
                            complaint.id
                        )
                      ).length;

                    return (
                      <div
                        key={complaint.id}
                        className="p-4 sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-sm font-bold">
                                {complaint.title ||
                                  "Untitled grievance"}
                              </h3>

                              {duplicateCount >
                                0 && (
                                <AlertTriangle
                                  size={15}
                                  className="shrink-0 text-orange-500"
                                />
                              )}
                            </div>

                            <p className="mt-1 text-xs font-semibold text-[#D97706]">
                              {complaint.referenceId ||
                                "No reference"}
                            </p>
                          </div>

                          <StatusBadge
                            status={
                              complaint.status
                            }
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-neutral-600">
                              Citizen
                            </p>

                            <p className="mt-1 truncate text-sm font-medium">
                              {complaint.citizenName ||
                                "Anonymous"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-neutral-600">
                              Category
                            </p>

                            <p className="mt-1 truncate text-sm font-medium">
                              {complaint.aiCategory ||
                                complaint.category ||
                                "Other"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-neutral-600">
                              Priority
                            </p>

                            <div className="mt-1">
                              <PriorityBadge
                                priority={
                                  complaint.priority
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-neutral-600">
                              Date
                            </p>

                            <p className="mt-1 text-sm">
                              {formatShortDate(
                                complaint.createdAt
                              )}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            openComplaint(
                              complaint
                            )
                          }
                          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 dark:border-[#262626] dark:hover:bg-[#111111]"
                        >
                          <Eye size={16} />
                          View Complaint
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-6">
          <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#262626] dark:bg-[#0A0A0A]">
            {/* MODAL HEADER */}
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-[#262626] sm:px-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-bold sm:text-xl">
                    {selectedComplaint.title ||
                      "Complaint Details"}
                  </h2>

                  <PriorityBadge
                    priority={
                      selectedComplaint.priority
                    }
                  />
                </div>

                <p className="mt-1 text-sm font-semibold text-[#D97706]">
                  {selectedComplaint.referenceId}
                </p>
              </div>

              <button
                type="button"
                onClick={closeComplaint}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-[#262626] dark:text-neutral-400 dark:hover:bg-[#111111]"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="overflow-y-auto px-5 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
                {/* LEFT */}
                <div className="space-y-5">
                  {/* STATUS */}
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-[#262626]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-neutral-600">
                          Current Status
                        </p>

                        <div className="mt-2">
                          <StatusBadge
                            status={
                              selectedComplaint.status
                            }
                          />
                        </div>
                      </div>

                      <div className="w-full sm:max-w-[240px]">
                        <select
                          value={
                            selectedComplaint.status ||
                            "Submitted"
                          }
                          disabled={
                            updatingStatus
                          }
                          onChange={(event) =>
                            handleStatusUpdate(
                              event.target.value
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-[#D97706] disabled:opacity-60 dark:border-[#262626] dark:bg-[#111111] dark:text-white"
                        >
                          {STATUS_OPTIONS.filter(
                            (status) =>
                              status !== "All"
                          ).map(
                            (status) => (
                              <option
                                key={status}
                                value={status}
                              >
                                {status}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-xs font-semibold text-slate-500 dark:text-neutral-400">
                        Status update note
                      </label>

                      <textarea
                        value={statusNote}
                        onChange={(event) =>
                          setStatusNote(
                            event.target.value
                          )
                        }
                        rows={2}
                        placeholder="Optional note for the citizen..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#D97706] dark:border-[#262626] dark:bg-[#111111] dark:text-white dark:placeholder:text-neutral-600"
                      />
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-[#262626]">
                    <div className="flex items-center gap-2">
                      <FileText
                        size={17}
                        className="text-[#D97706]"
                      />

                      <h3 className="font-semibold">
                        Complaint Description
                      </h3>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-neutral-300">
                      {selectedComplaint.description ||
                        "No description provided."}
                    </p>
                  </div>

                  {/* CITIZEN */}
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-[#262626]">
                    <h3 className="font-semibold">
                      Citizen Information
                    </h3>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-400 dark:text-neutral-600">
                          Full Name
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {selectedComplaint.citizenName ||
                            "Not provided"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 dark:text-neutral-600">
                          Email
                        </p>

                        <p className="mt-1 break-all text-sm font-medium">
                          {selectedComplaint.citizenEmail ||
                            "Not provided"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 dark:text-neutral-600">
                          Phone
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {selectedComplaint.citizenPhone ||
                            "Not provided"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400 dark:text-neutral-600">
                          Submitted
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatDate(
                            selectedComplaint.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-[#262626]">
                    <div className="flex items-center gap-2">
                      <MapPin
                        size={17}
                        className="text-[#D97706]"
                      />

                      <h3 className="font-semibold">
                        Complaint Location
                      </h3>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-xs text-slate-400 dark:text-neutral-600">
                          Address / Area
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {getLocationText(
                            selectedComplaint
                          )}
                        </p>
                      </div>

                      {selectedComplaint.landmark && (
                        <div>
                          <p className="text-xs text-slate-400 dark:text-neutral-600">
                            Landmark
                          </p>

                          <p className="mt-1 text-sm">
                            {
                              selectedComplaint.landmark
                            }
                          </p>
                        </div>
                      )}

                      {hasCoordinates(
                        selectedComplaint
                      ) && (
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-[#111111]">
                          <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                            GPS Coordinates
                          </p>

                          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            <div>
                              <p className="text-[11px] text-slate-400 dark:text-neutral-600">
                                Latitude
                              </p>

                              <p className="text-sm font-medium">
                                {selectedComplaint.latitude.toFixed(
                                  6
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] text-slate-400 dark:text-neutral-600">
                                Longitude
                              </p>

                              <p className="text-sm font-medium">
                                {selectedComplaint.longitude.toFixed(
                                  6
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] text-slate-400 dark:text-neutral-600">
                                Accuracy
                              </p>

                              <p className="text-sm font-medium">
                                {selectedComplaint.locationAccuracy
                                  ? `${Math.round(
                                      selectedComplaint.locationAccuracy
                                    )} m`
                                  : "Not available"}
                              </p>
                            </div>
                          </div>

                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${selectedComplaint.latitude},${selectedComplaint.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#D97706] hover:underline"
                          >
                            <MapPin size={15} />
                            Open in Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* STATUS HISTORY */}
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-[#262626]">
                    <h3 className="font-semibold">
                      Status History
                    </h3>

                    {Array.isArray(
                      selectedComplaint.statusHistory
                    ) &&
                    selectedComplaint
                      .statusHistory.length >
                      0 ? (
                      <div className="mt-4 space-y-4">
                        {[
                          ...selectedComplaint.statusHistory,
                        ]
                          .reverse()
                          .map(
                            (
                              history,
                              index
                            ) => (
                              <div
                                key={`${history.timestamp}-${index}`}
                                className="relative pl-7"
                              >
                                <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-[#D97706]" />

                                {index <
                                  selectedComplaint
                                    .statusHistory
                                    .length -
                                    1 && (
                                  <div className="absolute left-[4px] top-4 h-full w-px bg-slate-200 dark:bg-[#262626]" />
                                )}

                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <StatusBadge
                                      status={
                                        history.status
                                      }
                                    />

                                    <span className="text-xs text-slate-400 dark:text-neutral-600">
                                      {formatDate(
                                        history.timestamp
                                      )}
                                    </span>
                                  </div>

                                  <p className="mt-2 text-sm text-slate-600 dark:text-neutral-300">
                                    {history.note ||
                                      "No additional note."}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500 dark:text-neutral-500">
                        No status history available.
                      </p>
                    )}
                  </div>
                </div>

                {/* RIGHT */}
                <div className="space-y-5">
                  {/* AI ANALYSIS */}
                  <div className="rounded-2xl border border-[#F2C078] bg-orange-50/50 p-4 dark:border-[#5A3A16] dark:bg-[#17100A]">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D97706] text-white">
                        <Brain size={18} />
                      </div>

                      <div>
                        <h3 className="font-semibold">
                          AI Analysis
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-neutral-500">
                          Automated grievance intelligence
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-neutral-500">
                          Category
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {selectedComplaint.aiCategory ||
                            selectedComplaint.category ||
                            "Other"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 dark:text-neutral-500">
                          Department
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {selectedComplaint.department ||
                            "General Administration"}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-slate-500 dark:text-neutral-500">
                            AI Confidence
                          </p>

                          {selectedComplaint.aiConfidence !==
                            null &&
                          selectedComplaint.aiConfidence !==
                            undefined ? (
                            <span className="text-xs font-bold text-[#D97706]">
                              {Math.round(
                                selectedComplaint.aiConfidence *
                                  100
                              )}
                              %
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">
                              N/A
                            </span>
                          )}
                        </div>

                        {selectedComplaint.aiConfidence !==
                          null &&
                          selectedComplaint.aiConfidence !==
                            undefined && (
                            <>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-orange-100 dark:bg-[#2A1A08]">
                                <div
                                  className="h-full rounded-full bg-[#D97706] transition-all"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.max(
                                        0,
                                        selectedComplaint.aiConfidence *
                                          100
                                      )
                                    )}%`,
                                  }}
                                />
                              </div>

                              <p className="mt-1 text-[11px] text-slate-500 dark:text-neutral-500">
                                {getAIStatusLabel(
                                  selectedComplaint.aiConfidence
                                )}
                              </p>
                            </>
                          )}
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 dark:text-neutral-500">
                          AI Summary
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-neutral-300">
                          {selectedComplaint.aiSummary ||
                            "No AI summary is available for this complaint."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DUPLICATE WARNING */}
                  <div
                    className={`rounded-2xl border p-4 ${
                      selectedDuplicates.length >
                      0
                        ? "border-orange-200 bg-orange-50 dark:border-[#5A3A16] dark:bg-[#17100A]"
                        : "border-green-200 bg-green-50 dark:border-[#164A2A] dark:bg-[#09150D]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 ${
                          selectedDuplicates.length >
                          0
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {selectedDuplicates.length >
                        0 ? (
                          <AlertTriangle
                            size={19}
                          />
                        ) : (
                          <CheckCircle2
                            size={19}
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold">
                          {selectedDuplicates.length >
                          0
                            ? "Possible Duplicate Cases"
                            : "No Strong Duplicate Match"}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-neutral-400">
                          {selectedDuplicates.length >
                          0
                            ? "AI similarity analysis found potentially related complaints."
                            : "No complaint crossed the current duplicate similarity threshold."}
                        </p>
                      </div>
                    </div>

                    {selectedDuplicates.length >
                      0 && (
                      <div className="mt-4 space-y-2">
                        {selectedDuplicates.map(
                          (duplicate) => (
                            <button
                              type="button"
                              key={
                                duplicate.id
                              }
                              onClick={() => {
                                const target =
                                  complaints.find(
                                    (
                                      item
                                    ) =>
                                      item.id ===
                                      duplicate.id
                                  );

                                if (
                                  target
                                ) {
                                  setSelectedComplaint(
                                    target
                                  );
                                }
                              }}
                              className="w-full rounded-xl border border-orange-200 bg-white p-3 text-left transition hover:border-orange-300 dark:border-[#5A3A16] dark:bg-[#0A0A0A]"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-bold text-[#D97706]">
                                  {
                                    duplicate.referenceId
                                  }
                                </span>

                                <span className="text-xs font-bold text-orange-600">
                                  {
                                    duplicate.similarity
                                  }
                                  % match
                                </span>
                              </div>

                              <p className="mt-1 truncate text-sm font-medium">
                                {
                                  duplicate.title
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-500 dark:text-neutral-500">
                                Status:{" "}
                                {
                                  duplicate.status
                                }
                              </p>
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* CASE METADATA */}
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-[#262626]">
                    <h3 className="font-semibold">
                      Case Information
                    </h3>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-neutral-500">
                          Case ID
                        </span>

                        <span className="break-all text-right text-xs font-medium">
                          {selectedComplaint.id}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-neutral-500">
                          Created
                        </span>

                        <span className="text-right text-xs font-medium">
                          {formatDate(
                            selectedComplaint.createdAt
                          )}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-neutral-500">
                          Last Updated
                        </span>

                        <span className="text-right text-xs font-medium">
                          {formatDate(
                            selectedComplaint.updatedAt
                          )}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-neutral-500">
                          Location Status
                        </span>

                        <span
                          className={`text-right text-xs font-semibold ${
                            hasCoordinates(
                              selectedComplaint
                            )
                              ? "text-green-600"
                              : "text-slate-500 dark:text-neutral-500"
                          }`}
                        >
                          {hasCoordinates(
                            selectedComplaint
                          )
                            ? "GPS available"
                            : "No GPS data"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 dark:border-[#262626] sm:px-6">
              <p className="hidden text-xs text-slate-400 dark:text-neutral-600 sm:block">
                Last updated{" "}
                {formatDate(
                  selectedComplaint.updatedAt
                )}
              </p>

              <button
                type="button"
                onClick={closeComplaint}
                disabled={updatingStatus}
                className="ml-auto rounded-xl bg-[#0B1F3A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#12355B] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Close Case View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}