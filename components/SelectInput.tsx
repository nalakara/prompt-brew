import React from 'react';

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  Icon?: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
}

export const SelectInput: React.FC<SelectInputProps> = ({ label, value, onChange, options, Icon }) => (
  <div>
    <label htmlFor={label} className="block text-sm font-medium text-brand-text-secondary mb-1">
      {label}
    </label>
    <div className="relative">
      {Icon && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>}
      <select
        id={label}
        value={value}
        onChange={onChange}
        className={`block w-full rounded-md border-0 py-2 ${Icon ? 'pl-10' : 'pl-3'} pr-10 bg-brand-bg text-brand-text ring-1 ring-inset ring-brand-border focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6 transition-all duration-200`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);