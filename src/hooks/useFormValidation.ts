import { useState, useCallback } from 'react';

interface ValidationRules {
  [key: string]: (value: any) => string | undefined;
}

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name] && validationRules[name as string]) {
      const error = validationRules[name as string](value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validationRules]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    if (validationRules[name as string]) {
      const error = validationRules[name as string](values[name]);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [values, validationRules]);

  const validate = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(key => {
      const error = validationRules[key](values[key as keyof T]);
      if (error) {
        newErrors[key as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return { values, errors, touched, handleChange, handleBlur, validate, reset };
};
