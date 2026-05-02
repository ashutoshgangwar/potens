import React, { useEffect, useMemo, useState } from 'react';


const STATUS_COLORS = {
  approved: { bg: '#edfaf3', color: '#1a7f4b', label: 'Approved' },
  rejected: { bg: '#fff3f3', color: '#c0392b', label: 'Rejected' },
  pending:  { bg: '#fff8e1', color: '#b45309', label: 'Pending'  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status?.toLowerCase()] || STATUS_COLORS.pending;
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: '0.78rem',
      fontWeight: 700,
      background: s.bg,
      color: s.color,
      letterSpacing: 0.3,
      textTransform: 'capitalize',
    }}>
      {s.label}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatAmount = (amt) => {
  if (amt === undefined || amt === null || amt === '') return '—';
  return `₹${Number(amt).toLocaleString('en-IN')}`;
};

const RECORDS_PER_PAGE = 12;

const PaymentsSection = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [actionResult, setActionResult]   = useState({}); 
  const [actionModal, setActionModal] = useState({ open: false, paymentId: null, action: null });
  const [remark, setRemark] = useState('');
  const [proofModal, setProofModal] = useState({ open: false, url: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const accessToken = localStorage.getItem('POTENS_admin_access_token') || '';
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${BASE_URL}/api/payment/details`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
        // Support both array root or nested under a key
        const records = Array.isArray(data)
          ? data
          : Array.isArray(data?.payments)
            ? data.payments
            : Array.isArray(data?.data)
              ? data.data
              : [];
        setPayments(records);
        // console.log('REOCRED PAYMENT', records);
        
      } catch (err) {
        setError(err.message || 'Failed to load payment records.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // ── Approve / Reject ──────────────────────────────────────────────────────
  const handleAction = async (id, action, enteredRemark) => {
    const finalRemark = (enteredRemark || '').trim();
    if (!finalRemark) {
      setActionResult((prev) => ({
        ...prev,
        [id]: { success: false, message: 'Remark is required.' },
      }));
      return;
    }

    setActionLoading((prev) => ({ ...prev, [id]: action }));
    setActionResult((prev) => ({ ...prev, [id]: null }));
    try {
      const res = await fetch(`${BASE_URL}/api/payment/${id}/${action}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remark: finalRemark }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Failed to ${action}`);

      const updatedRecord = data?.data || {};
      setActionResult((prev) => ({
        ...prev,
        [id]: { success: true, message: data?.message || `Payment ${action}d successfully.` },
      }));

      // Update payment in list using response data (approval_status + approved_by)
      setPayments((prev) =>
        prev.map((p) =>
          (p.id || p._id) === id
            ? {
                ...p,
                status: updatedRecord.status ?? (action === 'approve' ? 'approved' : 'rejected'),
                approval_status: updatedRecord.approval_status ?? (action === 'approve' ? 'approved' : 'rejected'),
                approved_by: updatedRecord.approved_by ?? p.approved_by,
                approval_remark: updatedRecord.approval_remark ?? finalRemark,
                approval_action_at: updatedRecord.approval_action_at ?? new Date().toISOString(),
              }
            : p
        )
      );
    } catch (err) {
      setActionResult((prev) => ({ ...prev, [id]: { success: false, message: err.message } }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const openActionModal = (paymentId, action) => {
    setActionModal({ open: true, paymentId, action });
    setRemark('');
  };

  const closeActionModal = () => {
    setActionModal({ open: false, paymentId: null, action: null });
    setRemark('');
  };

  const getPaymentProofUrl = (payment) =>
    payment?.payment_proof_url || payment?.paymentProofUrl || payment?.proofUrl || '';

  const getPartnerFullName = (payment) =>
    payment?.partner_full_name ||
    payment?.user_full_name ||
    payment?.partnerFullName ||
    payment?.userFullName ||
    payment?.full_name ||
    payment?.user?.full_name ||
    payment?.user?.name ||
    '—';

  const openProofModal = (url) => {
    if (!url) return;
    setProofModal({ open: true, url });
  };

  const closeProofModal = () => {
    setProofModal({ open: false, url: '' });
  };

  const totalPages = Math.max(1, Math.ceil(payments.length / RECORDS_PER_PAGE));

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * RECORDS_PER_PAGE;
    return payments.slice(start, start + RECORDS_PER_PAGE);
  }, [payments, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const confirmAction = async () => {
    if (!actionModal.paymentId || !actionModal.action) return;
    await handleAction(actionModal.paymentId, actionModal.action, remark);
    if (remark.trim()) closeActionModal();
  };

  // ── Shared action buttons renderer ────────────────────────────────────────
  const ActionButtons = ({ payment }) => {
    const id     = payment.id || payment._id;
    const status = (payment.approval_status || payment.status)?.toLowerCase();
    const busy   = actionLoading[id];
    const result = actionResult[id];

    if (status === 'approved' || status === 'rejected') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <StatusBadge status={status} />
          {/* {payment.approved_by?.full_name && (
            <span style={{ fontSize: '0.72rem', color: '#999' }}>
              by {payment.approved_by.full_name}
            </span>
          )} */}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 180 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => openActionModal(id, 'approve')}
            disabled={!!busy}
            style={{
              flex: 1, padding: '6px 0', border: 'none', borderRadius: 5,
              background: busy === 'approve' ? '#a5d6a7' : '#4caf50',
              color: '#fff', fontWeight: 700, fontSize: '0.85rem',
              cursor: busy ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
            }}
          >
            {busy === 'approve' ? '…' : '✓ Approve'}
          </button>
          <button
            onClick={() => openActionModal(id, 'reject')}
            disabled={!!busy}
            style={{
              flex: 1, padding: '6px 0', border: 'none', borderRadius: 5,
              background: busy === 'reject' ? '#ef9a9a' : '#f44336',
              color: '#fff', fontWeight: 700, fontSize: '0.85rem',
              cursor: busy ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
            }}
          >
            {busy === 'reject' ? '…' : '✗ Reject'}
          </button>
        </div>
        {result && (
          <span style={{
            fontSize: '0.75rem', fontWeight: 600,
            color: result.success ? '#1a7f4b' : '#c0392b',
            marginTop: 2,
          }}>
            {result.message}
          </span>
        )}
      </div>
    );
  };

  // ── Skeleton loader ───────────────────────────────────────────────────────
  const SkeletonRow = () => (
    <tr>
      {[1,2,3,4,5,6,7,8,9,10].map((i) => (
        <td key={i}>
          <div style={{ height: 14, background: '#f0f0f0', borderRadius: 4, animation: 'shimmer 1.4s infinite' }} />
        </td>
      ))}
    </tr>
  );

  return (
    <div style={{ padding: 32 }}>
      <style>{`
        @keyframes shimmer {
          0%   { opacity: 1; }
          50%  { opacity: 0.4; }
          100% { opacity: 1; }
        }

        /* ── Table ── */
        .payments-table-wrap {
          width: 100%;
          overflow-x: auto;
          margin-top: 24px;
          border-radius: 10px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.07);
          -webkit-overflow-scrolling: touch;
        }

        .payments-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
          background: #fff;
        }

        .payments-table th {
          padding: 15px 14px;
          background: #f5f7fa;
          font-size: 0.78rem;
          font-weight: 700;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #e8eaed;
          white-space: nowrap;
          text-align: left;
        }

        .payments-table td {
          padding: 12px 10px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 0.9rem;
          color: #333;
          white-space: nowrap;
          vertical-align: middle;
        }

        .payments-table tbody tr:last-child td {
          border-bottom: none;
        }

        .payments-table tbody tr:hover td {
          background: #fafbfc;
        }

        /* ── Mobile cards ── */
        .payments-cards {
          display: none;
          flex-direction: column;
          gap: 14px;
          margin-top: 20px;
        }

        .payments-card {
          border: 1px solid #e8eaed;
          border-radius: 12px;
          padding: 16px;
          background: #fff;
          box-shadow: 0 1px 5px rgba(0,0,0,0.06);
        }

        .payments-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f3f3f3;
        }

        .payments-card-utr {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a1a2e;
        }

        .payments-card-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
          gap: 8px;
        }

        .payments-card-row:last-of-type {
          margin-bottom: 0;
        }

        .payments-card-label {
          font-size: 0.73rem;
          color: #999;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding-top: 1px;
        }

        .payments-card-value {
          font-size: 0.88rem;
          color: #222;
          font-weight: 500;
          text-align: right;
          max-width: 55%;
          word-break: break-word;
        }

        .payments-card-actions {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;
        }

        /* ── Responsive breakpoint ── */
        @media (max-width: 640px) {
          .payments-root {
            padding: 16px !important;
          }
          .payments-table-wrap {
            display: none;
          }
          .payments-cards {
            display: flex;
          }
        }

        /* ── Empty/error state ── */
        .payments-empty {
          text-align: center;
          padding: 48px 24px;
          color: #aaa;
          font-size: 1rem;
        }

        .payments-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .payments-modal {
          width: 100%;
          max-width: 460px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          padding: 18px;
        }

        .payments-modal textarea {
          width: 100%;
          min-height: 96px;
          margin-top: 10px;
          border: 1px solid #dfe3e8;
          border-radius: 8px;
          padding: 10px;
          font-size: 0.9rem;
          outline: none;
          resize: vertical;
          box-sizing: border-box;
        }

        .payment-proof-image {
          width: 100%;
          max-height: 72vh;
          object-fit: contain;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #fff;
        }

        .payments-pagination {
          margin-top: 16px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .payments-pagination-btn {
          padding: 6px 10px;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          background: #fff;
          color: #444;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }

        .payments-pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .payments-pagination-meta {
          font-size: 0.82rem;
          color: #666;
          font-weight: 600;
        }
      `}</style>

      <div className="payments-root" style={{ padding: 32 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1a1a2e' }}>Payments</h2>
            <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.88rem' }}>
              All payment records for your account
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px', border: '1px solid #d0d7de', borderRadius: 7,
              background: '#fff', color: '#444', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 20, padding: '14px 16px', borderRadius: 8,
            background: '#fff3f3', color: '#c0392b', fontWeight: 500, fontSize: '0.93rem',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* ── Desktop Table ── */}
        <div className="payments-table-wrap">
          <table className="payments-table">
            <thead>
              <tr>
                <th>#</th>
                <th>UTR Number</th>
                <th>Account Number</th>
                <th>Partner Name</th>
                <th>Amount</th>
                <th>Transaction Date</th>
                <th>Action Date</th>
                <th>Approved By</th>
                <th>Payment Proof</th>
                <th>Status / Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map((i) => <SkeletonRow key={i} />)
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="payments-empty">No payment records found.</td>
                </tr>
              ) : (
                paginatedPayments.map((payment, idx) => {
                  const id   = payment.id || payment._id || idx;
                  const proofUrl = getPaymentProofUrl(payment);
                  const partnerName = getPartnerFullName(payment);
                  const serialNumber = (currentPage - 1) * RECORDS_PER_PAGE + idx + 1;
                  return (
                    <tr key={id}>
                      <td style={{ color: '#aaa', fontSize: '0.82rem' }}>{serialNumber}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2d72d2' }}>
                          {payment.transaction_number || '—'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>
                        {payment.accountNumber || payment.account_number || '—'}
                      </td>
                      <td style={{ color: '#444' }}>{partnerName}</td>
                      <td style={{ fontWeight: 600 }}>
                        {formatAmount(payment.amount)}
                      </td>
                      <td style={{ color: '#666' }}>{formatDate(payment.payment_date || payment.date || payment.created_at)}</td>
                      <td style={{ color: '#666' }}>{formatDate(payment.approval_action_at)}</td>
                      <td style={{ color: '#666' }}>{payment.approved_by?.full_name || '—'}</td>
                      <td>
                        {proofUrl ? (
                          <button
                            onClick={() => openProofModal(proofUrl)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
                              border: '1px solid #d0d7de',
                              background: '#fff',
                              color: '#2d72d2',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            View
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <ActionButtons payment={payment} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Cards ── */}
        <div className="payments-cards">
          {loading ? (
            [1,2,3].map((i) => (
              <div key={i} className="payments-card">
                {[1,2,3,4].map((j) => (
                  <div key={j} style={{ height: 14, background: '#f0f0f0', borderRadius: 4, marginBottom: 10, animation: 'shimmer 1.4s infinite' }} />
                ))}
              </div>
            ))
          ) : payments.length === 0 ? (
            <div className="payments-empty">No payment records found.</div>
          ) : (
            paginatedPayments.map((payment, idx) => {
              const id   = payment.id || payment._id || idx;
              const user = payment.user || {};
              const proofUrl = getPaymentProofUrl(payment);
              const partnerName = getPartnerFullName(payment);
              const serialNumber = (currentPage - 1) * RECORDS_PER_PAGE + idx + 1;
              return (
                <div key={id} className="payments-card">
                  <div className="payments-card-header">
                    <span className="payments-card-utr">
                      {payment.utr || payment.utr_number || `Record #${serialNumber}`}
                    </span>
                    <StatusBadge status={payment.approval_status || payment.status || 'pending'} />
                  </div>

                  <div className="payments-card-row">
                    <span className="payments-card-label">UTR Number</span>
                    <span className="payments-card-value" style={{ fontFamily: 'monospace' }}>
                      {payment.transaction_number || '—'}
                    </span>
                  </div>

                  <div className="payments-card-row">
                    <span className="payments-card-label">Account No.</span>
                    <span className="payments-card-value" style={{ fontFamily: 'monospace' }}>
                      {payment.accountNumber || payment.account_number || '—'}
                    </span>
                  </div>

                  <div className="payments-card-row">
                    <span className="payments-card-label">Partner Name</span>
                    <span className="payments-card-value">{partnerName}</span>
                  </div>

                  <div className="payments-card-row">
                    <span className="payments-card-label">Amount</span>
                    <span className="payments-card-value" style={{ fontWeight: 700, color: '#1a1a2e' }}>
                      {formatAmount(payment.amount)}
                    </span>
                  </div>

                  {user.email && (
                    <div className="payments-card-row">
                      <span className="payments-card-label">Email</span>
                      <span className="payments-card-value" style={{ fontSize: '0.82rem' }}>{user.email}</span>
                    </div>
                  )}

                  {user.phone && (
                    <div className="payments-card-row">
                      <span className="payments-card-label">Phone</span>
                      <span className="payments-card-value">{user.phone}</span>
                    </div>
                  )}

                  <div className="payments-card-row">
                    <span className="payments-card-label">Transaction Date</span>
                    <span className="payments-card-value">{formatDate(payment.payment_date || payment.date || payment.created_at)}</span>
                  </div>

                  {payment.approved_by?.full_name && (
                    <div className="payments-card-row">
                      <span className="payments-card-label">
                        {(payment.approval_status || payment.status)?.toLowerCase() === 'rejected' ? 'Rejected By' : 'Approved By'}
                      </span>
                      <span className="payments-card-value">{payment.approved_by.full_name}</span>
                    </div>
                  )}

                  <div className="payments-card-row">
                    <span className="payments-card-label">Action Date</span>
                    <span className="payments-card-value">{formatDate(payment.approval_action_at)}</span>
                  </div>

                  <div className="payments-card-actions">
                    {proofUrl && (
                      <div style={{ marginBottom: 10 }}>
                        <button
                          onClick={() => openProofModal(proofUrl)}
                          style={{
                            padding: '7px 12px',
                            borderRadius: 7,
                            border: '1px solid #d0d7de',
                            background: '#fff',
                            color: '#2d72d2',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          View Payment Proof
                        </button>
                      </div>
                    )}
                    <ActionButtons payment={payment} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Record count */}
        {!loading && payments.length > 0 && (
          <p style={{ marginTop: 16, fontSize: '0.82rem', color: '#aaa', textAlign: 'right' }}>
            {payments.length} record{payments.length !== 1 ? 's' : ''} found
          </p>
        )}

        {!loading && payments.length > 0 && (
          <div className="payments-pagination">
            <button
              className="payments-pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="payments-pagination-meta">
              Page {currentPage} of {totalPages} · {RECORDS_PER_PAGE} per page
            </span>
            <button
              className="payments-pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {actionModal.open && (
        <div className="payments-modal-overlay" onClick={closeActionModal}>
          <div className="payments-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#1a1a2e' }}>
              {actionModal.action === 'approve' ? 'Approve payment' : 'Reject payment'}
            </h3>
            <p style={{ margin: '8px 0 0', color: '#666', fontSize: '0.9rem' }}>
              Please enter remark before proceeding.
            </p>

            <textarea
              placeholder="Enter remark (required)"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                onClick={closeActionModal}
                style={{
                  padding: '8px 14px', borderRadius: 7, border: '1px solid #d0d7de',
                  background: '#fff', color: '#444', cursor: 'pointer', fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={!remark.trim() || !!actionLoading[actionModal.paymentId]}
                style={{
                  padding: '8px 14px', borderRadius: 7, border: 'none',
                  background: actionModal.action === 'approve' ? '#4caf50' : '#f44336',
                  color: '#fff', cursor: !remark.trim() ? 'not-allowed' : 'pointer',
                  opacity: !remark.trim() ? 0.6 : 1, fontWeight: 700,
                }}
              >
                {actionLoading[actionModal.paymentId]
                  ? 'Processing...'
                  : actionModal.action === 'approve'
                  ? 'Approve'
                  : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {proofModal.open && (
        <div className="payments-modal-overlay" onClick={closeProofModal}>
          <div className="payments-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#1a1a2e' }}>Payment Proof</h3>
            <p style={{ margin: '8px 0 12px', color: '#666', fontSize: '0.9rem' }}>
              Uploaded payment proof image preview.
            </p>

            <img src={proofModal.url} alt="Payment Proof" className="payment-proof-image" />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                onClick={closeProofModal}
                style={{
                  padding: '8px 14px',
                  borderRadius: 7,
                  border: '1px solid #d0d7de',
                  background: '#fff',
                  color: '#444',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsSection;