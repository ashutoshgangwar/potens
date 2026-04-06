import { useState, useCallback } from 'react';

/**
 * useForm — lightweight form state + validation hook
 *
 * @param {Object} initialValues  - { [fieldName]: initialValue }
 * @param {Object} validationRules - { [fieldName]: (value) => errorString | '' }
 */
const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback(
    (name, value, allValues = values) => {
      const rule = validationRules[name];
      if (!rule) return '';
      return typeof rule === 'function' ? rule(value, allValues) : '';
    },
    [validationRules, values]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, type, value, files } = e.target;
      const inputValue = type === 'file' ? files?.[0] : value;
      const updatedValues = { ...values, [name]: inputValue };
      setValues(updatedValues);
      // Clear error on change if field was already touched
      if (touched[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: validateField(name, inputValue, updatedValues),
        }));
      }
    },
    [touched, validateField, values]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, type, value, files } = e.target;
      const inputValue = type === 'file' ? files?.[0] : value;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const updatedValues = { ...values, [name]: inputValue };
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, inputValue, updatedValues),
      }));
    },
    [validateField, values]
  );

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;
    Object.keys(validationRules).forEach((name) => {
      const error = validateField(name, values[name], values);
      newErrors[name] = error;
      if (error) isValid = false;
    });
    setErrors(newErrors);
    setTouched(
      Object.keys(validationRules).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );
    return isValid;
  }, [values, validationRules, validateField]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues,
    setErrors,
    setTouched,
  };
};

export default useForm;
