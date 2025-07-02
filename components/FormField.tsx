import React from 'react';

interface FormFieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = React.memo(({ label, description, children }) => {
  return (
    <div className="mb-2">
      <label className="block text-xs font-medium text-slate-400">{label}</label>
      {description && <p className="text-[11px] text-slate-500 mt-1">{description}</p>}
      <div className="mt-1.5">
        {children}
      </div>
    </div>
  );
});