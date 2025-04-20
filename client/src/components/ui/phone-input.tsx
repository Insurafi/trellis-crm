import React, { ChangeEvent, forwardRef, InputHTMLAttributes } from 'react';
import { Input } from './input';

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
}

const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');
  
  // Early return if empty
  if (cleaned.length === 0) return '';
  
  // Format with dashes
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  } else {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
};

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Format the phone number
      const formattedValue = formatPhoneNumber(inputValue);
      
      // Call the onChange handler with the formatted value
      if (onChange) {
        onChange(formattedValue);
      }
    };

    return (
      <Input
        type="tel"
        placeholder="123-456-7890"
        maxLength={12} // 10 digits + 2 dashes = 12 characters
        ref={ref}
        value={value}
        onChange={handleInputChange}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';