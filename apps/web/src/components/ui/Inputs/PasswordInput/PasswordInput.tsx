'use client';

import { forwardRef, useState } from 'react';
import Input from '../Input';
import PasswordToggleButton from './PasswordToggleButton';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, className, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <Input
            {...props}
            type={showPassword ? 'text' : 'password'}
            className={`pr-12 ${className || ''}`}
            ref={ref}
          />
          <PasswordToggleButton
            showPassword={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
)

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;