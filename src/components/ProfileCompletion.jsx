import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import useForm from '../hooks/useForm.js';
import {
  apiGetProfileDetails,
  apiSaveProfileDetails,
} from '../utils/api.js';
import { STATE_DISTRICT_DATA } from '../constants/stateDistrictData.js';
import './ProfileCompletion.css';

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

const EXPERIENCE_OPTIONS = [
  { value: 'fresher', label: 'Fresher' },
  { value: '1-3-years', label: '1-3 years' },
  { value: '3-5-years', label: '3-5 years' },
  { value: '5-plus-years', label: '5+ years' },
];

const PAYMENT_OPTIONS = [
  {
    value: 'upi',
    label: 'UPI',
    description: 'Collect payouts directly to a UPI ID.',
  },
  {
    value: 'bank-transfer',
    label: 'Bank Transfer',
    description: 'Receive payments in your bank account.',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Any alternate settlement preference.',
  },
];

const PROFILE_STEPS = [
  {
    id: 'basic',
    label: 'Basic Information',
    icon: '👤',
    subtitle: 'Capture personal and field officer details.',
    sections: [
      {
        title: 'Personal Details',
        description: 'Fill the applicant identity information exactly as per records.',
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
            name: 'gender',
            label: 'Gender',
            type: 'select',
            options: GENDER_OPTIONS,
            required: true,
          },
          {
            name: 'phone',
            label: 'Phone Number',
            type: 'tel',
            placeholder: '+91 98765 43210',
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
            label: 'Related District',
            type: 'select',
            options: [],
            required: true,
          },
          {
            name: 'fieldOfficerName',
            label: 'Field Officer Name',
            type: 'text',
            placeholder: 'Enter field officer name',
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: 'address_logistics',
    label: 'Address & Logistics',
    icon: '📍',
    subtitle: 'Capture address and vehicle details for field operations.',
    sections: [
      {
        title: 'Address Information',
        description: 'Use complete and serviceable addresses for permanent and business locations.',
        fields: [
          {
            name: 'permanentAddress',
            label: 'Permanent Address',
            type: 'textarea',
            rows: 4,
            placeholder: 'Enter permanent address',
            required: true,
            fullWidth: true,
          },
          {
            name: 'businessAddress',
            label: 'Business Address',
            type: 'textarea',
            rows: 4,
            placeholder: 'Enter business address',
            required: true,
            fullWidth: true,
          },
          {
            name: 'vehicleNumber',
            label: 'Vehicle Number',
            type: 'text',
            placeholder: 'UP32 AB 1234',
            required: true,
          },
          {
            name: 'pinCode',
            label: 'Pin Code',
            type: 'text',
            placeholder: '226001',
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: 'investment',
    label: 'Investment Profile',
    icon: '💰',
    subtitle: 'Add your industry experience and intended investment plan.',
    sections: [
      {
        title: 'Business Readiness',
        description: 'These answers help evaluate viability and planning readiness.',
        fields: [
          {
            name: 'oilSectorExperience',
            label: 'Oil Sector Experience',
            type: 'select',
            options: EXPERIENCE_OPTIONS,
            required: true,
          },
          {
            name: 'nearestFuelPumpDistance',
            label: 'Nearest Fuel Pump Distance (km)',
            type: 'number',
            placeholder: 'Enter distance in km',
            required: true,
          },
          {
            name: 'investmentPlan',
            label: 'Investment Plan',
            type: 'textarea',
            rows: 5,
            placeholder: 'Describe your investment plan, budget, and rollout approach',
            required: true,
            fullWidth: true,
          },
        ],
      },
    ],
  },
  {
    id: 'payment',
    label: 'Payment Preference',
    icon: '💳',
    subtitle: 'Choose how settlements or payouts should be handled.',
    sections: [
      {
        title: 'Preferred Payment Method',
        description: 'Pick the settlement route that works best for you.',
        fields: [
          {
            name: 'paymentPreference',
            label: 'Payment Preference',
            type: 'radio',
            options: PAYMENT_OPTIONS,
            required: true,
            fullWidth: true,
          },
          {
            name: 'upiId',
            label: 'UPI ID',
            type: 'text',
            placeholder: 'example@upi',
            required: true,
            fullWidth: true,
            paymentModes: ['upi'],
          },
          {
            name: 'bankAccountNumber',
            label: 'Bank Account Number',
            type: 'text',
            placeholder: 'Enter account number',
            required: true,
            paymentModes: ['bank-transfer'],
          },
          {
            name: 'ifscCode',
            label: 'IFSC Code',
            type: 'text',
            placeholder: 'SBIN0001234',
            required: true,
            paymentModes: ['bank-transfer'],
          },
          {
            name: 'accountHolderName',
            label: 'Account Holder Name',
            type: 'text',
            placeholder: 'Enter account holder name',
            required: true,
            paymentModes: ['bank-transfer'],
          },
          {
            name: 'bankBranch',
            label: 'Branch',
            type: 'text',
            placeholder: 'Enter bank branch',
            required: true,
            paymentModes: ['bank-transfer'],
          },
          {
            name: 'bankOtherDetails',
            label: 'Bank Details Notes',
            type: 'textarea',
            rows: 4,
            placeholder: 'Add any extra bank transfer details',
            required: false,
            fullWidth: true,
            paymentModes: ['bank-transfer'],
          },
          {
            name: 'otherPaymentDetails',
            label: 'Other Payment Details',
            type: 'textarea',
            rows: 4,
            placeholder: 'Describe the alternate payment method and details',
            required: true,
            fullWidth: true,
            paymentModes: ['other'],
          },
        ],
      },
    ],
  },
  {
    id: 'document',
    label: 'Document Upload',
    icon: '📄',
    subtitle: 'Upload the required ID, vehicle, and compliance documents.',
    sections: [
      {
        title: 'Mandatory Documents',
        description: 'Upload clear files in PDF, JPG, JPEG, or PNG format.',
        fields: [
          {
            name: 'panCard',
            label: 'PAN Card',
            type: 'file',
            required: true,
            accept: '.pdf,.png,.jpg,.jpeg',
          },
          {
            name: 'aadhaarCard',
            label: 'Aadhaar Card',
            type: 'file',
            required: true,
            accept: '.pdf,.png,.jpg,.jpeg',
          },
          {
            name: 'vehicleRc',
            label: 'Vehicle RC',
            type: 'file',
            required: true,
            accept: '.pdf,.png,.jpg,.jpeg',
          },
          {
            name: 'vehicleInsurance',
            label: 'Vehicle Insurance',
            type: 'file',
            required: true,
            accept: '.pdf,.png,.jpg,.jpeg',
          },
          {
            name: 'passportPhoto',
            label: 'Passport Photo',
            type: 'file',
            required: true,
            accept: '.png,.jpg,.jpeg',
          },
          {
            name: 'noc',
            label: 'NOC',
            type: 'file',
            required: true,
            accept: '.pdf,.png,.jpg,.jpeg',
          },
        ],
      },
    ],
  },
  {
    id: 'review',
    label: 'Review & Submit',
    icon: '✅',
    subtitle: 'Review all previously submitted details before final save.',
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

const normalizeValue = (value) => `${value ?? ''}`.trim();

const shouldRenderField = (field, values) => {
  if (!field.paymentModes) {
    return true;
  }

  return field.paymentModes.includes(values.paymentPreference);
};

const getDistrictOptions = (selectedState) =>
  (DISTRICT_OPTIONS_BY_STATE[selectedState] || []).map((district) => ({
    value: district,
    label: district,
  }));

const validateProfileField = (field, value, allValues = {}) => {
  if (!shouldRenderField(field, allValues)) {
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
    case 'phone':
      return /^[0-9+\-()\s]{10,15}$/.test(trimmedValue)
        ? ''
        : 'Enter a valid phone number (10–15 characters).';
    case 'pinCode':
      return /^\d{6}$/.test(trimmedValue)
        ? ''
        : 'Pin code must be exactly 6 digits.';
    case 'vehicleNumber':
      return /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{4}$/i.test(trimmedValue)
        ? ''
        : 'Enter a valid vehicle number.';
    case 'nearestFuelPumpDistance': {
      const distance = Number(trimmedValue);
      if (Number.isNaN(distance) || distance < 0) {
        return 'Enter a valid distance in kilometers.';
      }
      return '';
    }
    case 'state':
      return DISTRICT_OPTIONS_BY_STATE[trimmedValue]
        ? ''
        : 'Select a valid state.';
    case 'district': {
      const stateDistricts = DISTRICT_OPTIONS_BY_STATE[allValues.state] || [];
      if (!allValues.state) {
        return 'Please select a state first.';
      }
      return stateDistricts.includes(trimmedValue)
        ? ''
        : 'Select a district from the selected state.';
    }
    case 'investmentPlan':
      return trimmedValue.length >= 20
        ? ''
        : 'Investment plan should be at least 20 characters.';
    case 'upiId':
      return /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(trimmedValue)
        ? ''
        : 'Enter a valid UPI ID.';
    case 'bankAccountNumber':
      return /^\d{9,18}$/.test(trimmedValue)
        ? ''
        : 'Bank account number must be 9 to 18 digits.';
    case 'ifscCode':
      return /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(trimmedValue)
        ? ''
        : 'Enter a valid IFSC code.';
    case 'accountHolderName':
      return trimmedValue.length >= 2
        ? ''
        : 'Account holder name must be at least 2 characters.';
    case 'bankBranch':
      return trimmedValue.length >= 2 ? '' : 'Branch name is required.';
    case 'otherPaymentDetails':
      return trimmedValue.length >= 8
        ? ''
        : 'Please provide additional details for the selected payment method.';
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

  if (field.type === 'select' || field.type === 'radio') {
    return getOptionLabel(field, value);
  }

  return value;
};

const getCompletedStepIndexes = (values) =>
  EDITABLE_STEPS.reduce((completed, step, index) => {
    const isComplete = STEP_FIELD_NAMES[step.id].every((fieldName) => {
      const field = FIELD_MAP[fieldName];
      return !validateProfileField(field, values[fieldName], values);
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
      <span>{type === 'error' ? '⚠️' : '✅'} {message}</span>
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

function FormField({ field, value, error, onChange, onBlur, onFileChange }) {
  const baseClassName = [
    'profile-completion__control',
    error ? 'has-error' : '',
  ]
    .filter(Boolean)
    .join(' ');

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
      <label
        className={[
          'profile-completion__upload',
          value ? 'has-value' : '',
          error ? 'has-error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        htmlFor={field.name}
      >
        <input
          id={field.name}
          name={field.name}
          type="file"
          accept={field.accept}
          className="profile-completion__upload-input"
          onChange={(event) => onFileChange(field.name, event)}
        />
        <span className="profile-completion__upload-icon">⬆️</span>
        <span className="profile-completion__upload-title">
          {value ? 'File selected' : `Upload ${field.label}`}
        </span>
        <span className="profile-completion__upload-name">{value || 'Click to choose a file'}</span>
      </label>
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
    />
  );
}

function ReviewSection({ step, values, onEdit }) {
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
          {section.fields.filter((field) => shouldRenderField(field, values)).map((field) => (
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
  const { user } = useAuth();

  const validationRules = useMemo(
    () =>
      PROFILE_FIELDS.reduce((accumulator, field) => {
        accumulator[field.name] = (value, allValues) =>
          validateProfileField(field, value, allValues);
        return accumulator;
      }, {}),
    []
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

        const completed = getCompletedStepIndexes(mergedValues);
        const firstIncompleteStep = EDITABLE_STEPS.findIndex(
          (_, index) => !completed.includes(index)
        );

        setValues(mergedValues);
        setCompletedSteps(completed);
        setCurrentStep(
          firstIncompleteStep === -1 ? PROFILE_STEPS.length - 1 : firstIncompleteStep
        );
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
  }, [setValues, user?.id, user?.name]);

  const progressCount = completedSteps.filter(
    (stepIndex) => stepIndex < EDITABLE_STEPS.length
  ).length;
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

  const handleFileSelection = (fieldName, event) => {
    const fileName = event.target.files?.[0]?.name || '';
    const syntheticEvent = { target: { name: fieldName, value: fileName } };
    handleChange(syntheticEvent);
    handleBlur(syntheticEvent);
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    if (name !== 'state') {
      handleChange(event);
      return;
    }

    const availableDistricts = DISTRICT_OPTIONS_BY_STATE[value] || [];

    setValues((previousValues) => {
      const districtStillValid = availableDistricts.includes(previousValues.district);
      return {
        ...previousValues,
        state: value,
        district: districtStillValid ? previousValues.district : '',
      };
    });

    setErrors((previousErrors) => ({
      ...previousErrors,
      state: '',
      district: '',
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

    const recalculated = getCompletedStepIndexes(values);
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
      await apiSaveProfileDetails({
        userId: user?.id,
        details: values,
      });
      setCompletedSteps(PROFILE_STEPS.map((_, index) => index));
      setSuccessMessage('Profile saved successfully. All details have been submitted.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setApiError(error.message || 'Could not save profile. Please try again.');
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
            <span className="profile-completion__eyebrow">Partner onboarding</span>
            <h1>Complete Your Profile</h1>
            <p>
              Capture personal, address, investment, payment, and document details in
              one reusable step-based flow.
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
              {progressCount} of {EDITABLE_STEPS.length} sections are ready for final
              submission.
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
                  {section.fields.filter((field) => shouldRenderField(field, values)).map((field) => {
                    const districtOptions = field.name === 'district' ? getDistrictOptions(values.state) : null;
                    const fieldConfig = field.name === 'district'
                      ? {
                          ...field,
                          options: districtOptions,
                          disabled: !values.state,
                          label: values.state ? 'Related District' : 'Related District (Select state first)',
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
                        onFileChange={handleFileSelection}
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
