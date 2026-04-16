import React from 'react';
import { Button, Card } from '../../../../components/ui/index.js';

const getDisplayValue = (value, fallback = 'Not provided') => {
  const normalized = `${value ?? ''}`.trim();
  return normalized || fallback;
};

const hasDocumentData = (doc) => {
  if (!doc || typeof doc !== 'object') {
    return false;
  }

  if (typeof doc.number === 'string' && doc.number.trim()) {
    return true;
  }

  if (typeof doc.file_url === 'string' && doc.file_url.trim()) {
    return true;
  }

  return Object.keys(doc).length > 0;
};

const ProfileSection = ({
  user,
  profileDetails,
  profileCompletion,
  completedProfileFieldsCount,
  totalProfileFields,
  uploadedDocuments,
  totalDocuments,
  paymentReady,
  paymentPreferenceLabel,
  navigate,
}) => {
  const apiUser = profileDetails?.user || user || {};
  const professional = profileDetails?.professional || {};
  const address = profileDetails?.address || {};
  const documents = profileDetails?.documents || {};
  const payment = profileDetails?.payment || {};
  const vehicle = profileDetails?.vehicle || {};
  const permanentAddress = address?.permanent_address || {};
  const businessAddress = address?.business_address || {};

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

  const documentRows = [
    { label: 'PAN Number', value: getDisplayValue(documents?.pan_card?.number || profileDetails?.panNumber) },
    { label: 'Aadhaar Number', value: getDisplayValue(documents?.aadhaar_card?.number || profileDetails?.aadhaarNumber) },
    { label: 'Driving License', value: getDisplayValue(documents?.driving_license?.number || profileDetails?.drivingLicenseNumber) },
    { label: 'Vehicle RC', value: getDisplayValue(documents?.vehicle_rc?.number || profileDetails?.vehicleRcNumber) },
    { label: 'NOC', value: hasDocumentData(documents?.noc) ? 'Submitted' : 'Not provided' },
    { label: 'Passport Photo', value: hasDocumentData(documents?.passport_size_photo) ? 'Submitted' : 'Not provided' },
  ];

  const renderRows = (rows) => (
    <div className="profile-details-grid">
      {rows.map(({ label, value }) => (
        <div key={label} className="profile-details-item">
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );

  return (
    <div className="profile-section">
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
        <Card padding="md" shadow="sm" className="profile-details-card">
          <h3 className="card-section-title card-section-title--spaced">Account Information</h3>
          {renderRows(accountRows)}
        </Card>

        <Card padding="md" shadow="sm" className="profile-details-card">
          <h3 className="card-section-title card-section-title--spaced">Onboarding Information</h3>
          {renderRows(profileRows)}
        </Card>

        <Card padding="md" shadow="sm" className="profile-details-card profile-details-card--wide">
          <h3 className="card-section-title card-section-title--spaced">Payment Information</h3>
          {renderRows(paymentRows)}
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
};

export default ProfileSection;
