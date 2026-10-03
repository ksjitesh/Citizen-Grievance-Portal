const COMPLAINTS_STORAGE_KEY =
  "civicai-complaints";

function generateReferenceId() {
  const timestamp = Date.now()
    .toString()
    .slice(-8);

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `CIV-${timestamp}-${random}`;
}

function getStoredComplaints() {
  try {
    const storedComplaints =
      localStorage.getItem(
        COMPLAINTS_STORAGE_KEY
      );

    if (!storedComplaints) {
      return [];
    }

    const parsedComplaints =
      JSON.parse(storedComplaints);

    return Array.isArray(parsedComplaints)
      ? parsedComplaints
      : [];
  } catch {
    return [];
  }
}

function saveComplaints(
  complaints
) {
  localStorage.setItem(
    COMPLAINTS_STORAGE_KEY,
    JSON.stringify(complaints)
  );

  /*
   * Custom event allows components in
   * the same browser tab to refresh their
   * complaint data immediately.
   */
  window.dispatchEvent(
    new CustomEvent(
      "civicai-complaints-updated"
    )
  );
}

export function createComplaint(
  complaintData
) {
  const complaints =
    getStoredComplaints();

  const now =
    new Date().toISOString();

  const complaint = {
    id: `GRV-${Date.now()}`,

    referenceId:
      generateReferenceId(),

    citizenId:
      complaintData.citizenId ||
      null,

    citizenName:
      complaintData.citizenName ||
      "",

    citizenEmail:
      complaintData.citizenEmail ||
      "",

    citizenPhone:
      complaintData.citizenPhone ||
      "",

    category:
      complaintData.category ||
      "Other",

    title:
      complaintData.title ||
      "",

    description:
      complaintData.description ||
      "",

    /*
     * Legacy address field is retained
     * for compatibility.
     *
     * New grievances use locality,
     * landmark, ward and GPS instead.
     */
    address:
      complaintData.address ||
      "",

    landmark:
      complaintData.landmark ||
      "",

    locality:
      complaintData.locality ||
      "",

    ward:
      complaintData.ward ||
      "",

    city:
      complaintData.city ||
      "",

    state:
      complaintData.state ||
      "",

    pincode:
      complaintData.pincode ||
      "",

    /*
     * GPS LOCATION
     */
    latitude:
      typeof complaintData.latitude ===
      "number"
        ? complaintData.latitude
        : null,

    longitude:
      typeof complaintData.longitude ===
      "number"
        ? complaintData.longitude
        : null,

    locationAccuracy:
      typeof complaintData.locationAccuracy ===
      "number"
        ? complaintData.locationAccuracy
        : null,

    department:
      complaintData.department ||
      "General Administration",

    priority:
      complaintData.priority ||
      "Medium",

    aiCategory:
      complaintData.aiCategory ||
      null,

    aiSummary:
      complaintData.aiSummary ||
      null,

    aiConfidence:
      complaintData.aiConfidence ??
      null,

    duplicateOf:
      complaintData.duplicateOf ||
      null,

    status:
      complaintData.status ||
      "Submitted",

    statusHistory: [
      {
        status:
          complaintData.status ||
          "Submitted",

        timestamp: now,

        note:
          "Grievance submitted successfully.",
      },
    ],

    attachments:
      Array.isArray(
        complaintData.attachments
      )
        ? complaintData.attachments
        : [],

    createdAt:
      complaintData.createdAt ||
      now,

    updatedAt: now,
  };

  const updatedComplaints = [
    complaint,
    ...complaints,
  ];

  saveComplaints(
    updatedComplaints
  );

  return complaint;
}

export function getAllComplaints() {
  return getStoredComplaints();
}

export function getComplaintByReference(
  referenceId
) {
  if (!referenceId) {
    return null;
  }

  const complaints =
    getStoredComplaints();

  const normalizedReference =
    referenceId.trim().toUpperCase();

  return (
    complaints.find(
      (complaint) =>
        complaint.referenceId.toUpperCase() ===
        normalizedReference
    ) || null
  );
}

