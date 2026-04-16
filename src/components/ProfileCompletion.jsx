import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import useForm from '../hooks/useForm.js';
import { apiGetProfileDetails, buildOnboardingPayload } from '../utils/api.js';
import { STATE_DISTRICT_DATA } from '../constants/stateDistrictData.js';
import './ProfileCompletion.css';

const USER_ROLE_KEY = 'POTENS_admin_user_role';

const STATE_OPTIONS = STATE_DISTRICT_DATA.map((entry) => entry.state);

const DISTRICT_OPTIONS_BY_STATE = STATE_DISTRICT_DATA.reduce((accumulator, entry) => {
  accumulator[entry.state] = entry.districts;
  return accumulator;
}, {});

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_OPTIONS = [
  {
    value: 'upi',
    label: 'UPI',
    description: 'Send settlements directly to your UPI ID.',
  },
  {
    value: 'bank',
    label: 'Bank Transfer',
    description: 'Receive settlements in your bank account.',
  },
  {
    value: 'both',
    label: 'UPI + Bank',
    description: 'Keep both payout methods ready for backend review.',
  },
];

const ALLOWED_DOCUMENT_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
];
const ALLOWED_DOCUMENT_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];
const DOCUMENT_FILE_ACCEPT_VALUE = ALLOWED_DOCUMENT_FILE_EXTENSIONS.join(',');

