import { useCallback, useState } from 'react';
import { FieldError } from '../utils/validators';

type Validators<T> = Partial<Record<keyof T, (value: string, values: T) => FieldError>>;

export function useForm<T extends Record<string, string>>(
  initial: T,
  validators: Validators<T>,
) {
  const [values, setValues] = useState<T>(initial);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors: Record<string, FieldError> = {};
  for (const key of Object.keys(initial) as (keyof T & string)[]) {
    const validate = validators[key];
    errors[key] = validate ? validate(values[key], values) : null;
  }

  const setValue = useCallback((key: keyof T & string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }) as T);
  }, []);

  const setFieldTouched = useCallback((key: keyof T & string) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }, []);

  const errorOf = (key: keyof T & string): FieldError =>
    touched[key] || submitted ? errors[key] : null;

  const isValid = Object.values(errors).every((e) => e === null);

  const handleSubmit = (onValid: (values: T) => void | Promise<void>) => () => {
    setSubmitted(true);
    if (isValid) void onValid(values);
  };

  return { values, setValue, setFieldTouched, errorOf, isValid, handleSubmit };
}