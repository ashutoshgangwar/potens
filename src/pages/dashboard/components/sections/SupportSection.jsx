import React, { useState } from 'react';
import { Button, Card } from '../../../../components/ui/index.js';

const SUPPORT_EMAIL = 'support@POTENSnergy.com';

const SupportSection = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
    attachmentName: '',
  });
  const [emailStatus, setEmailStatus] = useState(null);

  const handleEmailInputChange = (e) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      setEmailStatus({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    try {
      setEmailStatus({ type: 'loading', message: 'Sending email...' });

      // Send email using mailto with pre-filled subject and body
      const mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(emailForm.subject)}&body=${encodeURIComponent(emailForm.message)}`;
      window.location.href = mailtoLink;

      // Show success message
      setTimeout(() => {
        setEmailStatus({ type: 'success', message: 'Email sent successfully!' });
        setEmailForm({ subject: '', message: '', attachmentName: '' });
        setTimeout(() => {
          setShowEmailForm(false);
          setEmailStatus(null);
        }, 2000);
      }, 500);
    } catch (error) {
      setEmailStatus({ type: 'error', message: 'Failed to send email. Please try again.' });
    }
  };

  return (
    <Card
      padding="md"
      shadow="sm"
      header={
        <div className="card-header-row">
          <h2 className="card-section-title">Support</h2>
          <span className="meta-pill">24x7 Help</span>
        </div>
      }
    >
      {!showEmailForm ? (
        <>
          <div className="status-row">
            <span className="status-label">Support Email</span>
            <span className="status-value">{SUPPORT_EMAIL}</span>
          </div>
          <div className="status-row">
            <span className="status-label">Support Phone</span>
            <span className="status-value">+91 98765 43210</span>
          </div>
          <div className="status-row">
            <span className="status-label">Working Hours</span>
            <span className="status-value">Mon - Sat, 9:00 AM - 7:00 PM</span>
          </div>
          <div className="support-actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowEmailForm(true)}
              className="support-email-btn"
              title="Send Email"
            >
              <span className="support-btn-content">
                <img src="/email.svg" alt="" aria-hidden="true" className="support-btn-icon" />
                Send Email Query
              </span>
            </Button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSendEmail} className="support-email-form">
          <h3 className="support-form-title">Send Email Query</h3>
          
          <div className="support-form-group">
            <label className="support-form-label">Subject *</label>
            <input
              type="text"
              name="subject"
              value={emailForm.subject}
              onChange={handleEmailInputChange}
              placeholder="Enter email subject"
              className="support-form-input"
              required
            />
          </div>

          <div className="support-form-group">
            <label className="support-form-label">Message *</label>
            <textarea
              name="message"
              value={emailForm.message}
              onChange={handleEmailInputChange}
              placeholder="Write your query here..."
              className="support-form-textarea"
              rows="5"
              required
            />
          </div>

          <div className="support-form-group">
            <label className="support-form-label">Attachment Name (optional)</label>
            <input
              type="text"
              name="attachmentName"
              value={emailForm.attachmentName}
              onChange={handleEmailInputChange}
              placeholder="e.g., invoice.pdf"
              className="support-form-input"
            />
          </div>

          {emailStatus && (
            <div className={`support-status-message support-status-${emailStatus.type}`}>
              {emailStatus.type === 'loading' && '⏳ '}
              {emailStatus.type === 'success' && '✓ '}
              {emailStatus.type === 'error' && '✗ '}
              {emailStatus.message}
            </div>
          )}

          <div className="support-form-actions">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => {
                setShowEmailForm(false);
                setEmailStatus(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
            >
              <span className="support-btn-content">
                <img src="/email.svg" alt="" aria-hidden="true" className="support-btn-icon" />
                Send Email
              </span>
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default SupportSection;
