import React, { useEffect, useState } from 'react';


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

const PaymentsSection = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [actionResult, setActionResult]   = useState({}); 

  const accessToken = localStorage.getItem('POTENS_admin_access_token') || '';
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // console.log('Using API base URL:', accessToken, BASE_URL);
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
        console.log('REOCRED PAYMENT', records);
        
      } catch (err) {
        setError(err.message || 'Failed to load payment records.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // ── Approve / Reject ──────────────────────────────────────────────────────
  const handleAction = async (id, action) => {
    setActionLoading((prev) => ({ ...prev, [id]: action }));
    setActionResult((prev) => ({ ...prev, [id]: null }));
    try {
      const res = await fetch(`${BASE_URL}/api/payment/${action}/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Failed to ${action}`);
      setActionResult((prev) => ({ ...prev, [id]: { success: true, message: data?.message || `Payment ${action}d successfully.` } }));
      // Optimistically update status in list
      setPayments((prev) =>
        prev.map((p) =>
          (p.id || p._id) === id ? { ...p, status: action === 'approve' ? 'approved' : 'rejected' } : p
        )
      );
    } catch (err) {
      setActionResult((prev) => ({ ...prev, [id]: { success: false, message: err.message } }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  // ── Shared action buttons renderer ────────────────────────────────────────
  const ActionButtons = ({ payment }) => {
    const id     = payment.id || payment._id;
    const status = payment.status?.toLowerCase();
    const busy   = actionLoading[id];
    const result = actionResult[id];

    if (status === 'approved' || status === 'rejected') {
      return <StatusBadge status={status} />;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 180 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => handleAction(id, 'approve')}
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
            onClick={() => handleAction(id, 'reject')}
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
      {[1,2,3,4,5,6,7].map((i) => (
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
          min-width: 700px;
          background: #fff;
        }

        .payments-table th {
          padding: 13px 14px;
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
          padding: 12px 14px;
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
                <th>Amount</th>
                <th>Date</th>
                <th>Status / Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map((i) => <SkeletonRow key={i} />)
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="payments-empty">No payment records found.</td>
                </tr>
              ) : (
                payments.map((payment, idx) => {
                  const id   = payment.id || payment._id || idx;
                  const user = payment.user || {};
                  return (
                    <tr key={id}>
                      <td style={{ color: '#aaa', fontSize: '0.82rem' }}>{idx + 1}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2d72d2' }}>
                          {payment.transaction_number || '—'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>
                        {payment.accountNumber || payment.account_number || '—'}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {formatAmount(payment.amount)}
                      </td>
                      {/* <td>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#222' }}>
                          {user.name || user.full_name || '—'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#999' }}>
                          {user.email || ''}
                        </div>
                        {user.phone && (
                          <div style={{ fontSize: '0.78rem', color: '#aaa' }}>{user.phone}</div>
                        )}
                      </td> */}
                      <td style={{ color: '#666' }}>{formatDate(payment.createdAt || payment.date || payment.created_at)}</td>
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
            payments.map((payment, idx) => {
              const id   = payment.id || payment._id || idx;
              const user = payment.user || {};
              return (
                <div key={id} className="payments-card">
                  <div className="payments-card-header">
                    <span className="payments-card-utr">
                      {payment.utr || payment.utr_number || `Record #${idx + 1}`}
                    </span>
                    <StatusBadge status={payment.status || 'pending'} />
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
                    <span className="payments-card-label">Date</span>
                    <span className="payments-card-value">{formatDate(payment.createdAt || payment.date || payment.created_at)}</span>
                  </div>

                  <div className="payments-card-actions">
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
      </div>
    </div>
  );
};

export default PaymentsSection;