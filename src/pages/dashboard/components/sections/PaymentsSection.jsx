import React from 'react';

const PaymentsSection = () => (
  <div style={{ padding: 32 }}>
    <style>{`
      /* ── Payments table ── */
      .payments-table-wrap {
        width: 100%;
        overflow-x: auto;
        margin-top: 24px;
        -webkit-overflow-scrolling: touch;
      }

      .payments-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 480px;
      }

      .payments-table th,
      .payments-table td {
        padding: 12px;
        border: 1px solid #e0e0e0;
        white-space: nowrap;
      }

      .payments-table thead tr {
        background: #f5f7fa;
      }

      /* ── Card layout (mobile) ── */
      .payments-cards {
        display: none;
        flex-direction: column;
        gap: 12px;
        margin-top: 20px;
      }

      .payments-card {
        border: 1px solid #e0e0e0;
        border-radius: 10px;
        padding: 16px;
        background: #fff;
        box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      }

      .payments-card-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
        gap: 8px;
      }

      .payments-card-row:last-child {
        margin-bottom: 0;
      }

      .payments-card-label {
        font-size: 0.75rem;
        color: #888;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        min-width: 80px;
      }

      .payments-card-value {
        font-size: 0.9rem;
        color: #222;
        font-weight: 500;
        text-align: right;
      }

      .payments-card-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #f0f0f0;
      }

      .payments-card-actions button {
        flex: 1;
        padding: 8px 0;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .btn-approve {
        background: #4caf50;
        color: #fff;
      }

      .btn-reject {
        background: #f44336;
        color: #fff;
      }

      /* ── Breakpoint ── */
      @media (max-width: 600px) {
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
    `}</style>

    <div className="payments-root" style={{ padding: 32 }}>
      <h2>Payments</h2>

      {/* ── Desktop: scrollable table ── */}
      <div className="payments-table-wrap">
        <table className="payments-table">
          <thead>
            <tr>
              <th>UTR Number</th>
              <th>Bank</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Example static data, replace with real data as needed */}
            <tr>
              <td>UTR123456789</td>
              <td>HDFC Bank</td>
              <td>2026-04-27</td>
              <td>
                <button style={{ marginRight: 8, background: '#4caf50', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>Approve</button>
                <button style={{ background: '#f44336', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>Reject</button>
              </td>
            </tr>
            <tr>
              <td>UTR987654321</td>
              <td>ICICI Bank</td>
              <td>2026-04-26</td>
              <td>
                <button style={{ marginRight: 8, background: '#4caf50', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>Approve</button>
                <button style={{ background: '#f44336', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Mobile: card list ── */}
      <div className="payments-cards">
        {/* Example static data, replace with real data as needed */}
        <div className="payments-card">
          <div className="payments-card-row">
            <span className="payments-card-label">UTR Number</span>
            <span className="payments-card-value">UTR123456789</span>
          </div>
          <div className="payments-card-row">
            <span className="payments-card-label">Bank</span>
            <span className="payments-card-value">HDFC Bank</span>
          </div>
          <div className="payments-card-row">
            <span className="payments-card-label">Date</span>
            <span className="payments-card-value">2026-04-27</span>
          </div>
          <div className="payments-card-actions">
            <button className="btn-approve">Approve</button>
            <button className="btn-reject">Reject</button>
          </div>
        </div>

        <div className="payments-card">
          <div className="payments-card-row">
            <span className="payments-card-label">UTR Number</span>
            <span className="payments-card-value">UTR987654321</span>
          </div>
          <div className="payments-card-row">
            <span className="payments-card-label">Bank</span>
            <span className="payments-card-value">ICICI Bank</span>
          </div>
          <div className="payments-card-row">
            <span className="payments-card-label">Date</span>
            <span className="payments-card-value">2026-04-26</span>
          </div>
          <div className="payments-card-actions">
            <button className="btn-approve">Approve</button>
            <button className="btn-reject">Reject</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default PaymentsSection;