export function getComplaintsByUser(
  citizenId
) {
  if (!citizenId) {
    return [];
  }

  const complaints =
    getStoredComplaints();

  return complaints.filter(
    (complaint) =>
      complaint.citizenId ===
      citizenId
  );
}

export function updateComplaint(
  complaintId,
  updates
) {
  const complaints =
    getStoredComplaints();

  const complaintIndex =
    complaints.findIndex(
      (complaint) =>
        complaint.id === complaintId
    );

  if (complaintIndex === -1) {
    return {
      success: false,
      message:
        "Complaint not found.",
    };
  }

  const existingComplaint =
    complaints[complaintIndex];

  const now =
    new Date().toISOString();

  const updatedComplaint = {
    ...existingComplaint,
    ...updates,
    updatedAt: now,
  };

  /*
   * Preserve numeric GPS values
   * when they are updated.
   */
  if (
    updates.latitude !==
    undefined
  ) {
    updatedComplaint.latitude =
      typeof updates.latitude ===
      "number"
        ? updates.latitude
        : null;
  }

  if (
    updates.longitude !==
    undefined
  ) {
    updatedComplaint.longitude =
      typeof updates.longitude ===
      "number"
        ? updates.longitude
        : null;
  }

  if (
    updates.locationAccuracy !==
    undefined
  ) {
    updatedComplaint.locationAccuracy =
      typeof updates.locationAccuracy ===
      "number"
        ? updates.locationAccuracy
        : null;
  }

  /*
   * Add status history whenever
   * the complaint status changes.
   */
  if (
    updates.status &&
    updates.status !==
      existingComplaint.status
  ) {
    const history =
      Array.isArray(
        existingComplaint.statusHistory
      )
        ? existingComplaint.statusHistory
        : [];

    updatedComplaint.statusHistory = [
      ...history,
      {
        status:
          updates.status,

        timestamp: now,

        note:
          updates.statusNote ||
          `Status changed to ${updates.status}.`,
      },
    ];
  }

  delete updatedComplaint.statusNote;

  const updatedComplaints = [
    ...complaints,
  ];

  updatedComplaints[
    complaintIndex
  ] = updatedComplaint;

  saveComplaints(
    updatedComplaints
  );

  return {
    success: true,
    complaint:
      updatedComplaint,
  };
}

export function deleteComplaint(
  complaintId
) {
  const complaints =
    getStoredComplaints();

  const complaintExists =
    complaints.some(
      (complaint) =>
        complaint.id === complaintId
    );

  if (!complaintExists) {
    return {
      success: false,
      message:
        "Complaint not found.",
    };
  }

  const updatedComplaints =
    complaints.filter(
      (complaint) =>
        complaint.id !== complaintId
    );

  saveComplaints(
    updatedComplaints
  );

  return {
    success: true,
  };
}

export function getComplaintStats(
  complaints = getStoredComplaints()
) {
  const total =
    complaints.length;

  const submitted =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "Submitted"
    ).length;

  const inProgress =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "In Progress"
    ).length;

  const resolved =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "Resolved"
    ).length;

  const rejected =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "Rejected"
    ).length;

  const closed =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "Closed"
    ).length;

  const active =
    total -
    resolved -
    rejected -
    closed;

  const resolutionRate =
    total > 0
      ? Math.round(
          (resolved / total) * 100
        )
      : 0;

  return {
    total,
    submitted,
    active,
    inProgress,
    resolved,
    rejected,
    closed,
    resolutionRate,
  };
}

/*
 * --------------------------------------------------
 * LOCATION HELPERS
 * --------------------------------------------------
 */

export function hasComplaintLocation(
  complaint
) {
  return (
    typeof complaint?.latitude ===
      "number" &&
    typeof complaint?.longitude ===
      "number"
  );
}

export function getComplaintCoordinates(
  complaint
) {
  if (
    !hasComplaintLocation(
      complaint
    )
  ) {
    return null;
  }

  return {
    latitude:
      complaint.latitude,

    longitude:
      complaint.longitude,

    accuracy:
      complaint.locationAccuracy ??
      null,
  };
}