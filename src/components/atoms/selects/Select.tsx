interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

const Select = ({ label, value, onChange, options, disabled }: SelectProps) => {
  return (
    <div>
      {label === undefined && (
        <label className='block mb-1 text-sm font-medium text-gray-700'>
          {label}
        </label>
      )}
      <label className='block mb-1 text-sm font-medium text-gray-700'>
        {label}
      </label>
      <div className='relative'>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='w-full p-2 pr-8 border border-gray-300 rounded-md appearance-none disabled:cursor-not-allowed disabled:opacity-50'
          disabled={disabled}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Select;
