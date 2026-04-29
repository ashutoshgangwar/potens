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

import React, { useEffect, useState } from 'react';
import { fetchAuthProfilePayload } from '../../../../utils/api.js';
import { apiVerifyPan, apiVerifyAadhaar } from '../../../../utils/api.js';
import { Button, Card } from '../../../../components/ui/index.js';
import { useAuth } from '../../../../context/AuthContext.jsx';

const getDisplayValue = (value, fallback = 'Not provided') => {
  const normalized = `${value ?? ''}`.trim();
  return normalized || fallback;
};

const hasDocumentData = (doc) => {
  if (!doc || typeof doc !== 'object') {
    return false;
  }
  return Object.keys(doc).length > 0;
};



const ProfileSection = ({
  profileCompletion,
  completedProfileFieldsCount,
  totalProfileFields,
  paymentReady,
  paymentPreferenceLabel,
  navigate,
}) => {
  const { user, isLoading: authLoading } = useAuth();
  // All hooks at the top, before any return!
  const [profileDetails, setProfileDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [verifyPanLoading, setVerifyPanLoading] = useState(false);
  const [verifyAadhaarLoading, setVerifyAadhaarLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Blur background when modal is open
  useEffect(() => {
    setBodyBlur(showVerifyModal);
    return () => setBodyBlur(false);
  }, [showVerifyModal]);
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
        setFullName(details?.user?.name || details?.fullName || '');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, authLoading]);

  if (authLoading || !user || !user.id) {
    return <div style={{padding: '2rem', textAlign: 'center'}}>Loading profile...</div>;
  }

  if (loading) {
    return <div style={{padding: '2rem', textAlign: 'center'}}>Loading profile...</div>;
  }
  // If no profile found, use empty/default objects so UI renders but is empty
  const safeProfileDetails = profileDetails?.user ? profileDetails : { user: user || {}, professional: {}, address: {}, documents: {}, payment: {}, vehicle: {} };
  // Use safeProfileDetails everywhere to avoid blocking UI
  const apiUser = safeProfileDetails.user || {};
  const professional = safeProfileDetails.professional ?? {};
  const address = safeProfileDetails.address ?? {};
  const documents = safeProfileDetails.documents ?? {};
  const payment = safeProfileDetails.payment ?? {};
  const vehicle = safeProfileDetails.vehicle ?? {};
  const permanentAddress = (address && typeof address === 'object' ? address.permanent_address : undefined) ?? {};
  const businessAddress = (address && typeof address === 'object' ? address.business_address : undefined) ?? {};

  const accountRows = [
    { label: 'Full Name', value: getDisplayValue(apiUser?.name || profileDetails?.fullName) },
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
    // Format as DD-MM-YYYY
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
    { label: 'State / District', value: getDisplayValue(`${professional?.state || profileDetails?.state || ''} ${professional?.district || profileDetails?.district || ''}`.trim()) },
    { label: 'Pin Code', value: getDisplayValue(professional?.pincode || profileDetails?.pinCode) },
    { label: 'Investment Plan', value: getDisplayValue(professional?.investment_plan || profileDetails?.investmentPlan) },
    { label: 'Oil Experience (Years)', value: getDisplayValue(professional?.oil_sector_experience_years || profileDetails?.oilSectorExperienceYears) },
    { label: 'Nearest Pump (KM)', value: getDisplayValue(professional?.distance_to_nearest_petrol_pump_km || profileDetails?.nearestFuelPumpDistance) },
    { label: 'Land Area (Acres)', value: getDisplayValue(professional?.land_area_acres) },
    { label: 'Vehicle Number', value: getDisplayValue(vehicle?.vehicle_number || profileDetails?.vehicleNumber) },
  ];

  const paymentRows = [
    { label: 'Payment Mode', value: getDisplayValue(paymentPreferenceLabel) },
    { label: 'UPI ID', value: getDisplayValue(payment?.upi_id || profileDetails?.upiId) },
    { label: 'Bank Name', value: getDisplayValue(payment?.bank_name || profileDetails?.bankName) },
    { label: 'Account Holder', value: getDisplayValue(payment?.account_holder_name || profileDetails?.accountHolderName) },
    { label: 'Account Number', value: getDisplayValue(payment?.account_number || profileDetails?.bankAccountNumber) },
    { label: 'IFSC Code', value: getDisplayValue(payment?.ifsc_code || profileDetails?.ifscCode) },
    { label: 'Branch', value: getDisplayValue(payment?.branch_name || profileDetails?.bankBranch) },
    { label: 'Other Details', value: getDisplayValue(payment?.other_details || profileDetails?.paymentOtherDetails) },
  ];

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

  // Always use API response values for document numbers (no duplication)
  const documentRows = [
    { label: 'PAN Number', value: getDisplayValue(documents?.pan_card?.number), showVerify: true, type: 'pan' },
    // Always use the latest Aadhaar number from API response, never fallback to any other value
    { label: 'Aadhaar Number', value: getDisplayValue(documents?.aadhaar_card && typeof documents?.aadhaar_card === 'object' ? documents?.aadhaar_card?.number : ''), showVerify: true, type: 'aadhaar' },
    { label: 'Driving License', value: getDisplayValue(documents?.driving_license?.number), showVerify: true },
    { label: 'Vehicle RC', value: getDisplayValue(documents?.vehicle_rc?.number), showVerify: true },
    { label: 'NOC', value: hasDocumentData(documents?.noc) ? 'Submitted' : 'Not provided' },
    { label: 'Passport Photo', value: hasDocumentData(documents?.passport_size_photo) ? 'Submitted' : 'Not provided' },
  ];

  // Separate handlers for PAN and Aadhaar verification
  // useState declarations moved to the top, duplicates removed


  // Get PAN number and userId for verification
  const panNumber = documents?.pan_card?.number || '';

  const handleVerifyPan = async (e) => {
    e.preventDefault();
    setVerifyPanLoading(true);
    setVerifyResult(null);
    setVerifyError('');
    try {
      const res = await apiVerifyPan({ panNumber, userId });
      console.log('[PAN VERIFY API RESPONSE]', res);
      setVerifyResult(res);
      setShowVerifyModal(true);
    } catch (err) {
      console.log('[PAN VERIFY ERROR]', err, err?.message);
      setVerifyError(err.message || 'PAN verification failed.');
      setShowVerifyModal(true);
    } finally {
      setVerifyPanLoading(false);
    }
  };

  // const handleVerifyAadhaar = async (e) => {
  //   e.preventDefault();
  //   setVerifyAadhaarLoading(true);
  //   setVerifyResult(null);
  //   setVerifyError('');
  //   try {
  //       const res = await apiVerifyAadhaar({ aadhaarNumber: documents?.aadhaar_card?.number || '', userId });
  //     setVerifyResult(res);
  //   } catch (err) {
  //     setVerifyError(err.message || 'Aadhaar verification failed.');
  //   } finally {
  //     setVerifyAadhaarLoading(false);
  //   }
  // };

  // Render rows with Verify button for PAN/Aadhaar only
  const renderRows = (rows) => (
    <div className="profile-details-grid">
      {rows.map(({ label, value, showVerify }) => {
        // Check for PAN/Aadhaar verified flags from API response
        const panVerified = (profileDetails?.pan_varified === true || profileDetails?.documents?.pan_varified === true);
        const aadhaarVerified = (profileDetails?.adhar_varified === true || profileDetails?.documents?.adhar_varified === true);
        return (
          <div key={label} className="profile-details-item" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{label}</span>
            <strong>{value}</strong>
            {showVerify && label === 'PAN Number' && (
              panVerified ? (
                <Button
                  size="xs"
                  style={{ marginLeft: 8, minWidth: 60, padding: '4px 10px', fontSize: '0.85rem', background: '#27ae60', color: '#fff', border: 'none', cursor: 'default' }}
                  disabled
                >
                  Verified ✓
                </Button>
              ) : (
                <Button
                  size="xs"
                  style={{ marginLeft: 8, minWidth: 60, padding: '4px 10px', fontSize: '0.85rem' }}
                  loading={verifyPanLoading}
                  onClick={handleVerifyPan}
                  disabled={verifyPanLoading}
                >
                  Verify
                </Button>
              )
            )}
            {showVerify && label === 'Aadhaar Number' && (
              aadhaarVerified ? (
                <Button
                  size="xs"
                  style={{ marginLeft: 8, minWidth: 60, padding: '4px 10px', fontSize: '0.85rem', background: '#27ae60', color: '#fff', border: 'none', cursor: 'default' }}
                  disabled
                >
                  Verified ✓
                </Button>
              ) : (
                <Button
                  size="xs"
                  style={{ marginLeft: 8, minWidth: 60, padding: '4px 10px', fontSize: '0.85rem' }}
                  loading={verifyAadhaarLoading}
                  onClick={handleVerifyPan}
                  disabled={verifyAadhaarLoading}
                >
                  Verify
                </Button>
              )
            )}
          </div>
        );
      })}
      {/* Show verification result or error below the grid */}
      {/* No inline status for PAN verify, only show in modal below */}

      {/* Modal for PAN verify API response or error */}
      {showVerifyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
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
              onClick={() => {
                setShowVerifyModal(false);
                window.location.reload();
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
  

  // Always use the latest values from documents for PAN and Aadhaar
  const userId = apiUser?.id || apiUser?._id || apiUser?.user_id || profileDetails?.userId || '';

  // --- Profile Alert Logic ---

  // Map of required fields to their nested paths in the API response
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

  // Helper to get nested value by path
  const getNestedValue = (obj, pathArr) => pathArr.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  const isFilled = (value) => {
    if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
    return Boolean(String(value ?? '').trim());
  };

  // Compute missing sections for alert using correct nested paths
  const missingSections = REQUIRED_PROFILE_FIELDS_MAP
    .filter(({ label, path }) => !isFilled(getNestedValue(safeProfileDetails, path)))
    .map(({ label }) => label);

  // Show alert if any required section is missing and profileCompletion < 100
  const showProfileAlert = missingSections.length > 0 && (typeof profileCompletion === 'number' ? profileCompletion < 100 : true);

  // --- End Profile Alert Logic ---

  // (Unused code for handleVerify removed)

  return (
    <div className="profile-section">
      {/* Always render the rest of the profile UI, even if alert is shown */}
      <Card padding="md" shadow="sm" className="profile-section-hero">
        <div className="profile-section-hero-head">
          <div>
            <p className="dashboard-kicker">My Profile</p>
            <h2 className="card-section-title">All fetched account details</h2>
            <p className="dashboard-subtitle">View your auth and onboarding profile data in one place.</p>
          </div>
          <Button size="sm" onClick={() => navigate('/profile-completion')}>
            Update Profile
          </Button>
        </div>

        <section className="profile-health-panel" aria-label="Profile summary">
          <article className="profile-health-metric">
            <header className="profile-health-metric-head">
              <span className="profile-health-label">Profile completion</span>
              <strong className="profile-health-value">{profileCompletion}%</strong>
            </header>
            <progress
              className="profile-health-progress"
              max="100"
              value={profileCompletion}
              aria-label={`Profile completion ${profileCompletion}%`}
            />
            <p className="profile-health-copy">
              {completedProfileFieldsCount}/{totalProfileFields} fields completed
            </p>
          </article>

          <article className="profile-health-metric">
            <header className="profile-health-metric-head">
              <span className="profile-health-label">Payment readiness</span>
              <strong className={`profile-health-status ${paymentReady ? 'profile-health-ok' : 'profile-health-pending'}`}>
                {paymentReady ? 'Ready' : 'Pending'}
              </strong>
            </header>
            <dl className="profile-health-meta">
              <dt>Preferred method</dt>
              <dd>{paymentPreferenceLabel}</dd>
            </dl>
          </article>
        </section>
      </Card>

      <div className="profile-cards-grid">
        {/* PAN/Aadhaar Verification Section */}
        {/* Document Information Card with PAN/Aadhaar Verification */}
        {/* ...existing code... */}
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

        <Card padding="md" shadow="sm" className="profile-details-card profile-details-card--wide">
          <h3 className="card-section-title card-section-title--spaced">Document Information</h3>
          {renderRows(documentRows)}
        </Card>
      </div>
    </div>
  );
}

export default ProfileSection;
