// Helper to toggle blur class on body (must be outside component)
const setBodyBlur = (active) => {
  if (typeof document !== 'undefined') {
    if (active) {
      document.body.classList.add('modal-blur-bg');
    } else {
      document.body.classList.remove('modal-blur-bg');
    }
  }
};

import React, { useEffect, useState, useRef } from 'react';
import { fetchAuthProfilePayload } from '../../../../utils/api.js';
import { apiVerifyPan, apiVerifyAadhaar } from '../../../../utils/api.js';
import { Button, Card } from '../../../../components/ui/index.js';
import { useAuth } from '../../../../context/AuthContext.jsx';





const getDisplayValue = (value, fallback = 'Not provided') => {
  const normalized = `${value ?? ''}`.trim();
  return normalized || fallback;
};

// ─── Payment Modal Component ────────────────────────────────────────────────
const PaymentModal = ({ onClose, accessToken }) => {
  const [utr, setUtr] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // { success, message }
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshot(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!utr.trim() || !accountNumber.trim() || !amount || !bankName.trim() || !paymentDate || !screenshot) {
      setSubmitResult({ success: false, message: 'All fields including payment date and screenshot are required.' });
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const formData = new FormData();
      formData.append('utr', utr.trim());
      formData.append('accountNumber', accountNumber.trim());
      formData.append('amount', Number(amount));
      formData.append('screenshot', screenshot);
      formData.append('bank_name', bankName.trim());
      formData.append('payment_date', paymentDate);
      const BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${BASE_URL}/api/payment/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Do NOT set Content-Type for multipart/form-data; browser sets it automatically
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSubmitResult({ success: true, message: data?.message || 'Payment submitted successfully!' });
      } else {
        setSubmitResult({ success: false, message: data?.message || `Error: ${res.status} ${res.statusText}` });
      }
    } catch (err) {
      setSubmitResult({ success: false, message: err.message || 'Payment submission failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitResult?.success) {
      window.location.reload();
    } else {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 2100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
        padding: '12px',
        overflowY: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{
        background: '#fff',
        padding: '32px 28px 24px',
        borderRadius: 12,
        width: 'min(480px, calc(100vw - 24px))',
        minWidth: 0,
        maxHeight: 'calc(100vh - 24px)',
        overflowY: 'auto',
        boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
        position: 'relative',
        margin: 'auto 0',
      }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: 14, right: 16,
            background: 'none', border: 'none',
            fontSize: 22, cursor: 'pointer', color: '#888', lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>

        <h4 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e' }}>
          Submit Payment
        </h4>
        <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: '#666' }}>
          Fill in your payment details and upload a screenshot proof.
        </p>

        {submitResult ? (
          <div>
            <div style={{
              padding: '14px 16px',
              borderRadius: 8,
              background: submitResult.success ? '#edfaf3' : '#fff3f3',
              color: submitResult.success ? '#1a7f4b' : '#c0392b',
              fontWeight: 500,
              marginBottom: 20,
              fontSize: '0.97rem',
            }}>
              {submitResult.success ? '✓ ' : '✗ '}{submitResult.message}
            </div>
            <button
              onClick={handleClose}
              style={{
                width: '100%', padding: '10px 0',
                background: submitResult.success ? '#27ae60' : '#2d72d2',
                color: '#fff', border: 'none', borderRadius: 6,
                fontWeight: 600, fontSize: '0.97rem', cursor: 'pointer',
              }}
            >
              {submitResult.success ? 'Close & Refresh' : 'Try Again'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* UTR */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>UTR / Transaction Number <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="Enter UTR or transaction number"
                style={inputStyle}
                disabled={submitting}
              />
            </div>

            {/* Account Number */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Your Account Number (From which you made the payment) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                style={inputStyle}
                disabled={submitting}
              />
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Amount (₹) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                style={inputStyle}
                disabled={submitting}
              />
            </div>

            {/* Bank Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Bank Name <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Enter your bank name"
                style={inputStyle}
                disabled={submitting}
              />
            </div>

            {/* Payment Date */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Payment Date <span style={{ color: 'red' }}>*</span></label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                style={inputStyle}
                disabled={submitting}
              />
            </div>

            {/* Screenshot Upload */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Screenshot Proof <span style={{ color: 'red' }}>*</span></label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #b0bec5',
                  borderRadius: 8,
                  padding: screenshotPreview ? 8 : '18px 12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#f9fbfc',
                  transition: 'border-color 0.2s',
                }}
              >
                {screenshotPreview ? (
                  <img
                    src={screenshotPreview}
                    alt="Screenshot preview"
                    style={{ maxHeight: 140, maxWidth: '100%', borderRadius: 6, objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ color: '#90a4ae', fontSize: '0.88rem' }}>
                    📎 Click to upload screenshot (JPG, PNG, PDF)
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                disabled={submitting}
              />
              {screenshot && (
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#607d8b' }}>
                  {screenshot.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '11px 0',
                background: submitting ? '#90a4ae' : '#2d72d2',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: '1rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                letterSpacing: 0.3,
                transition: 'background 0.2s',
              }}
            >
              {submitting ? 'Submitting…' : 'Submit Payment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  marginBottom: 5,
  fontWeight: 600,
  fontSize: '0.85rem',
  color: '#444',
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #d0d7de',
  borderRadius: 6,
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fafbfc',
  color: '#222',
};
// ────────────────────────────────────────────────────────────────────────────


const ProfileSection = ({
  profileCompletion,
  completedProfileFieldsCount,
  totalProfileFields,
  paymentReady,
  paymentPreferenceLabel,
  navigate,
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const [profileDetails, setProfileDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [verifyPanLoading, setVerifyPanLoading] = useState(false);
  const [verifyAadhaarLoading, setVerifyAadhaarLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAadhaarVerifyModal, setShowAadhaarVerifyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // Aadhaar inline verify state
  const [aadhaarVerifyResult, setAadhaarVerifyResult] = useState(null);
  const [aadhaarVerifyError, setAadhaarVerifyError] = useState('');

  // Blur background when any modal is open
  useEffect(() => {
    setBodyBlur(showVerifyModal || showAadhaarVerifyModal || showPaymentModal);
    return () => setBodyBlur(false);
  }, [showVerifyModal, showAadhaarVerifyModal, showPaymentModal]);

  const [verifyError, setVerifyError] = useState('');
  const [editDocFields, setEditDocFields] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('POTENS_admin_access_token');
        if (!token) throw new Error('No auth token found');
        const details = await fetchAuthProfilePayload(token);
        setProfileDetails(details);

        // console.log('Fetched profile details:', details);
        setFullName(details?.user?.name || details?.fullName || '');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, authLoading]);

  if (authLoading || !user || !user.id) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
  }

  const safeProfileDetails = profileDetails?.user ? profileDetails : { user: user || {}, professional: {}, address: {}, documents: {}, payment: {}, vehicle: {} };
  const apiUser = safeProfileDetails.user || {};
  const professional = safeProfileDetails.professional ?? {};
  const address = safeProfileDetails.address ?? {};
  const documents = safeProfileDetails.documents ?? {};
  const payment = safeProfileDetails.payment ?? {};
  const vehicle = safeProfileDetails.vehicle ?? {};
  const permanentAddress = (address && typeof address === 'object' ? address.permanent_address : undefined) ?? {};
  const businessAddress = (address && typeof address === 'object' ? address.business_address : undefined) ?? {};

  const accountRows = [
    { label: 'Full Name', value: getDisplayValue(apiUser?.full_name || profileDetails?.full_name) },
    { label: 'Email', value: getDisplayValue(apiUser?.email || user?.email) },
    { label: 'Phone', value: getDisplayValue(apiUser?.phone || user?.phone) },
    { label: 'Role', value: getDisplayValue(apiUser?.role || user?.role) },
    { label: 'Status', value: getDisplayValue(apiUser?.status) },
    { label: 'Onboarded', value: apiUser?.is_onboarded ? 'Yes' : 'No' },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getDOBValue = () => {
    if (typeof professional?.dob === 'string' && professional.dob) return formatDate(professional.dob);
    if (typeof profileDetails?.dob === 'string' && profileDetails.dob) return formatDate(profileDetails.dob);
    return undefined;
  };

  const profileRows = [
    { label: 'Register As', value: getDisplayValue(professional?.register_as || user?.role) },
    { label: 'Father Name', value: getDisplayValue(professional?.father_name || profileDetails?.fatherName) },
    { label: 'Date of Birth', value: getDisplayValue(getDOBValue()) },
    { label: 'Gender', value: getDisplayValue(professional?.gender || profileDetails?.gender) },
    { label: 'Field Officer', value: getDisplayValue(professional?.field_officer_name || profileDetails?.fieldOfficerName) },
    { label: 'Investment Plan', value: getDisplayValue(professional?.investment_plan || profileDetails?.investmentPlan) },
    { label: 'Oil Experience (Years)', value: getDisplayValue(professional?.oil_sector_experience_years || profileDetails?.oilSectorExperienceYears) },
    { label: 'Nearest Pump (KM)', value: getDisplayValue(professional?.distance_to_nearest_petrol_pump_km || profileDetails?.nearestFuelPumpDistance) },
    { label: 'Land Area (Acres)', value: getDisplayValue(professional?.land_area_acres) },
  ];

  // Payment details from profileDetails.payment or similar
  // Debug: log payment details structure
  // console.log('ProfileSection payment details:', profileDetails?.payment, profileDetails);
  const paymentDetails = profileDetails?.payment || {};
  const paymentRows = [
    { label: 'Payment Mode', value: getDisplayValue(paymentPreferenceLabel) },
    { label: 'UPI ID', value: getDisplayValue(paymentDetails.upi_id || profileDetails?.upiId) },
    { label: 'Bank Name', value: getDisplayValue(paymentDetails.bank_name || profileDetails?.bankName) },
    { label: 'Account Holder', value: getDisplayValue(paymentDetails.account_holder_name || profileDetails?.accountHolderName) },
    { label: 'Account Number', value: getDisplayValue(paymentDetails.account_number || profileDetails?.bankAccountNumber) },
    { label: 'IFSC Code', value: getDisplayValue(paymentDetails.ifsc_code || profileDetails?.ifscCode) },
    { label: 'Branch', value: getDisplayValue(paymentDetails.branch_name || profileDetails?.bankBranch) },
    { label: 'Other Details', value: getDisplayValue(paymentDetails.other_details || profileDetails?.paymentOtherDetails) },
    // Additional payment submission details if present
    paymentDetails.amount !== undefined ? { label: 'Amount', value: getDisplayValue(paymentDetails.amount) } : null,
    paymentDetails.transaction_number ? { label: 'Transaction Number', value: getDisplayValue(paymentDetails.transaction_number) } : null,
    paymentDetails.status ? { label: 'Payment Status', value: getDisplayValue(paymentDetails.status) } : null,
  ].filter(Boolean);

  const permanentAddressRows = [
    { label: 'Address Line 1', value: getDisplayValue(permanentAddress?.address_line1 || profileDetails?.permanentAddressLine1) },
    { label: 'Address Line 2', value: getDisplayValue(permanentAddress?.address_line2 || profileDetails?.permanentAddressLine2) },
    { label: 'City', value: getDisplayValue(permanentAddress?.city || profileDetails?.permanentCity) },
    { label: 'District', value: getDisplayValue(permanentAddress?.district || profileDetails?.permanentDistrict) },
    { label: 'State', value: getDisplayValue(permanentAddress?.state || profileDetails?.permanentState) },
    { label: 'Pincode', value: getDisplayValue(permanentAddress?.pincode || profileDetails?.permanentPincode) },
  ];

  const businessAddressRows = [
    { label: 'Address Line 1', value: getDisplayValue(businessAddress?.address_line1 || profileDetails?.businessAddressLine1) },
    { label: 'Address Line 2', value: getDisplayValue(businessAddress?.address_line2 || profileDetails?.businessAddressLine2) },
    { label: 'City', value: getDisplayValue(businessAddress?.city || profileDetails?.businessCity) },
    { label: 'District', value: getDisplayValue(businessAddress?.district || profileDetails?.businessDistrict) },
    { label: 'State', value: getDisplayValue(businessAddress?.state || profileDetails?.businessState) },
    { label: 'Pincode', value: getDisplayValue(businessAddress?.pincode || profileDetails?.businessPincode) },
  ];

  const documentRows = [
    { label: 'PAN Number', value: getDisplayValue(documents?.pan_card?.number), showVerify: true, type: 'pan' },
    { label: 'Aadhaar Number', value: getDisplayValue(documents?.aadhaar_card && typeof documents?.aadhaar_card === 'object' ? documents?.aadhaar_card?.number : ''), showVerify: true, type: 'aadhaar' },
    { label: 'Driving License', value: getDisplayValue(documents?.driving_license?.number), showVerify: true },
    { label: 'Vehicle RC', value: getDisplayValue(documents?.vehicle_rc?.number), showVerify: true },
  ];

  const panNumber = documents?.pan_card?.number || '';
  const userId = apiUser?.id || apiUser?._id || apiUser?.user_id || profileDetails?.userId || '';
  const accessToken = localStorage.getItem('POTENS_admin_access_token') || '';

  const handleVerifyPan = async (e) => {
    e.preventDefault();
    setVerifyPanLoading(true);
    setVerifyResult(null);
    setVerifyError('');
    try {
      const res = await apiVerifyPan({ panNumber, userId });
      setVerifyResult(res);
      setShowVerifyModal(true);
    } catch (err) {
      setVerifyError(err.message || 'PAN verification failed.');
      setShowVerifyModal(true);
    } finally {
      setVerifyPanLoading(false);
    }
  };

  const aadhaarNumber = documents?.aadhaar_card && typeof documents?.aadhaar_card === 'object'
    ? (documents.aadhaar_card.number || '')
    : '';

  const handleVerifyAadhaar = async () => {
    setVerifyAadhaarLoading(true);
    setAadhaarVerifyResult(null);
    setAadhaarVerifyError('');
    try {
      const res = await apiVerifyAadhaar({
        aadhaarNumber,
        userId,
        token: accessToken,
      });
      setAadhaarVerifyResult(res);
      setShowAadhaarVerifyModal(true);
    } catch (err) {
      setAadhaarVerifyError(err.message || 'Aadhaar verification failed.');
      setShowAadhaarVerifyModal(true);
    } finally {
      setVerifyAadhaarLoading(false);
    }
  };

  const renderRows = (rows) => (
    <div className="profile-details-grid">
      {rows.map(({ label, value, showVerify }) => {
        const panVerified = (profileDetails?.pan_varified === true || profileDetails?.documents?.pan_varified === true);
        const aadhaarVerified = (profileDetails?.adhar_varified === true || profileDetails?.documents?.adhar_varified === true);
        return (
          <div key={label} className="profile-details-item" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{label}</span>
            <strong>{value}</strong>
            {showVerify && label === 'PAN Number' && (
              panVerified ? (
                <Button size="xs" style={{ marginLeft: 8, minWidth: 60, padding: '4px 10px', fontSize: '0.85rem', background: '#27ae60', color: '#fff', border: 'none', cursor: 'default' }} disabled>
                  Verified ✓
                </Button>
              ) : (
                <Button size="xs" style={{ marginLeft: 8, minWidth: 60, padding: '4px 10px', fontSize: '0.85rem' }} loading={verifyPanLoading} onClick={handleVerifyPan} disabled={verifyPanLoading}>
                  Verify
                </Button>
              )
            )}
            {showVerify && label === 'Aadhaar Number' && (
              aadhaarVerified ? (
                <Button size="xs" style={{ marginLeft: 8, minWidth: 60, padding: '4px 10px', fontSize: '0.85rem', background: '#27ae60', color: '#fff', border: 'none', cursor: 'default' }} disabled>
                  Verified ✓
                </Button>
              ) : (
                <>
                  <Button
                    size="xs"
                    style={{ marginLeft: 8, minWidth: 60, padding: '4px 10px', fontSize: '0.85rem' }}
                    loading={verifyAadhaarLoading}
                    onClick={handleVerifyAadhaar}
                    disabled={verifyAadhaarLoading}
                  >
                    {verifyAadhaarLoading ? 'Verifying…' : 'Verify'}
                  </Button>
                </>
              )
            )}
          </div>
        );
      })}

      {/* Aadhaar Verify Modal */}
      {showAadhaarVerifyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, maxWidth: 480, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
            <h4 style={{ marginTop: 0 }}>Aadhaar Verification</h4>
            {aadhaarVerifyResult && aadhaarVerifyResult.success ? (
              <div style={{ color: '#27ae60', fontWeight: 500, margin: '16px 0' }}>
                Aadhaar verified successfully!
              </div>
            ) : (
              <div style={{ color: 'red', fontWeight: 500, margin: '16px 0' }}>
                {aadhaarVerifyError || aadhaarVerifyResult?.message || 'Aadhaar verification failed.'}
              </div>
            )}
            <button
              style={{ marginTop: 16, padding: '6px 18px', background: '#2d72d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              onClick={() => { setShowAadhaarVerifyModal(false); window.location.reload(); }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* PAN Verify Modal */}
      {showVerifyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, maxWidth: 480, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
            <h4 style={{ marginTop: 0 }}>PAN Verification</h4>
            {verifyResult && verifyResult.success && verifyResult.verified ? (
              <div style={{ color: '#27ae60', fontWeight: 500, margin: '16px 0' }}>
                PAN verified successfully!<br />
                Name: <b>{verifyResult.panName || 'N/A'}</b><br />
                {verifyResult.aadhaarVerified
                  ? 'Aadhaar also verified.'
                  : verifyResult.aadhaarReason
                    ? <span style={{ color: 'red', display: 'block', marginTop: 8 }}>Aadhaar not verified: {verifyResult.aadhaarReason}</span>
                    : ''}
              </div>
            ) : verifyResult && (!verifyResult.success || !verifyResult.verified) ? (
              <div style={{ color: 'red', fontWeight: 500, margin: '16px 0' }}>PAN verification failed.</div>
            ) : verifyError ? (
              <div style={{ color: 'red', fontWeight: 500, margin: '16px 0' }}>{verifyError}</div>
            ) : null}
            <button
              style={{ marginTop: 16, padding: '6px 18px', background: '#2d72d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              onClick={() => { setShowVerifyModal(false); window.location.reload(); }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const REQUIRED_PROFILE_FIELDS_MAP = [
    { label: 'Full Name', path: ['user', 'full_name'] },
    { label: 'Father Name', path: ['professional', 'father_name'] },
    { label: 'Date of Birth', path: ['professional', 'dob'] },
    { label: 'Gender', path: ['professional', 'gender'] },
    { label: 'State', path: ['professional', 'state'] },
    { label: 'District', path: ['professional', 'district'] },
    { label: 'Field Officer', path: ['professional', 'field_officer_name'] },
    { label: 'Pin Code', path: ['professional', 'pincode'] },
    { label: 'Oil Experience (Years)', path: ['professional', 'oil_sector_experience_years'] },
    { label: 'Nearest Pump (KM)', path: ['professional', 'distance_to_nearest_petrol_pump_km'] },
    { label: 'Investment Plan', path: ['professional', 'investment_plan'] },
    { label: 'Permanent Address Line 1', path: ['address', 'permanent_address', 'address_line1'] },
    { label: 'Permanent Address Line 2', path: ['address', 'permanent_address', 'address_line2'] },
    { label: 'Permanent City', path: ['address', 'permanent_address', 'city'] },
    { label: 'Permanent State', path: ['address', 'permanent_address', 'state'] },
    { label: 'Permanent District', path: ['address', 'permanent_address', 'district'] },
    { label: 'Permanent Pincode', path: ['address', 'permanent_address', 'pincode'] },
    { label: 'Business Address Line 1', path: ['address', 'business_address', 'address_line1'] },
    { label: 'Business Address Line 2', path: ['address', 'business_address', 'address_line2'] },
    { label: 'Business City', path: ['address', 'business_address', 'city'] },
    { label: 'Business State', path: ['address', 'business_address', 'state'] },
    { label: 'Business District', path: ['address', 'business_address', 'district'] },
    { label: 'Business Pincode', path: ['address', 'business_address', 'pincode'] },
    { label: 'Vehicle Number', path: ['vehicle', 'vehicle_number'] },
    { label: 'Payment Mode', path: ['payment', 'payment_mode'] },
    { label: 'PAN Number', path: ['documents', 'pan_card', 'number'] },
    { label: 'Aadhaar Number', path: ['documents', 'aadhaar_card', 'number'] },
    { label: 'Driving License Number', path: ['documents', 'driving_license', 'number'] },
    { label: 'Vehicle RC Number', path: ['documents', 'vehicle_rc', 'number'] },
    { label: 'Passport Photo', path: ['documents', 'passport_size_photo'] },
    { label: 'NOC', path: ['documents', 'noc'] },
  ];

  const getNestedValue = (obj, pathArr) => pathArr.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  const isFilled = (value) => {
    if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
    return Boolean(String(value ?? '').trim());
  };

  const missingSections = REQUIRED_PROFILE_FIELDS_MAP
    .filter(({ path }) => !isFilled(getNestedValue(safeProfileDetails, path)))
    .map(({ label }) => label);

  const showProfileAlert = missingSections.length > 0 && (typeof profileCompletion === 'number' ? profileCompletion < 100 : true);

  return (
    <div className="profile-section">
      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          accessToken={accessToken}
        />
      )}

      <Card padding="md" shadow="sm" className="profile-section-hero">
        <div className="profile-section-hero-head">
          <div>
            <p className="dashboard-kicker">My Profile</p>
            <h2 className="card-section-title">All fetched account details</h2>
            <p className="dashboard-subtitle">View your auth and onboarding profile data in one place.</p>
          </div>
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPaymentModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              + Submit Payment
            </Button>
            <Button size="sm" onClick={() => navigate('/profile-completion')}>
              Update Profile
            </Button>
          </div>
        </div>
      </Card>

      <div className="profile-cards-grid">
        <Card padding="md" shadow="sm" className="profile-details-card">
          <h3 className="card-section-title card-section-title--spaced">Account Information</h3>
          {renderRows(accountRows)}
        </Card>

        <Card padding="md" shadow="sm" className="profile-details-card">
          <h3 className="card-section-title card-section-title--spaced">Onboarding Information</h3>
          {renderRows(profileRows)}
        </Card>

        <Card padding="md" shadow="sm" className="profile-details-card">
          <h3 className="card-section-title card-section-title--spaced">Permanent Address</h3>
          {renderRows(permanentAddressRows)}
        </Card>

        <Card padding="md" shadow="sm" className="profile-details-card">
          <h3 className="card-section-title card-section-title--spaced">Business Address</h3>
          {renderRows(businessAddressRows)}
        </Card>

        {/* Payment Submission Details Card (styled like others) */}
        {profileDetails?.payment && (
          <Card padding="md" shadow="sm" className="profile-details-card">
            <h3 className="card-section-title card-section-title--spaced">Payment Submission Details</h3>
            {renderRows([
              { label: 'Account Number', value: profileDetails.payment.account_number },
              { label: 'Bank Name', value: profileDetails.payment.bank_name },
              { label: 'Amount', value: profileDetails.payment.amount },
              { label: 'Transaction Number', value: profileDetails.payment.transaction_number },
              { label: 'Status', value: profileDetails.payment.status },
            ].filter(row => row.value !== undefined && row.value !== ''))}
          </Card>
        )}

        <Card padding="md" shadow="sm" className="profile-details-card profile-details-card--wide">
          <h3 className="card-section-title card-section-title--spaced">Document Information</h3>
          {renderRows(documentRows)}
        </Card>
      </div>
    </div>
  );
};

export default ProfileSection;