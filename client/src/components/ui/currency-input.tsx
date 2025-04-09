import React, { useState, useEffect, forwardRef } from 'react';
import { Input, InputProps } from '@/components/ui/input';

export interface CurrencyInputProps extends Omit<InputProps, 'onChange'> {
  onChange?: (e: { target: { value: string; name?: string } }) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, name, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState<string>('');

    // Format the value to currency when it changes
    useEffect(() => {
      if (value) {
        // Convert value to string if it's not already
        const valueStr = typeof value === 'number' ? value.toString() : value.toString();
        // Remove non-numeric characters
        const numericValue = valueStr.replace(/[^0-9]/g, '');
        // Format as currency
        setDisplayValue(numericValue);
      } else {
        setDisplayValue('');
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow only numbers
      const numericValue = e.target.value.replace(/[^0-9]/g, '');
      setDisplayValue(numericValue);

      if (onChange) {
        onChange({
          target: {
            value: numericValue,
            name,
          },
        });
      }
    };

    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <span className="text-gray-500">$</span>
        </div>
        <Input
          ref={ref}
          name={name}
          value={displayValue}
          onChange={handleChange}
          className="pl-8"
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';