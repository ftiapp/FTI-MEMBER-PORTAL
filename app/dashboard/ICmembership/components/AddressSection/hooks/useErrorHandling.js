import { useEffect } from 'react';

export const useErrorHandling = (errors) => {
  // Auto scroll to first error
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      const errorFields = Object.keys(errors);
      const firstErrorField = errorFields[0];
      const firstErrorElement = document.getElementById(firstErrorField);
      
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
        // Optional: Focus on the input field
        setTimeout(() => {
          firstErrorElement.focus();
        }, 500);
      }
    }
  }, [errors]);
};