const PROFILE_STEPS = [
  {
    id: 'professional',
    label: 'Professional Details',
    icon: '👤',
    subtitle: 'Capture the identity and onboarding information required by the API.',
    sections: [
      {
        title: 'Personal Details',
        description: 'Fill the applicant identity information exactly as per official records.',
        fields: [
          {
            name: 'fullName',
            label: 'Full Name',
            type: 'text',
            placeholder: 'Enter full name',
            required: true,
          },
          {
            name: 'fatherName',
            label: 'Father Name',
            type: 'text',
            placeholder: 'Enter father name',
            required: true,
          },
          {
            name: 'dob',
            label: 'Date of Birth',
            type: 'date',
            required: true,
          },
          {
            name: 'gender',
            label: 'Gender',
            type: 'select',
            options: GENDER_OPTIONS,
            required: true,
          },
          {
            name: 'state',
            label: 'State',
            type: 'select',
            options: STATE_OPTIONS.map((state) => ({ value: state, label: state })),
            required: true,
          },
          {
            name: 'district',
            label: 'District',
            type: 'select',
            options: [],
            optionsSource: 'state',
            required: true,
          },
          {
            name: 'fieldOfficerName',
            label: 'Field Officer Name',
            type: 'text',
            placeholder: 'Enter field officer name',
            required: true,
          },
          {
            name: 'pinCode',
            label: 'Pincode',
            type: 'text',
            placeholder: '243001',
            required: true,
          },
        ],
      },
      {
        title: 'Business Readiness',
        description: 'Share your fuel-sector background and investment intent.',
        fields: [
          {
            name: 'oilSectorExperienceYears',
            label: 'Oil Sector Experience (Years)',
            type: 'number',
            placeholder: '3',
            required: true,
          },
          {
            name: 'nearestFuelPumpDistance',
            label: 'Distance to Nearest Petrol Pump (km)',
            type: 'number',
            placeholder: '2.5',
            required: true,
          },
          {
            name: 'bowserCapacity',
            label: 'Bowser Capacity (Liters)',
            type: 'number',
            placeholder: '12000',
            required: true,
            visibleRoles: ['bowser'],
          },
          {
            name: 'areaInAcres',
            label: 'Area (Acres)',
            type: 'number',
            placeholder: '2.5',
            required: true,
            visibleRoles: ['mini-pump', 'minipump'],
          },
          {
            name: 'investmentPlan',
            label: 'Investment Plan',
            type: 'textarea',
            rows: 4,
            placeholder: 'Example: 5-10 lakh',
            required: true,
            fullWidth: true,
          },
        ],
      },
    ],
  },
  {
    id: 'address',
    label: 'Address & Vehicle',
    icon: '📍',
    subtitle: 'Collect structured permanent, business, and vehicle details.',
    sections: [
      {
        title: 'Permanent Address',
        description: 'Provide a full structured permanent address with coordinates.',
        fields: [
          {
            name: 'permanentAddressLine1',
            label: 'Address Line 1',
            type: 'text',
            placeholder: 'House 101',
            required: true,
          },
          {
            name: 'permanentAddressLine2',
            label: 'Address Line 2',
            type: 'text',
            placeholder: 'Civil Lines',
            required: true,
          },
          {
            name: 'permanentCity',
            label: 'City',
            type: 'text',
            placeholder: 'Bareilly',
            required: true,
          },
          {
            name: 'permanentState',
            label: 'State',
            type: 'select',
            options: STATE_OPTIONS.map((state) => ({ value: state, label: state })),
            required: true,
          },
          {
            name: 'permanentDistrict',
            label: 'District',
            type: 'select',
            options: [],
            optionsSource: 'permanentState',
            required: true,
          },
          {
            name: 'permanentPincode',
            label: 'Pincode',
            type: 'text',
            placeholder: '243001',
            required: true,
          },
          {
            name: 'permanentLatitude',
            label: 'Latitude',
            type: 'number',
            placeholder: '28.367',
            required: true,
          },
          {
            name: 'permanentLongitude',
            label: 'Longitude',
            type: 'number',
            placeholder: '79.4304',
            required: true,
          },
        ],
      },
      {
        title: 'Business Address',
        description: 'Provide the business location used for operations.',
        fields: [
          {
            name: 'businessAddressLine1',
            label: 'Address Line 1',
            type: 'text',
            placeholder: 'Shop 12',
            required: true,
          },
          {
            name: 'businessAddressLine2',
            label: 'Address Line 2',
            type: 'text',
            placeholder: 'Main Market',
            required: true,
          },
          {
            name: 'businessCity',
            label: 'City',
            type: 'text',
            placeholder: 'Bareilly',
            required: true,
          },
          {
            name: 'businessState',
            label: 'State',
            type: 'select',
            options: STATE_OPTIONS.map((state) => ({ value: state, label: state })),
            required: true,
          },
          {
            name: 'businessDistrict',
            label: 'District',
            type: 'select',
            options: [],
            optionsSource: 'businessState',
            required: true,
          },
          {
            name: 'businessPincode',
            label: 'Pincode',
            type: 'text',
            placeholder: '243001',
            required: true,
          },
          {
            name: 'businessLatitude',
            label: 'Latitude',
            type: 'number',
            placeholder: '28.37',
            required: true,
          },
          {
            name: 'businessLongitude',
            label: 'Longitude',
            type: 'number',
            placeholder: '79.42',
            required: true,
          },
        ],
      },
      {
        title: 'Vehicle Details',
        description: 'Add the vehicle number used for partner operations.',
        fields: [
          {
            name: 'vehicleNumber',
            label: 'Vehicle Number',
            type: 'text',
            placeholder: 'UP25AB1234',
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: 'documents',
    label: 'Document Details',
    icon: '📄',
    subtitle: 'Upload the required documents; the app converts them to URL strings for the API.',
    sections: [
      {
        title: 'Identity Documents',
        description: 'Upload the document files and share their reference numbers for onboarding review.',
        fields: [
          {
            name: 'panNumber',
            label: 'PAN Number',
            type: 'text',
            placeholder: 'ABCDE1234F',
            required: true,
          },
          {
            name: 'panFile',
            label: 'PAN Card Image',
            type: 'file',
            accept: DOCUMENT_FILE_ACCEPT_VALUE,
            required: true,
          },
          {
            name: 'aadhaarNumber',
            label: 'Aadhaar Number',
            type: 'text',
            placeholder: '123412341234',
            required: true,
          },
          {
            name: 'aadhaarFile',
            label: 'Aadhaar Card Image',
            type: 'file',
            accept: DOCUMENT_FILE_ACCEPT_VALUE,
            required: true,
          },
          {
            name: 'drivingLicenseNumber',
            label: 'Driving License Number',
            type: 'text',
            placeholder: 'UP-2020-1234567',
            required: true,
          },
          {
            name: 'drivingLicenseFile',
            label: 'Driving License Image',
            type: 'file',
            accept: DOCUMENT_FILE_ACCEPT_VALUE,
            required: true,
          },
          {
            name: 'vehicleRcNumber',
            label: 'Vehicle RC Number',
            type: 'text',
            placeholder: 'RC123456',
            required: true,
          },
          {
            name: 'vehicleRcFile',
            label: 'Vehicle RC Image',
            type: 'file',
            accept: DOCUMENT_FILE_ACCEPT_VALUE,
            required: true,
          },
        ],
      },
      {
        title: 'Supporting Files',
        description: 'Add the remaining hosted file URLs shared with the backend.',
        fields: [
          {
            name: 'passportPhotoFile',
            label: 'Passport Size Photo',
            type: 'file',
            accept: DOCUMENT_FILE_ACCEPT_VALUE,
            required: true,
          },
          {
            name: 'nocFile',
            label: 'NOC Document',
            type: 'file',
            accept: DOCUMENT_FILE_ACCEPT_VALUE,
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: 'payment',
    label: 'Payment Details',
    icon: '💳',
    subtitle: 'Match the settlement details expected by the backend contract.',
    sections: [
      {
        title: 'Settlement Preference',
        description: 'Choose the supported payout mode and fill the required account details.',
        fields: [
          {
            name: 'paymentMode',
            label: 'Payment Mode',
            type: 'radio',
            options: PAYMENT_OPTIONS,
            required: true,
            fullWidth: true,
          },
          {
            name: 'upiId',
            label: 'UPI ID',
            type: 'text',
            placeholder: 'ashu@upi',
            required: true,
            fullWidth: true,
            paymentModes: ['upi', 'both'],
          },
          {
            name: 'bankAccountNumber',
            label: 'Account Number',
            type: 'text',
            placeholder: '123456789012',
            required: true,
            paymentModes: ['bank', 'both'],
          },
          {
            name: 'ifscCode',
            label: 'IFSC Code',
            type: 'text',
            placeholder: 'SBIN0001234',
            required: true,
            paymentModes: ['bank', 'both'],
          },
          {
            name: 'bankName',
            label: 'Bank Name',
            type: 'text',
            placeholder: 'State Bank of India',
            required: true,
            paymentModes: ['bank', 'both'],
          },
          {
            name: 'bankBranch',
            label: 'Branch Name',
            type: 'text',
            placeholder: 'Bareilly Main',
            required: true,
            paymentModes: ['bank', 'both'],
          },
          {
            name: 'accountHolderName',
            label: 'Account Holder Name',
            type: 'text',
            placeholder: 'Ashutosh Gangwar',
            required: true,
            paymentModes: ['bank', 'both'],
          },
          {
            name: 'paymentOtherDetails',
            label: 'Other Details',
            type: 'textarea',
            rows: 4,
            placeholder: 'Preferred settlement weekly',
            required: false,
            fullWidth: true,
            paymentModes: ['upi', 'bank', 'both'],
          },
        ],
      },
    ],
  },
  {
    id: 'review',
    label: 'Review & Submit',
    icon: '✅',
    subtitle: 'Review all details before submitting them to the crew profile API.',
  },
];

const EDITABLE_STEPS = PROFILE_STEPS.filter((step) => step.sections);

const PROFILE_FIELDS = EDITABLE_STEPS.flatMap((step) =>
  step.sections.flatMap((section) => section.fields)
);

const FIELD_MAP = PROFILE_FIELDS.reduce((accumulator, field) => {
  accumulator[field.name] = field;
  return accumulator;
}, {});

const STEP_FIELD_NAMES = EDITABLE_STEPS.reduce((accumulator, step) => {
  accumulator[step.id] = step.sections.flatMap((section) =>
    section.fields.map((field) => field.name)
  );
  return accumulator;
}, {});

const INITIAL_VALUES = PROFILE_FIELDS.reduce((accumulator, field) => {
  accumulator[field.name] = '';
  return accumulator;
}, {});

const DISTRICT_SOURCE_BY_FIELD = {
  district: 'state',
  permanentDistrict: 'permanentState',
  businessDistrict: 'businessState',
};

const DISTRICT_FIELD_BY_STATE = {
  state: 'district',
  permanentState: 'permanentDistrict',
  businessState: 'businessDistrict',
};

const PAYMENT_LABELS = {
  upi: 'UPI',
  bank: 'Bank Transfer',
  both: 'UPI + Bank',
};

const URL_PATTERN = /^https?:\/\/.+/i;

const isStoredFileReference = (value) => {
  if (!value) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return typeof value === 'object' && typeof value.name === 'string' && value.name.trim().length > 0;
};

const getStoredFileLabel = (value) => {
  if (value instanceof File) {
    return value.name;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && typeof value?.name === 'string') {
    return value.name;
  }

  return '';
};

const hasAllowedDocumentExtension = (fileName) => {
  const normalizedName = `${fileName || ''}`.toLowerCase();
  return ALLOWED_DOCUMENT_FILE_EXTENSIONS.some((extension) => normalizedName.endsWith(extension));
};

const isAllowedDocumentFile = (file) => {
  if (!(file instanceof File)) {
    return false;
  }

  const mimeType = `${file.type || ''}`.toLowerCase();
  return ALLOWED_DOCUMENT_FILE_TYPES.includes(mimeType) || hasAllowedDocumentExtension(file.name);
};

const hasValidStoredDocumentFile = (value) => {
  if (value instanceof File) {
    return isAllowedDocumentFile(value);
  }

  if (!isStoredFileReference(value)) {
    return false;
  }

  return hasAllowedDocumentExtension(getStoredFileLabel(value));
};

const normalizeValue = (value) => `${value ?? ''}`.trim();

const normalizeRoleForComparison = (roleValue = '') =>
  `${roleValue}`
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');

const roleMatchesTag = (currentRole, roleTag) => {
  const normalizedRole = normalizeRoleForComparison(currentRole);
  const normalizedTag = normalizeRoleForComparison(roleTag);

  if (!normalizedRole || !normalizedTag) {
    return false;
  }

  return normalizedRole.includes(normalizedTag) || normalizedTag.includes(normalizedRole);
};

const shouldRenderField = (field, values, currentRole = '') => {
  if (!field.paymentModes) {
    if (!field.visibleRoles?.length) {
      return true;
    }

    return field.visibleRoles.some((roleTag) => roleMatchesTag(currentRole, roleTag));
  }

  const matchesPaymentMode = field.paymentModes.includes(values.paymentMode);

  if (!matchesPaymentMode) {
    return false;
  }

  if (!field.visibleRoles?.length) {
    return true;
  }

  return field.visibleRoles.some((roleTag) => roleMatchesTag(currentRole, roleTag));
};

const getDistrictOptions = (selectedState) =>
  (DISTRICT_OPTIONS_BY_STATE[selectedState] || []).map((district) => ({
    value: district,
    label: district,
  }));

const isValidCoordinate = (value, min, max) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= min && numericValue <= max;
};

const validateProfileField = (field, value, allValues = {}, currentRole = '') => {
  if (!shouldRenderField(field, allValues, currentRole)) {
    return '';
  }

  const trimmedValue = normalizeValue(value);

  if (field.required && !trimmedValue) {
    return `${field.label} is required.`;
  }

  if (!trimmedValue) {
    return '';
  }

  switch (field.name) {
    case 'dob': {
      const selectedDate = new Date(trimmedValue);
      const today = new Date();
      if (Number.isNaN(selectedDate.getTime())) {
        return 'Enter a valid date of birth.';
      }
      if (selectedDate > today) {
        return 'Date of birth cannot be in the future.';
      }
      return '';
    }
    case 'pinCode':
    case 'permanentPincode':
    case 'businessPincode':
      return /^\d{6}$/.test(trimmedValue) ? '' : 'Pincode must be exactly 6 digits.';
    case 'vehicleNumber':
      return /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/i.test(trimmedValue.replace(/\s+/g, ''))
        ? ''
        : 'Enter a valid vehicle number.';
    case 'oilSectorExperienceYears':
      return Number(trimmedValue) >= 0 ? '' : 'Experience years must be 0 or more.';
    case 'nearestFuelPumpDistance':
      return Number(trimmedValue) >= 0 ? '' : 'Distance must be 0 or more.';
    case 'bowserCapacity':
      return Number(trimmedValue) > 0 ? '' : 'Bowser capacity must be greater than 0.';
    case 'areaInAcres':
      return Number(trimmedValue) > 0 ? '' : 'Area in acres must be greater than 0.';
    case 'state':
    case 'permanentState':
    case 'businessState':
      return DISTRICT_OPTIONS_BY_STATE[trimmedValue] ? '' : 'Select a valid state.';
    case 'district':
    case 'permanentDistrict':
    case 'businessDistrict': {
      const parentStateField = DISTRICT_SOURCE_BY_FIELD[field.name];
      const parentState = allValues[parentStateField];
      const stateDistricts = DISTRICT_OPTIONS_BY_STATE[parentState] || [];
      if (!parentState) {
        return 'Please select a state first.';
      }
      return stateDistricts.includes(trimmedValue)
        ? ''
        : 'Select a district from the selected state.';
    }
    case 'investmentPlan':
      return trimmedValue.length >= 3 ? '' : 'Investment plan is required.';
    case 'upiId':
      return /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(trimmedValue)
        ? ''
        : 'Enter a valid UPI ID.';
    case 'bankAccountNumber':
      return /^\d{9,18}$/.test(trimmedValue)
        ? ''
        : 'Account number must be 9 to 18 digits.';
    case 'ifscCode':
      return /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(trimmedValue)
        ? ''
        : 'Enter a valid IFSC code.';
    case 'bankName':
    case 'bankBranch':
    case 'accountHolderName':
    case 'fieldOfficerName':
    case 'fullName':
    case 'fatherName':
    case 'permanentAddressLine1':
    case 'permanentAddressLine2':
    case 'permanentCity':
    case 'businessAddressLine1':
    case 'businessAddressLine2':
    case 'businessCity':
      return trimmedValue.length >= 2 ? '' : `${field.label} must be at least 2 characters.`;
    case 'permanentLatitude':
    case 'businessLatitude':
      return isValidCoordinate(trimmedValue, -90, 90)
        ? ''
        : 'Latitude must be between -90 and 90.';
    case 'permanentLongitude':
    case 'businessLongitude':
      return isValidCoordinate(trimmedValue, -180, 180)
        ? ''
        : 'Longitude must be between -180 and 180.';
    case 'panNumber':
      return /^[A-Z]{5}\d{4}[A-Z]$/i.test(trimmedValue)
        ? ''
        : 'Enter a valid PAN number.';
    case 'aadhaarNumber':
      return /^\d{12}$/.test(trimmedValue)
        ? ''
        : 'Aadhaar number must be exactly 12 digits.';
    case 'drivingLicenseNumber':
      return trimmedValue.length >= 8 ? '' : 'Enter a valid driving license number.';
    case 'vehicleRcNumber':
      return trimmedValue.length >= 4 ? '' : 'Enter a valid vehicle RC number.';
    case 'panFile':
    case 'aadhaarFile':
    case 'drivingLicenseFile':
    case 'vehicleRcFile':
    case 'passportPhotoFile':
    case 'nocFile':
      if (!value) {
        return `${field.label} is required.`;
      }

      return hasValidStoredDocumentFile(value)
        ? ''
        : `${field.label} must be a JPG, JPEG, PNG, or PDF file.`;
    default:
      return '';
  }
};

const getOptionLabel = (field, value) => {
  const match = field.options?.find((option) => option.value === value);
  return match?.label || value;
};

const getDisplayValue = (field, value) => {
  if (!value) {
    return '—';
  }

  if (field.type === 'file') {
    return getStoredFileLabel(value) || '—';
  }

  if (field.type === 'select' || field.type === 'radio') {
    return getOptionLabel(field, value);
  }

  if (field.name === 'paymentMode') {
    return PAYMENT_LABELS[value] || value;
  }

  return value;
};

const getCompletedStepIndexes = (values, currentRole = '') =>
  EDITABLE_STEPS.reduce((completed, step, index) => {
    const isComplete = STEP_FIELD_NAMES[step.id].every((fieldName) => {
      const field = FIELD_MAP[fieldName];
      return !validateProfileField(field, values[fieldName], values, currentRole);
    });

    if (isComplete) {
      completed.push(index);
    }

    return completed;
  }, []);

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8l3.5 3.5L13 4.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StepIndicator({ currentStep, completedSteps }) {
  return (
    <div className="profile-completion__stepper" aria-label="Profile completion steps">
      {PROFILE_STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(index);
        const isActive = index === currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="profile-completion__step-item">
              <div
                className={[
                  'profile-completion__step-circle',
                  isCompleted ? 'is-completed' : '',
                  isActive ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {isCompleted ? <CheckIcon /> : <span>{step.icon}</span>}
              </div>
              <span
                className={[
                  'profile-completion__step-label',
                  isCompleted ? 'is-completed' : '',
                  isActive ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {step.label}
              </span>
            </div>
            {index < PROFILE_STEPS.length - 1 && (
              <div
                className={[
                  'profile-completion__step-line',
                  isCompleted ? 'is-completed' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Alert({ type, message, onClose }) {
  return (
    <div
      className={[
        'profile-completion__alert',
        type === 'error' ? 'is-error' : 'is-success',
      ]
        .filter(Boolean)
        .join(' ')}
      role="alert"
    >
      <span>
        {type === 'error' ? '⚠️' : '✅'} {message}
      </span>
      <button type="button" className="profile-completion__alert-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

function FieldGroup({ field, error, children }) {
  return (
    <div
      className={[
        'profile-completion__field',
        field.fullWidth ? 'profile-completion__field--full' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <label className="profile-completion__label" htmlFor={field.name}>
        {field.label}
        {field.required ? <span className="profile-completion__required"> *</span> : null}
      </label>
      {children}
      {error ? <p className="profile-completion__error">{error}</p> : null}
    </div>
  );
}

function FormField({ field, value, error, onChange, onBlur }) {
  const baseClassName = ['profile-completion__control', error ? 'has-error' : '']
    .filter(Boolean)
    .join(' ');
  const storedFileLabel = field.type === 'file' ? getStoredFileLabel(value) : '';

  if (field.type === 'textarea') {
    return (
      <textarea
        id={field.name}
        name={field.name}
        rows={field.rows || 4}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={field.placeholder}
        className={`${baseClassName} profile-completion__textarea`}
        disabled={field.disabled}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <select
        id={field.name}
        name={field.name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={baseClassName}
        disabled={field.disabled}
      >
        <option value="">Select {field.label}</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'radio') {
    return (
      <div className="profile-completion__radio-grid" role="radiogroup" aria-label={field.label}>
        {field.options.map((option) => (
          <label
            key={option.value}
            className={[
              'profile-completion__radio-card',
              value === option.value ? 'is-selected' : '',
              error ? 'has-error' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <input
              type="radio"
              id={`${field.name}-${option.value}`}
              name={field.name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              onBlur={onBlur}
            />
            <span className="profile-completion__radio-title">{option.label}</span>
            <span className="profile-completion__radio-text">{option.description}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === 'file') {
    return (
      <>
        <input
          id={field.name}
          name={field.name}
          type="file"
          onChange={onChange}
          onBlur={onBlur}
          className={baseClassName}
          disabled={field.disabled}
          accept={field.accept}
        />
        {storedFileLabel ? (
          <p className="profile-completion__file-status">Saved file: {storedFileLabel}</p>
        ) : null}
      </>
    );
  }

  return (
    <input
      id={field.name}
      name={field.name}
      type={field.type || 'text'}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={field.placeholder}
      className={baseClassName}
      disabled={field.disabled}
      step={field.type === 'number' ? 'any' : undefined}
    />
  );
}

function ReviewSection({ step, values, onEdit, currentRole }) {
  return (
    <section className="profile-completion__review-card">
      <div className="profile-completion__review-head">
        <div className="profile-completion__review-head-main">
          <span className="profile-completion__review-icon">{step.icon}</span>
          <div>
            <h3>{step.label}</h3>
            <p>{step.subtitle}</p>
          </div>
        </div>
        <button type="button" className="profile-completion__edit-btn" onClick={onEdit}>
          Edit
        </button>
      </div>

      {step.sections.map((section) => (
        <div key={section.title} className="profile-completion__review-section">
          <h4>{section.title}</h4>
          {section.fields.filter((field) => shouldRenderField(field, values, currentRole)).map((field) => (
            <div key={field.name} className="profile-completion__review-row">
              <span>{field.label}</span>
              <strong>{getDisplayValue(field, values[field.name])}</strong>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { user, onboard } = useAuth();
  const currentUserRole = useMemo(() => {
    const directUserRole = user?.role;
    if (directUserRole) {
      return directUserRole;
    }

    return localStorage.getItem(USER_ROLE_KEY) || '';
  }, [user?.role]);

  const validationRules = useMemo(
    () =>
      PROFILE_FIELDS.reduce((accumulator, field) => {
        accumulator[field.name] = (value, allValues) =>
          validateProfileField(field, value, allValues, currentUserRole);
        return accumulator;
      }, {}),
    [currentUserRole]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    validateAll,
    setValues,
    setErrors,
    setTouched,
  } = useForm(INITIAL_VALUES, validationRules);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const existingProfile = await apiGetProfileDetails(user?.id);
        if (!isMounted) {
          return;
        }

        const mergedValues = {
          ...INITIAL_VALUES,
          fullName: user?.name || '',
          ...existingProfile,
        };

        const completed = getCompletedStepIndexes(mergedValues, currentUserRole);
        const firstIncompleteStep = EDITABLE_STEPS.findIndex(
          (_, index) => !completed.includes(index)
        );

        setValues(mergedValues);
        setCompletedSteps(completed);
        setCurrentStep(firstIncompleteStep === -1 ? PROFILE_STEPS.length - 1 : firstIncompleteStep);
      } catch (error) {
        if (isMounted) {
          setApiError(error.message || 'Could not load profile details.');
        }
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [currentUserRole, setValues, user?.id, user?.name]);

  const progressCount = completedSteps.filter((stepIndex) => stepIndex < EDITABLE_STEPS.length).length;
  const progressPercent = Math.round((progressCount / EDITABLE_STEPS.length) * 100);
  const activeStep = PROFILE_STEPS[currentStep];
  const currentFieldNames = STEP_FIELD_NAMES[activeStep.id] || [];
  const isReviewStep = activeStep.id === 'review';

  const validateCurrentStep = () => {
    if (!currentFieldNames.length) {
      return true;
    }

    const nextErrors = {};
    const nextTouched = {};
    let isValid = true;

    currentFieldNames.forEach((fieldName) => {
      const fieldError = validationRules[fieldName](values[fieldName], values);
      nextTouched[fieldName] = true;
      nextErrors[fieldName] = fieldError;
      if (fieldError) {
        isValid = false;
      }
    });

    setTouched((previous) => ({ ...previous, ...nextTouched }));
    setErrors((previous) => ({ ...previous, ...nextErrors }));

    return isValid;
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    const dependentDistrictField = DISTRICT_FIELD_BY_STATE[name];

    if (!dependentDistrictField) {
      handleChange(event);
      return;
    }

    const availableDistricts = DISTRICT_OPTIONS_BY_STATE[value] || [];

    setValues((previousValues) => {
      const districtStillValid = availableDistricts.includes(previousValues[dependentDistrictField]);
      return {
        ...previousValues,
        [name]: value,
        [dependentDistrictField]: districtStillValid ? previousValues[dependentDistrictField] : '',
      };
    });

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: '',
      [dependentDistrictField]: '',
    }));
  };

  const goToStep = (stepIndex) => {
    setApiError('');
    setSuccessMessage('');
    setCurrentStep(stepIndex);
  };

  const goNext = () => {
    setApiError('');
    setSuccessMessage('');

    if (!validateCurrentStep()) {
      return;
    }

    const recalculated = getCompletedStepIndexes(values, currentUserRole);
    setCompletedSteps(recalculated);
    setCurrentStep((previous) => Math.min(previous + 1, PROFILE_STEPS.length - 1));
  };

  const goBack = () => {
    setApiError('');
    setSuccessMessage('');
    setCurrentStep((previous) => Math.max(previous - 1, 0));
  };

  const handleSubmit = async () => {
    setApiError('');
    setSuccessMessage('');

    if (!validateAll()) {
      return;
    }

    setLoading(true);

    try {
      const payload = await buildOnboardingPayload(values, currentUserRole);
      await onboard({ payload });
      setCompletedSteps(getCompletedStepIndexes(values, currentUserRole));
      setSuccessMessage('Onboarding completed successfully. Redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setApiError(error.message || 'Could not complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="profile-completion profile-completion--loading">
        <div className="profile-completion__loader">
          <div className="profile-completion__spinner" />
          <p>Loading your profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-completion">
      <div className="profile-completion__shell">
        <header className="profile-completion__header">
          <div>
            <span className="profile-completion__eyebrow">Crew onboarding</span>
            <h1>Complete Your Profile</h1>
            <p>
              Submit professional, address, vehicle, payment, and document details in the exact
              structure expected by the crew profile API.
            </p>
          </div>

          <button
            type="button"
            className="profile-completion__ghost-btn"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
        </header>

        <section className="profile-completion__summary-grid">
          <article className="profile-completion__summary-card">
            <span className="profile-completion__summary-label">Progress</span>
            <strong>{progressPercent}% complete</strong>
            <p>
              {progressCount} of {EDITABLE_STEPS.length} sections are ready for final submission.
            </p>
          </article>
          <article className="profile-completion__summary-card">
            <span className="profile-completion__summary-label">Current step</span>
            <strong>
              {currentStep + 1} / {PROFILE_STEPS.length}
            </strong>
            <p>{activeStep.label}</p>
          </article>
        </section>

        <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

        <section className="profile-completion__card">
          <div className="profile-completion__card-head">
            <div className="profile-completion__step-badge">{activeStep.icon}</div>
            <div>
              <h2>{activeStep.label}</h2>
              <p>{activeStep.subtitle}</p>
            </div>
          </div>

          {apiError ? (
            <Alert type="error" message={apiError} onClose={() => setApiError('')} />
          ) : null}
          {successMessage ? (
            <Alert
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage('')}
            />
          ) : null}

          {!isReviewStep ? (
            activeStep.sections.map((section) => (
              <section key={section.title} className="profile-completion__section-card">
                <div className="profile-completion__section-head">
                  <h3>{section.title}</h3>
                  <p>{section.description}</p>
                </div>

                <div className="profile-completion__grid">
                  {section.fields.filter((field) => shouldRenderField(field, values, currentUserRole)).map((field) => {
                    const districtOptions = field.optionsSource
                      ? getDistrictOptions(values[field.optionsSource])
                      : null;
                    const fieldConfig = field.optionsSource
                      ? {
                          ...field,
                          options: districtOptions,
                          disabled: !values[field.optionsSource],
                          label: values[field.optionsSource]
                            ? field.label
                            : `${field.label} (Select state first)`,
                        }
                      : field;

                    return (
                      <FieldGroup key={field.name} field={fieldConfig} error={errors[field.name]}>
                        <FormField
                          field={fieldConfig}
                          value={values[field.name]}
                          error={errors[field.name]}
                          onChange={handleFieldChange}
                          onBlur={handleBlur}
                        />
                      </FieldGroup>
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <div className="profile-completion__review-grid">
              {EDITABLE_STEPS.map((step, index) => (
                <ReviewSection
                  key={step.id}
                  step={step}
                  values={values}
                  currentRole={currentUserRole}
                  onEdit={() => goToStep(index)}
                />
              ))}
            </div>
          )}

          <div className="profile-completion__footer">
            <button
              type="button"
              className="profile-completion__secondary-btn"
              onClick={currentStep > 0 ? goBack : () => navigate('/dashboard')}
            >
              {currentStep > 0 ? '← Back' : 'Cancel'}
            </button>

            <div className="profile-completion__footer-actions">
              {isReviewStep ? (
                <button
                  type="button"
                  className="profile-completion__primary-btn"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Submit Profile ✓'}
                </button>
              ) : (
                <button
                  type="button"
                  className="profile-completion__primary-btn"
                  onClick={goNext}
                >
                  Next Step →
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfileCompletion;
