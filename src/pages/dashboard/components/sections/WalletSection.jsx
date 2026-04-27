import React, { useState } from 'react';

const FUEL_COMPANIES = [
  {
    id: 'iocl',
    name: 'IOCL',
    requiresOnboarding: true,
  },
  {
    id: 'bpcl',
    name: 'BPCL',
    requiresOnboarding: true,
  },
  {
    id: 'hpcl',
    name: 'HPCL',
    requiresOnboarding: true,
  },
];

const FuelIcon = ({ iconColor = '#7c3aed', bgColor = '#e9e0f7' }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill={bgColor} />
    <path d="M7 20V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3l2-2v8a2 2 0 0 1-2 2H8a1 1 0 0 1-1-1z" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M10 10h3M10 13h3" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 6l4 4 4-4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5.5" cy="18.5" r="2.5" stroke="#d97706" strokeWidth="1.5"/>
    <circle cx="18.5" cy="18.5" r="2.5" stroke="#d97706" strokeWidth="1.5"/>
  </svg>
);

const COMPANY_COLORS = {
  iocl: { from: '#c0392b', to: '#7b241c', accent: '#e74c3c', soft: '#fde8e6', text: '#a93226' },
  bpcl: { from: '#1a5276', to: '#0e2f4e', accent: '#2e86c1', soft: '#e7f2fb', text: '#1f618d' },
  hpcl: { from: '#1e3a5f', to: '#0d1f36', accent: '#2980b9', soft: '#e8eef8', text: '#1f3a5f' },
};

const WalletCard = ({ company, vehicleNumber, mobileNumber, vehicleMake, vehicleType, yearOfReg, onReset }) => {
  const colors = COMPANY_COLORS[company.id] || COMPANY_COLORS.iocl;
  const cardSuffix = React.useRef(Math.floor(1000 + Math.random() * 9000)).current;
  const cardNumber = `**** **** **** ${cardSuffix}`;
  const issued = new Date().toLocaleDateString('en-IN', { month: '2-digit', year: '2-digit' });

  return (
    <div className="wallet-card-wrap">
      <div className="fuel-card" style={{ background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)` }}>
        <div className="fuel-card__circle fuel-card__circle--1" style={{ background: colors.accent }} />
        <div className="fuel-card__circle fuel-card__circle--2" style={{ background: colors.accent }} />
        <div className="fuel-card__top">
          <div className="fuel-card__brand">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="rgba(255,255,255,0.18)" />
              <path d="M7 20V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3l2-2v8a2 2 0 0 1-2 2H8a1 1 0 0 1-1-1z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M10 10h3M10 13h3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="fuel-card__brand-name">{company.name} Fuel Card</span>
          </div>
          <span className="fuel-card__status-badge">Active</span>
        </div>
        <div className="fuel-card__number">{cardNumber}</div>
        <div className="fuel-card__bottom">
          <div className="fuel-card__field">
            <span className="fuel-card__field-label">Vehicle No.</span>
            <span className="fuel-card__field-value">{vehicleNumber || '—'}</span>
          </div>
          <div className="fuel-card__field">
            <span className="fuel-card__field-label">Vehicle Type</span>
            <span className="fuel-card__field-value">{vehicleType !== 'Select an option' ? vehicleType : '—'}</span>
          </div>
          <div className="fuel-card__field">
            <span className="fuel-card__field-label">Issued</span>
            <span className="fuel-card__field-value">{issued}</span>
          </div>
        </div>
      </div>

      <div className="wallet-card-details">
        <div className="wallet-card-detail-row">
          <span className="wallet-card-detail-label">Card Holder</span>
          <span className="wallet-card-detail-value">{vehicleMake || 'Partner'}</span>
        </div>
        <div className="wallet-card-detail-row">
          <span className="wallet-card-detail-label">Mobile</span>
          <span className="wallet-card-detail-value">{mobileNumber}</span>
        </div>
        <div className="wallet-card-detail-row">
          <span className="wallet-card-detail-label">Year of Registration</span>
          <span className="wallet-card-detail-value">{yearOfReg || '—'}</span>
        </div>
        <div className="wallet-card-detail-row">
          <span className="wallet-card-detail-label">Fuel Company</span>
          <span className="wallet-card-detail-value">{company.name}</span>
        </div>
        <div className="wallet-card-detail-row">
          <span className="wallet-card-detail-label">Status</span>
          <span className="wallet-card-detail-value wallet-card-detail-value--success">✓ Card Generated</span>
        </div>
      </div>

      <div className="wallet-action-row">
        <button className="wallet-btn-cancel" type="button" onClick={onReset}>Apply Another Card</button>
        <button className="wallet-btn-submit" type="button">Download Card Details</button>
      </div>
    </div>
  );
};

const VEHICLE_TYPES = ['Select an option', '2-Wheeler', '3-Wheeler', '4-Wheeler', 'Heavy Vehicle', 'Others'];

const DummyCard = ({ company }) => {
  const colors = COMPANY_COLORS[company?.id] || COMPANY_COLORS.iocl;
  return (
    <div className="fuel-card fuel-card--dummy" style={{ background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)` }}>
      <div className="fuel-card__circle fuel-card__circle--1" style={{ background: colors.accent }} />
      <div className="fuel-card__circle fuel-card__circle--2" style={{ background: colors.accent }} />
      <div className="fuel-card__top">
        <div className="fuel-card__brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="rgba(255,255,255,0.18)" />
            <path d="M7 20V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3l2-2v8a2 2 0 0 1-2 2H8a1 1 0 0 1-1-1z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M10 10h3M10 13h3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="fuel-card__brand-name">{company?.name || 'Fuel'} Card</span>
        </div>
        <span className="fuel-card__status-badge fuel-card__status-badge--pending">Not Issued</span>
      </div>
      <div className="fuel-card__number fuel-card__number--dummy">•••• •••• •••• ••••</div>
      <div className="fuel-card__bottom">
        <div className="fuel-card__field">
          <span className="fuel-card__field-label">Vehicle No.</span>
          <span className="fuel-card__field-value fuel-card__field-value--dummy">––––––</span>
        </div>
        <div className="fuel-card__field">
          <span className="fuel-card__field-label">Vehicle Type</span>
          <span className="fuel-card__field-value fuel-card__field-value--dummy">––––</span>
        </div>
        <div className="fuel-card__field">
          <span className="fuel-card__field-label">Issued</span>
          <span className="fuel-card__field-value fuel-card__field-value--dummy">––/––</span>
        </div>
      </div>
      <div className="fuel-card__dummy-overlay">
        <span className="fuel-card__dummy-label">Complete the form to generate your card</span>
      </div>
    </div>
  );
};

