import { useRef } from 'react';

import './Stepper.scss';

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  onChange: (v: number) => void;
  hasError?: boolean;
}

export const Stepper = ({ value, min = 1, max, unit, onChange, hasError }: StepperProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw === '') {
      onChange(min);
      return;
    }
    const num = Number(raw);
    onChange(max !== undefined ? Math.min(max, num) : num);
  };

  const handleBlur = () => {
    if (value < min) {
      onChange(min);
    }
  };

  return (
    <div className={`stepper${hasError ? ' stepper--error' : ''}`}>
      <div className="stepper__val" onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          className="stepper__input"
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{ width: `${Math.max(1, String(value).length)}ch` }}
        />
        {unit && <span className="stepper__unit">{unit}</span>}
      </div>
      <div className="stepper__btns">
        <button
          type="button"
          className="stepper__btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          −
        </button>
        <button
          type="button"
          className="stepper__btn"
          onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
          disabled={max !== undefined && value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
};
