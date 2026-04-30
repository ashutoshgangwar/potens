import React, { useEffect, useState } from 'react';
import { apiGetPartners } from '../../../../utils/api';
import { apiApprovePartner } from '../../../../utils/api';
import { useAuth } from '../../../../context/AuthContext';
import './ApprovalsSection.css';

const ApprovalsSection = () => {
  const { token } = useAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, partner: null, action: null });
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPartners = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetPartners(token);
      setPartners(data);
    } catch (err) {
      setError(err.message || 'Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPartners();
  }, [token]);

  const openActionModal = (partner, action) => {
    setActionModal({ open: true, partner, action });
    setRemarks('');
  };

  const closeActionModal = () => {
    setActionModal({ open: false, partner: null, action: null });
    setRemarks('');
  };

  const handleAction = async () => {
    if (!actionModal.partner || !actionModal.action) return;
    setActionLoading(true);
    setError(null);
    try {
      const action = actionModal.action === 'approve' ? 'approved' : 'rejected';
      const approvalType = 'admin';
      const apiPayload = { token, userId: actionModal.partner._id, action, approvalType };
      if (action === 'approved') apiPayload.remark = remarks;
      if (action === 'rejected') apiPayload.rejectionReason = remarks;
      await apiApprovePartner(apiPayload);
      await fetchPartners();
      closeActionModal();
    } catch (err) {
      setError(err.message || 'Failed to process action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = (partner) => setSelectedPartner(partner);
  const handleCloseModal = () => setSelectedPartner(null);

  const StatusBadge = ({ status }) => {
    const cls =
      status === 'approved'
        ? 'badge badge--approved'
        : status === 'rejected'
        ? 'badge badge--rejected'
        : 'badge badge--pending';
    return <span className={cls}>{status || 'pending'}</span>;
  };

  const PartnerActions = ({ p }) => (
    <>
      <button className="approvals-action-btn view" onClick={() => handleView(p)}>
        View
      </button>
      {p.approval_status === 'approved' ? (
        <span className="approved-tag">✔ Approved</span>
      ) : p.approval_status === 'rejected' ? (
        <>
          <button
            className="approvals-action-btn approve"
            onClick={() => openActionModal(p, 'approve')}
          >
            Approve
          </button>
          <button className="approvals-action-btn reject" disabled style={{ opacity: 0.5 }}>
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
            onClick={() => openActionModal(p, 'approve')}
          >
            Approve
          </button>
          <button
            className="approvals-action-btn reject"
            onClick={() => openActionModal(p, 'reject')}
          >
            Reject
          </button>
        </>
      )}
    </>
  );

  return (
    <div className="approvals-list-wrap">
      <h3 className="approvals-title">Onboarding Approvals</h3>
      <p className="approvals-subtitle">Pending onboarding requests for review.</p>

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
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>City</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p._id}>
                    <td>{p.full_name}</td>
                    <td>{p.email}</td>
                    <td>{p.phone}</td>
                    <td>
                      <StatusBadge status={p.approval_status} />
                    </td>
                    <td>{p.assigned_city || '-'}</td>
                    <td className="actions-cell">
                      <PartnerActions p={p} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile card list ── */}
          <div className="approvals-card-list">
            {partners.map((p) => (
              <div key={p._id} className="partner-card">
                <div className="partner-card__header">
                  <div className="partner-card__avatar">
                    {(p.full_name || '?')[0].toUpperCase()}
                  </div>
                  <div className="partner-card__info">
                    <p className="partner-card__name">{p.full_name || '-'}</p>
                    <p className="partner-card__email">{p.email || '-'}</p>
                  </div>
                  <StatusBadge status={p.approval_status} />
                </div>

                <div className="partner-card__meta">
                  <div className="partner-card__meta-row">
                    <span className="partner-card__meta-label">Phone</span>
                    <span className="partner-card__meta-value">{p.phone || '-'}</span>
                  </div>
                  <div className="partner-card__meta-row">
                    <span className="partner-card__meta-label">City</span>
                    <span className="partner-card__meta-value">{p.assigned_city || '-'}</span>
                  </div>
                </div>

                <div className="partner-card__actions">
                  <PartnerActions p={p} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Action modal (Approve / Reject) ── */}
      {actionModal.open && (
        <div className="modal-overlay" onClick={closeActionModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {actionModal.action === 'approve' ? 'Approve partner' : 'Reject partner'}
            </h3>
            <p className="modal-body">
              Are you sure you want to <b>{actionModal.action}</b>{' '}
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
                  ? 'Processing...'
                  : actionModal.action === 'approve'
                  ? 'Approve'
                  : 'Reject'}
              </button>
              <button className="approvals-action-btn view" onClick={closeActionModal}>
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
          <div className="modal-content modal-content--wide" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Partner overview</h3>

            <table className="detail-table">
              <tbody>
                {[
                  ['Father name', selectedPartner.professional?.father_name],
                  [
                    'Date of birth',
                    selectedPartner.professional?.dob
                      ? new Date(selectedPartner.professional.dob).toLocaleDateString()
                      : null,
                  ],
                  [
                    'Business address',
                    selectedPartner.address?.business_address
                      ? typeof selectedPartner.address.business_address === 'object'
                        ? Object.values(selectedPartner.address.business_address)
                            .filter(Boolean)
                            .join(', ')
                        : selectedPartner.address.business_address
                      : null,
                  ],
                  [
                    'Permanent address',
                    selectedPartner.address?.permanent_address
                      ? typeof selectedPartner.address.permanent_address === 'object'
                        ? Object.values(selectedPartner.address.permanent_address)
                            .filter(Boolean)
                            .join(', ')
                        : selectedPartner.address.permanent_address
                      : null,
                  ],
                  ['Role type', selectedPartner.professional?.register_as],
                  ['Bowser capacity', selectedPartner.vehicle?.bowser_capacity_id],
                  ['Land area (acres)', selectedPartner.professional?.land_area_acres],
                  ['PAN number', selectedPartner.documents?.pan_card?.number],
                  ['Aadhaar number', selectedPartner.documents?.aadhaar_card?.number],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td className="detail-table__label">{label}</td>
                    <td className="detail-table__value">{value || '-'}</td>
                  </tr>
                ))}
                <tr>
                  <td className="detail-table__label">Aadhaar verified</td>
                  <td className="detail-table__value">
                    {selectedPartner.documents?.aadhaar_card?.file_url ? (
                      <span className="verified-tag">✔ Verified</span>
                    ) : (
                      <span className="unverified-tag">✗ Not verified</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="detail-table__label">PAN verified</td>
                  <td className="detail-table__value">
                    {selectedPartner.documents?.pan_card?.file_url ? (
                      <span className="verified-tag">✔ Verified</span>
                    ) : (
                      <span className="unverified-tag">✗ Not verified</span>
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