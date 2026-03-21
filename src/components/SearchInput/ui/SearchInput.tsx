import { Input } from '@/components/Input';

import './SearchInput.scss';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = ({ value, onChange, placeholder }: SearchInputProps) => (
  <div className="search-input">
    <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    <span className="search-input__icon">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </span>
  </div>
);
