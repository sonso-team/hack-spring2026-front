import { type ReactNode } from 'react';

import './StatCard.scss';

interface StatCardProps {
  label: string;
  value: ReactNode;
}

export const StatCard = ({ label, value }: StatCardProps) => (
  <div className="stat-card">
    <span className="stat-card__label">{label}</span>
    <span className="stat-card__value">{value}</span>
  </div>
);