const WalletSection = ({ paymentStepCompleted, onPaymentStepComplete }) => {
  const [selectedCompany, setSelectedCompany] = useState('iocl');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleType, setVehicleType] = useState('Select an option');
  const [yearOfReg, setYearOfReg] = useState('');
  const [vehicleValidated, setVehicleValidated] = useState(false);
  const [mobileValidated, setMobileValidated] = useState(false);
  const [cardGenerated, setCardGenerated] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const selected = FUEL_COMPANIES.find(c => c.id === selectedCompany);
  const allValidated = vehicleValidated && mobileValidated;

  const getCompanyTileStyle = (companyId, isSelected) => {
    const colors = COMPANY_COLORS[companyId] || COMPANY_COLORS.iocl;
    return {
      background: colors.soft,
      borderColor: isSelected ? colors.accent : `${colors.accent}66`,
      boxShadow: isSelected ? `0 0 0 3px ${colors.accent}1a` : 'none',
    };
  };

  const handleReset = () => {
    setCardGenerated(false);
    setVehicleNumber('');
    setMobileNumber('');
    setVehicleMake('');
    setVehicleType('Select an option');
    setYearOfReg('');
    setVehicleValidated(false);
    setMobileValidated(false);
  };

  if (cardGenerated) {
    return (
      <div className="wallet-section-wrap">
        <WalletCard
          company={selected}
          vehicleNumber={vehicleNumber}
          mobileNumber={mobileNumber}
          vehicleMake={vehicleMake}
          vehicleType={vehicleType}
          yearOfReg={yearOfReg}
          onReset={handleReset}
        />
        {/* Show Next button only after card is generated and not already completed */}
        {!paymentStepCompleted && (
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <button
              className="wallet-btn-submit"
              type="button"
              onClick={() => {
                onPaymentStepComplete();
                setShowNext(false);
              }}
            >
              Next
            </button>
          </div>
        )}
        {/* If already completed, show green tick or message */}
        {paymentStepCompleted && (
          <div style={{ marginTop: 24, color: 'green', textAlign: 'right' }}>
            <span>&#10003; Payment Details Completed</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="wallet-section-wrap">
      {/* Fuel Company Selection */}
        {/* Dummy card preview */}
        <DummyCard company={selected} />

      <div className="wallet-company-grid">
        {FUEL_COMPANIES.map(company => (
          <button
            key={company.id}
            className={`wallet-company-card ${selectedCompany === company.id ? 'wallet-company-card--selected' : ''}`}
            onClick={() => setSelectedCompany(company.id)}
            type="button"
            style={getCompanyTileStyle(company.id, selectedCompany === company.id)}
          >
            <div className="wallet-company-header">
              <FuelIcon
                iconColor={(COMPANY_COLORS[company.id] || COMPANY_COLORS.iocl).text}
                bgColor="#ffffff"
              />
              <span
                className="wallet-company-name"
                style={{ color: (COMPANY_COLORS[company.id] || COMPANY_COLORS.iocl).text }}
              >
                {company.name}
              </span>
            </div>
          </button>
        ))}
      </div>
      {/* Application Form */}
      <div className="wallet-form-card">
        {/* Row 1: Vehicle Number + Mobile Number */}
        <div className="wallet-form-row">
          <div className="wallet-field-group">
            <label className="wallet-field-label">Vehicle Number</label>
            <div className="wallet-input-with-action">
              <input
                className="wallet-input"
                placeholder="e.g., MH12AB1234"
                value={vehicleNumber}
                onChange={e => { setVehicleNumber(e.target.value); setVehicleValidated(false); }}
              />
              <button
                className={`wallet-validate-btn ${vehicleValidated ? 'wallet-validate-btn--done' : ''}`}
                type="button"
                onClick={() => vehicleNumber && setVehicleValidated(true)}
                title="Validate"
              >
                <CheckIcon />
              </button>
            </div>
          </div>
          <div className="wallet-field-group">
            <label className="wallet-field-label">Mobile Number</label>
            <div className="wallet-input-with-action">
              <input
                className="wallet-input"
                placeholder="e.g., 9876543210"
                value={mobileNumber}
                onChange={e => { setMobileNumber(e.target.value); setMobileValidated(false); }}
              />
              <button
                className={`wallet-validate-btn ${mobileValidated ? 'wallet-validate-btn--done' : ''}`}
                type="button"
                onClick={() => mobileNumber && setMobileValidated(true)}
                title="Validate"
              >
                <CheckIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Vehicle Make + Vehicle Type */}
        <div className="wallet-form-row">
          <div className="wallet-field-group">
            <label className="wallet-field-label">Vehicle Make</label>
            <input
              className="wallet-input"
              placeholder="e.g., Ashok_Leyland, Tata, Mahindra"
              value={vehicleMake}
              onChange={e => setVehicleMake(e.target.value)}
            />
          </div>
          <div className="wallet-field-group">
            <label className="wallet-field-label">Vehicle Type</label>
            <div className="wallet-select-wrap">
              <select
                className="wallet-select"
                value={vehicleType}
                onChange={e => setVehicleType(e.target.value)}
              >
                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className="wallet-select-icon"><ChevronIcon /></span>
            </div>
          </div>
        </div>

        {/* Row 3: Year of Registration */}
        <div className="wallet-form-row wallet-form-row--half">
          <div className="wallet-field-group">
            <label className="wallet-field-label">Year of Registration</label>
            <input
              className="wallet-input"
              placeholder="e.g., 2020"
              value={yearOfReg}
              onChange={e => setYearOfReg(e.target.value)}
            />
          </div>
        </div>

        {/* Onboarding Alert */}
        {selected?.requiresOnboarding && (
          <div className="wallet-alert-box">
            <div className="wallet-alert-header">
              <TruckIcon />
              <span className="wallet-alert-title">{selected.name} Account Required</span>
            </div>
            <p className="wallet-alert-desc">
              You need to create a {selected.name} customer account before applying for a {selected.name} card.
            </p>
            <button className="wallet-alert-btn" type="button">Complete Onboarding</button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="wallet-action-row">
          <button className="wallet-btn-cancel" type="button">Cancel</button>
          <button
            className={`wallet-btn-submit ${!allValidated ? 'wallet-btn-submit--disabled' : ''}`}
            type="button"
            disabled={!allValidated}
            onClick={() => allValidated && setCardGenerated(true)}
          >
            {allValidated ? 'Apply for Fuel Card' : 'Complete Validations First'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletSection;
