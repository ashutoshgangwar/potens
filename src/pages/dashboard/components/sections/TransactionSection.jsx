
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '../../../../components/ui/index.js';
import './TransactionSection.css';

const TransactionSection = ({ transactions }) => {
  const [orderRows, setOrderRows] = useState(transactions);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completionForm, setCompletionForm] = useState({
    deliveredBy: '',
    receivedBy: '',
    notes: '',
  });

  useEffect(() => {
    setOrderRows(transactions);
  }, [transactions]);

  const summary = useMemo(() => {
    const completedEarnings = orderRows
      .filter((order) => order.status === 'Completed')
      .reduce((sum, order) => sum + order.amount, 0);

    const pendingTransactions = orderRows.filter((order) => order.status === 'Pending').length;

    return {
      totalTransactions: orderRows.length,
      completedEarnings,
      pendingTransactions,
    };
  }, [orderRows]);

  const openCompletionModal = (order) => {
    setSelectedOrder(order);
    setCompletionForm({
      deliveredBy: '',
      receivedBy: '',
      notes: '',
    });
    setIsCompletionModalOpen(true);
  };

  const closeCompletionModal = () => {
    setIsCompletionModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCompletionInputChange = (event) => {
    const { name, value } = event.target;
    setCompletionForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const markOrderAsCompleted = () => {
    if (!selectedOrder) return;

    setOrderRows((previousRows) =>
      previousRows.map((order) => {
        if (order.id !== selectedOrder.id) return order;
        return {
          ...order,
          status: 'Completed',
          completionDetails: {
            deliveredBy: completionForm.deliveredBy.trim(),
            receivedBy: completionForm.receivedBy.trim(),
            notes: completionForm.notes.trim(),
            completedAt: new Date().toISOString(),
          },
        };
      })
    );

    closeCompletionModal();
  };

  const canSubmitCompletion =
    completionForm.deliveredBy.trim().length > 0 && completionForm.receivedBy.trim().length > 0;

  const formatTransactionDate = (dateValue) => {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return dateValue;
    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="transactions-section">
      <Card padding="md" shadow="sm" className="transactions-card">
        <div className="transactions-header-row">
          <div>
            <h2 className="card-section-title">Transactions Overview</h2>
            <p className="dashboard-subtitle">Your latest order settlements and payout status.</p>
          </div>
          <div className="transactions-metrics">
            <div className="transactions-metric-pill">
              <span>Total</span>
              <strong>{summary.totalTransactions}</strong>
            </div>
            <div className="transactions-metric-pill transactions-metric-pill--success">
              <span>Earned</span>
              <strong>₹{summary.completedEarnings.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        <div className="transactions-table-wrap">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orderRows.map((transaction) => {
                const isCompleted = transaction.status === 'Completed';

                return (
                  <tr key={transaction.id}>
                    <td>
                      <div className="txn-date-cell">
                        <span className="txn-date-icon">📅</span>
                        <span>{formatTransactionDate(transaction.date)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="txn-order-pill">{transaction.orderId}</span>
                    </td>
                    <td>
                      <span className="txn-amount">₹{transaction.amount.toLocaleString('en-IN')}</span>
                    </td>
                    <td>
                      <span className={`txn-status-badge ${isCompleted ? 'txn-status-badge--success' : 'txn-status-badge--warning'}`}>
                        <span className="txn-status-dot" />
                        {transaction.status}
                      </span>
                    </td>
                    <td className="txn-action-cell">
                      {isCompleted ? (
                        <Button size="sm" variant="secondary" className="txn-done-btn" disabled>
                          Order Done
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="txn-complete-btn"
                          onClick={() => openCompletionModal(transaction)}
                        >
                          Complete Order
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="transactions-summary">
          <table className="summary-table">
            <tbody>
              <tr>
                <td><strong>Total Earnings</strong></td>
                <td>₹{summary.completedEarnings.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td><strong>Pending Orders</strong></td>
                <td>{summary.pendingTransactions}</td>
              </tr>
            </tbody>
          </table>
          <div className="more-details">
            <strong>More:</strong> Export, filter, and detailed analytics coming soon!
          </div>
        </div>
      </Card>

      {isCompletionModalOpen && selectedOrder && (
        <div className="txn-modal-overlay" role="dialog" aria-modal="true" aria-label="Complete order modal">
          <div className="txn-modal-card">
            <div className="txn-modal-header">
              <h3>Complete Order {selectedOrder.orderId}</h3>
              <button type="button" className="txn-modal-close" onClick={closeCompletionModal}>
                ✕
              </button>
            </div>

            <div className="txn-modal-body">
              <label className="txn-modal-field">
                <span>Delivered By</span>
                <input
                  name="deliveredBy"
                  type="text"
                  value={completionForm.deliveredBy}
                  onChange={handleCompletionInputChange}
                  placeholder="Driver / agent name"
                />
              </label>

              <label className="txn-modal-field">
                <span>Received By</span>
                <input
                  name="receivedBy"
                  type="text"
                  value={completionForm.receivedBy}
                  onChange={handleCompletionInputChange}
                  placeholder="Customer name"
                />
              </label>

              <label className="txn-modal-field">
                <span>Notes</span>
                <textarea
                  name="notes"
                  value={completionForm.notes}
                  onChange={handleCompletionInputChange}
                  rows={3}
                  placeholder="Optional delivery notes"
                />
              </label>
            </div>

            <div className="txn-modal-actions">
              <Button variant="secondary" size="sm" onClick={closeCompletionModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={markOrderAsCompleted} disabled={!canSubmitCompletion}>
                Save & Complete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionSection;
