
import React from 'react';

interface FormFieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, description, children }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-400">{label}</label>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      <div className="mt-2">
        {children}
      </div>
    </div>
  );
};
