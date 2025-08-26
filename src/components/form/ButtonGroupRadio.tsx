import { FC } from 'react';
import Button from '../ui/button/Button';

interface ButtonGroupRadioProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

const ButtonGroupRadio: FC<ButtonGroupRadioProps> = ({
  options,
  selectedValue,
  onChange,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 gap-2 w-full md:grid-cols-${options.length} ${className}`}>
      {options.map(option => (
        <Button
          key={option.value}
          type="button"
          variant={selectedValue === option.value ? 'primary' : 'outline'}
          onClick={() => onChange(option.value)}
          className='w-full'
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default ButtonGroupRadio;
