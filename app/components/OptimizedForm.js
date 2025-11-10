"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { debounce } from "lodash";

// Optimized form component with performance enhancements
export default function OptimizedForm({
  initialData = {},
  onSubmit,
  validationSchema,
  children,
  className = "",
  autosave = false,
  autosaveDelay = 2000,
}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const formRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Memoize form data to prevent unnecessary re-renders
  const memoizedFormData = useMemo(() => formData, [formData]);

  // Debounced validation function
  const debouncedValidation = useCallback(
    debounce((data) => {
      if (validationSchema) {
        const validationErrors = validateForm(data, validationSchema);
        setErrors(validationErrors);
      }
    }, 300),
    [validationSchema],
  );

  // Debounced autosave function
  const debouncedAutosave = useCallback(
    debounce(async (data) => {
      if (autosave && isDirty) {
        try {
          await saveFormData(data);
          console.log("Form auto-saved successfully");
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }
    }, autosaveDelay),
    [autosave, autosaveDelay, isDirty],
  );

  // Handle input changes with optimization
  const handleInputChange = useCallback(
    (name, value) => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setFormData((prev) => {
        const newData = { ...prev, [name]: value };

        // Trigger debounced validation
        debouncedValidation(newData);

        // Trigger debounced autosave
        debouncedAutosave(newData);

        return newData;
      });

      setIsDirty(true);
      setTouched((prev) => ({ ...prev, [name]: true }));
    },
    [debouncedValidation, debouncedAutosave],
  );

  // Handle field blur for validation
  const handleFieldBlur = useCallback(
    (name) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Validate immediately on blur
      if (validationSchema) {
        const fieldErrors = validateField(formData[name], validationSchema[name]);
        setErrors((prev) => ({ ...prev, [name]: fieldErrors }));
      }
    },
    [formData, validationSchema],
  );

  // Optimized form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (isSubmitting) return;

      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this submission
      abortControllerRef.current = new AbortController();

      setIsSubmitting(true);

      try {
        // Validate entire form
        if (validationSchema) {
          const validationErrors = validateForm(formData, validationSchema);
          if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
          }
        }

        // Submit form
        await onSubmit(formData, abortControllerRef.current.signal);
        setIsDirty(false);

        // Clear autosave timeout after successful submission
        debouncedAutosave.cancel();
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Form submission error:", error);
        }
      } finally {
        setIsSubmitting(false);
        abortControllerRef.current = null;
      }
    },
    [formData, isSubmitting, onSubmit, validationSchema, debouncedAutosave],
  );

  // Reset form with cleanup
  const resetForm = useCallback(() => {
    // Cancel any pending operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Cancel debounced functions
    debouncedValidation.cancel();
    debouncedAutosave.cancel();

    setFormData(initialData);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialData, debouncedValidation, debouncedAutosave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Cancel debounced functions
      debouncedValidation.cancel();
      debouncedAutosave.cancel();
    };
  }, [debouncedValidation, debouncedAutosave]);

  // Auto-save warning when leaving page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && autosave) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, autosave]);

  // Context value for form components
  const formContext = useMemo(
    () => ({
      formData: memoizedFormData,
      errors,
      touched,
      isSubmitting,
      isDirty,
      handleInputChange,
      handleFieldBlur,
      handleSubmit,
      resetForm,
    }),
    [
      memoizedFormData,
      errors,
      touched,
      isSubmitting,
      isDirty,
      handleInputChange,
      handleFieldBlur,
      handleSubmit,
      resetForm,
    ],
  );

  return (
    <FormContext.Provider value={formContext}>
      <form ref={formRef} onSubmit={handleSubmit} className={`space-y-4 ${className}`} noValidate>
        {children}
      </form>
    </FormContext.Provider>
  );
}

// Form context for child components
import { createContext } from "react";

export const FormContext = createContext();

// Hook for using form context
export function useFormContext() {
  const context = FormContext.useContext();
  if (!context) {
    throw new Error("useFormContext must be used within an OptimizedForm");
  }
  return context;
}

// Optimized input component
export function OptimizedInput({
  name,
  label,
  type = "text",
  placeholder = "",
  required = false,
  className = "",
  ...props
}) {
  const { formData, errors, touched, handleInputChange, handleFieldBlur } = useFormContext();
  const [isFocused, setIsFocused] = useState(false);

  const value = formData[name] || "";
  const error = touched[name] ? errors[name] : "";
  const hasError = !!error;

  const handleChange = useCallback(
    (e) => {
      handleInputChange(name, e.target.value);
    },
    [name, handleInputChange],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    handleFieldBlur(name);
  }, [name, handleFieldBlur]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const inputId = `input-${name}`;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium ${hasError ? "text-red-600" : "text-gray-700"}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
          hasError
            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
            : isFocused
              ? "border-blue-300 focus:ring-blue-500 focus:border-blue-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        }`}
        {...props}
      />

      {hasError && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Optimized select component
export function OptimizedSelect({
  name,
  label,
  options = [],
  required = false,
  placeholder = "Select an option",
  className = "",
  ...props
}) {
  const { formData, errors, touched, handleInputChange, handleFieldBlur } = useFormContext();
  const [isFocused, setIsFocused] = useState(false);

  const value = formData[name] || "";
  const error = touched[name] ? errors[name] : "";
  const hasError = !!error;

  const handleChange = useCallback(
    (e) => {
      handleInputChange(name, e.target.value);
    },
    [name, handleInputChange],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    handleFieldBlur(name);
  }, [name, handleFieldBlur]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const selectId = `select-${name}`;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className={`block text-sm font-medium ${hasError ? "text-red-600" : "text-gray-700"}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        id={selectId}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        required={required}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
          hasError
            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
            : isFocused
              ? "border-blue-300 focus:ring-blue-500 focus:border-blue-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        }`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {hasError && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Utility functions
function validateForm(data, schema) {
  const errors = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const fieldErrors = validateField(value, rules);

    if (fieldErrors) {
      errors[field] = fieldErrors;
    }
  }

  return errors;
}

function validateField(value, rules) {
  if (rules.required && (!value || value.toString().trim() === "")) {
    return "This field is required";
  }

  if (rules.minLength && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters`;
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.message || "Invalid format";
  }

  return null;
}

async function saveFormData(data) {
  // Implement your autosave logic here
  // This could be an API call to save draft
  console.log("Saving form data:", data);
}
