import React, { useEffect, useState } from "react";
import { apiGetPartners } from "../../../../utils/api";
import { apiApprovePartner } from "../../../../utils/api";
import { apiGetPdfStatsCounts } from "../../../../utils/api";
import { useAuth } from "../../../../context/AuthContext";
import "./ApprovalsSection.css";

const RECORDS_PER_PAGE = 12;

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const EyeIcon = () => (
  <img src="/eye-svg.svg" alt="" aria-hidden="true" className="icon-btn__img" />
);

const CheckIcon = () => (
  <img src="/checkbox.svg" alt="" aria-hidden="true" className="icon-btn__img" />
);

const CrossIcon = () => (
  <img src="/cross-circle.svg" alt="" aria-hidden="true" className="icon-btn__img" />
);

const ApprovalsSection = () => {
  const { token } = useAuth();
  const [partners, setPartners] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [actionModal, setActionModal] = useState({
    open: false,
    partner: null,
    action: null,
  });
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfStats, setPdfStats] = useState(null);

  const fetchPdfStats = async () => {
    try {
      const stats = await apiGetPdfStatsCounts(token);
      setPdfStats(stats);
    } catch {
      // stats are non-critical; silently ignore so the list still renders
      setPdfStats(null);
    }
  };

  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetPartners(token, statusFilter);
      setPartners(data);
    } catch (err) {
      setError(err.message || "Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPartners();
    // refetch whenever the auth token or the status filter changes
  }, [token, statusFilter]);

  useEffect(() => {
    if (token) fetchPdfStats();
    // document stats only depend on auth
  }, [token]);

  // jump back to the first page whenever the filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const openActionModal = (partner, action) => {
    setActionModal({ open: true, partner, action });
    setRemarks("");
  };

  const closeActionModal = () => {
    setActionModal({ open: false, partner: null, action: null });
    setRemarks("");
  };

  const handleAction = async () => {
    if (!actionModal.partner || !actionModal.action) return;
    setActionLoading(true);
    setError(null);
    try {
      const action = actionModal.action === "approve" ? "approved" : "rejected";
      const approvalType = "admin";
      const apiPayload = {
        token,
        userId: actionModal.partner._id,
        action,
        approvalType,
      };
      if (action === "approved") apiPayload.remark = remarks;
      if (action === "rejected") apiPayload.rejectionReason = remarks;
      await apiApprovePartner(apiPayload);
      await fetchPartners();
      closeActionModal();
    } catch (err) {
      setError(err.message || "Failed to process action");
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = (partner) => setSelectedPartner(partner);
  const handleCloseModal = () => setSelectedPartner(null);

  const getRoleName = (partner) => {
    const roles = partner?.roles;
    if (Array.isArray(roles) && roles.length) {
      const names = roles
        .map((r) => (typeof r === "string" ? r : r?.name || r?.role))
        .filter(Boolean);
      return names.length ? names.join(", ") : "-";
    }
    if (typeof roles === "string" && roles.trim()) return roles;
    return "-";
  };

  const getCity = (partner) => {
    const address = partner?.address;
    if (!address) return "-";
    // Prefer business_address city, fall back to permanent_address city
    const businessCity = address?.business_address?.city;
    const permanentCity = address?.permanent_address?.city;
    return businessCity || permanentCity || "-";
  };

  const getLatestTimestamp = (partner) => {
    const dateCandidates = [
      partner?.created_at,
      partner?.createdAt,
      partner?.updated_at,
      partner?.updatedAt,
      partner?.submitted_at,
      partner?.submittedAt,
    ];

    for (const value of dateCandidates) {
      if (!value) continue;
      const ts = new Date(value).getTime();
      if (!Number.isNaN(ts)) return ts;
    }

    const mongoId = partner?._id;
    if (typeof mongoId === "string" && mongoId.length >= 8) {
      const seconds = Number.parseInt(mongoId.slice(0, 8), 16);
      if (!Number.isNaN(seconds)) return seconds * 1000;
    }

    return 0;
  };

  const sortedPartners = [...partners].sort(
    (a, b) => getLatestTimestamp(b) - getLatestTimestamp(a),
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sortedPartners.length / RECORDS_PER_PAGE),
  );
  const paginatedPartners = sortedPartners.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const StatusBadge = ({ status }) => {
    const cls =
      status === "approved"
        ? "badge badge--approved"
        : status === "rejected"
          ? "badge badge--rejected"
          : "badge badge--pending";
    return <span className={cls}>{status || "pending"}</span>;
  };

  const PartnerActions = ({ p }) => (
    <>
      <button
        className="approvals-action-btn view"
        onClick={() => handleView(p)}
      >
        View
      </button>
      {p.approval_status === "approved" ? (
        <span className="approved-tag">✔ Approved</span>
      ) : p.approval_status === "rejected" ? (
        <>
          <button
            className="approvals-action-btn approve"
            onClick={() => openActionModal(p, "approve")}
          >
            Approve
          </button>
          <button
            className="approvals-action-btn reject"
            disabled
            style={{ opacity: 0.5 }}
          >
            Rejected
          </button>
          {p.rejection_reason && (
            <p className="rejection-reason">
              <b>Reason:</b> {p.rejection_reason}
            </p>
          )}
        </>
      ) : (
        <>
          <button
            className="approvals-action-btn approve"
            onClick={() => openActionModal(p, "approve")}
          >
            Approve
          </button>
          <button
            className="approvals-action-btn reject"
            onClick={() => openActionModal(p, "reject")}
          >
            Reject
          </button>
        </>
      )}
    </>
  );

  // Compact icon-button actions for the desktop table
  const ActionIcons = ({ p }) => (
    <>
      <button
        className="icon-btn icon-btn--view"
        title="View details"
        aria-label="View details"
        onClick={() => handleView(p)}
      >
        <EyeIcon />
      </button>

      {p.approval_status === "approved" ? (
        <span className="status-tag status-tag--approved">Approved</span>
      ) : p.approval_status === "rejected" ? (
        <>
          <button
            className="icon-btn icon-btn--approve"
            title="Approve"
            aria-label="Approve"
            onClick={() => openActionModal(p, "approve")}
          >
            <CheckIcon />
          </button>
          <span className="status-tag status-tag--rejected">Rejected</span>
          {p.rejection_reason && (
            <p className="rejection-reason">
              <b>Reason:</b> {p.rejection_reason}
            </p>
          )}
        </>
      ) : (
        <>
          <button
            className="icon-btn icon-btn--approve"
            title="Approve"
            aria-label="Approve"
            onClick={() => openActionModal(p, "approve")}
          >
            <CheckIcon />
          </button>
          <button
            className="icon-btn icon-btn--reject"
            title="Reject"
            aria-label="Reject"
            onClick={() => openActionModal(p, "reject")}
          >
            <CrossIcon />
          </button>
        </>
      )}
    </>
  );

  return (
    <div className="approvals-list-wrap">
      <h3 className="approvals-title">Onboarding Approvals</h3>
      <p className="approvals-subtitle">
        Onboarding requests for review.
      </p>

      {pdfStats && (
        <div className="stats-grid">
          {[
            // {
            //   label: "Total Documents",
            //   value: pdfStats.total,
            //   icon: "/file-download.svg",
            //   variant: "indigo",
            // },
            {
              label: "Agreements",
              value: pdfStats.agreement,
              icon: "/agreement.svg",
              variant: "green",
            },
            {
              label: "Certificates",
              value: pdfStats.certificate,
              icon: "/certificate.svg",
              variant: "amber",
            },
            // {
            //   label: "ID Cards",
            //   value: pdfStats.counts?.id_card ?? 0,
            //   icon: "/user-account.svg",
            //   variant: "blue",
            // },
          ].map((s) => (
            <div key={s.label} className={`stat-card stat-card--${s.variant}`}>
              <span className="stat-card__icon">
                <img src={s.icon} alt="" aria-hidden="true" />
              </span>
              <span className="stat-card__body">
                <span className="stat-card__value">{s.value ?? 0}</span>
                <span className="stat-card__label">{s.label}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="approvals-toolbar">
        <div className="status-tabs" role="tablist" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={statusFilter === f.value}
              className={`status-tab${statusFilter === f.value ? " is-active" : ""}`}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        {!loading && !error && (
          <span className="approvals-count">
            {partners.length} {partners.length === 1 ? "result" : "results"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="approvals-loading">Loading...</div>
      ) : error ? (
        <div className="approvals-error">{error}</div>
      ) : partners.length === 0 ? (
        <div className="approvals-empty">No partners found.</div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="approvals-table-wrap">
            <table className="approvals-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>City</th>
                  <th>Field Officer</th>
                  <th>Reviewed By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPartners.map((p) => (
                  <tr key={p._id}>
                    <td>{p.full_name}</td>
                    <td>{p.phone}</td>
                    <td>{getRoleName(p)}</td>
                    <td>
                      <StatusBadge status={p.approval_status} />
                    </td>
                    <td>{getCity(p)}</td>
                    <td>{p.field_officer_name || "-"}</td>
                    <td>{p.approved_by || "-"}</td>
                    <td className="actions-cell">
                      <ActionIcons p={p} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile card list ── */}
          <div className="approvals-card-list">
            {paginatedPartners.map((p) => (
              <div key={p._id} className="partner-card">
                <div className="partner-card__header">
                  <div className="partner-card__avatar">
                    {(p.full_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="partner-card__info">
                    <p className="partner-card__name">{p.full_name || "-"}</p>
                    <p className="partner-card__email">{p.email || "-"}</p>
                  </div>
                  <StatusBadge status={p.approval_status} />
                </div>

                <div className="partner-card__meta">
                  <div className="partner-card__meta-row">
                    <span className="partner-card__meta-label">Phone</span>
                    <span className="partner-card__meta-value">
                      {p.phone || "-"}
                    </span>
                  </div>
                  <div className="partner-card__meta-row">
                    <span className="partner-card__meta-label">Role</span>
                    <span className="partner-card__meta-value">
                      {getRoleName(p)}
                    </span>
                  </div>
                  <div className="partner-card__meta-row">
                    <span className="partner-card__meta-label">City</span>
                    <span className="partner-card__meta-value">
                      {getCity(p)}
                    </span>
                  </div>
                   <div className="partner-card__meta-row">
                    <span className="partner-card__meta-label">
                      Reviewed By
                    </span>
                    <span className="partner-card__meta-value">
                      {p.approved_by || "-"}
                    </span>
                  </div>
                </div>

                <div className="partner-card__actions">
                  <PartnerActions p={p} />
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <button
              className="approvals-action-btn view"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span
              style={{ fontSize: "0.82rem", color: "#666", fontWeight: 600 }}
            >
              Page {currentPage} of {totalPages} · {RECORDS_PER_PAGE} per page
            </span>
            <button
              className="approvals-action-btn view"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* ── Action modal (Approve / Reject) ── */}
      {actionModal.open && (
        <div className="modal-overlay" onClick={closeActionModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {actionModal.action === "approve"
                ? "Approve partner"
                : "Reject partner"}
            </h3>
            <p className="modal-body">
              Are you sure you want to <b>{actionModal.action}</b>{" "}
              <b>{actionModal.partner?.full_name}</b>?
            </p>
            <textarea
              className="modal-textarea"
              placeholder="Remarks (required)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <div className="modal-footer">
              <button
                className={`approvals-action-btn ${actionModal.action}`}
                onClick={handleAction}
                disabled={actionLoading || !remarks.trim()}
              >
                {actionLoading
                  ? "Processing..."
                  : actionModal.action === "approve"
                    ? "Approve"
                    : "Reject"}
              </button>
              <button
                className="approvals-action-btn view"
                onClick={closeActionModal}
              >
                Cancel
              </button>
            </div>
            {error && <p className="modal-error">{error}</p>}
          </div>
        </div>
      )}

      {/* ── Partner detail modal ── */}
      {selectedPartner && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content modal-content--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title">Partner overview</h3>

            <table className="detail-table">
              <tbody>
                {[
                  ["Father name", selectedPartner.professional?.father_name],
                  [
                    "Date of birth",
                    selectedPartner.professional?.dob
                      ? new Date(
                          selectedPartner.professional.dob,
                        ).toLocaleDateString()
                      : null,
                  ],
                   ["Email Id", selectedPartner.email],
                  [
                    "Business address",
                    selectedPartner.address?.business_address
                      ? typeof selectedPartner.address.business_address ===
                        "object"
                        ? Object.values(
                            selectedPartner.address.business_address,
                          )
                            .filter(Boolean)
                            .join(", ")
                        : selectedPartner.address.business_address
                      : null,
                  ],
                  [
                    "Permanent address",
                    selectedPartner.address?.permanent_address
                      ? typeof selectedPartner.address.permanent_address ===
                        "object"
                        ? Object.values(
                            selectedPartner.address.permanent_address,
                          )
                            .filter(Boolean)
                            .join(", ")
                        : selectedPartner.address.permanent_address
                      : null,
                  ],
                  ["Role name", getRoleName(selectedPartner)],
                  ["Role type", selectedPartner.professional?.register_as],
                  [
                    "Bowser capacity",
                    selectedPartner.vehicle?.bowser_capacity_id,
                  ],
                  [
                    "Land area (acres)",
                    selectedPartner.professional?.land_area_acres,
                  ],
                  ["PAN number", selectedPartner.documents?.pan_card?.number],
                  [
                    "Aadhaar number",
                    selectedPartner.documents?.aadhaar_card?.number,
                  ],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td className="detail-table__label">{label}</td>
                    <td className="detail-table__value">{value || "-"}</td>
                  </tr>
                ))}
                <tr>
                  <td className="detail-table__label">Aadhaar Verified</td>
                  <td className="detail-table__value">
                    {selectedPartner?.documents?.adhar_varified === true ? (
                      <span className="verified-tag">✔ Verified</span>
                    ) : (
                      <span className="unverified-tag">✗ Not Verified</span>
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="detail-table__label">PAN Verified</td>
                  <td className="detail-table__value">
                    {selectedPartner?.documents?.pan_varified === true ? (
                      <span className="verified-tag">✔ Verified</span>
                    ) : (
                      <span className="unverified-tag">✗ Not Verified</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            <button
              onClick={handleCloseModal}
              className="approvals-action-btn view"
              style={{ marginTop: 20 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalsSection;
