import React from 'react';

interface TextInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (id: string, value: string) => void;
  type?: 'text' | 'textarea';
  required?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ id, label, placeholder, value, onChange, type = 'text', required = false }) => {
  const commonProps = {
    id,
    placeholder,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(id, e.target.value),
    className: "block w-full rounded-md border-0 py-1.5 bg-brand-bg text-brand-text shadow-sm ring-1 ring-inset ring-brand-border placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6 transition-all duration-200",
    required
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium leading-6 text-brand-text-secondary">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="mt-2">
        {type === 'textarea' ? (
          <textarea {...commonProps} rows={4} />
        ) : (
          <input {...commonProps} type="text" />
        )}
      </div>
    </div>
  );
};