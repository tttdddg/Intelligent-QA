import React from 'react';
import { FormData } from '@/types/type';

export interface RoleSelectorProps {
  value: FormData['role'];
  onChange: (role: FormData['role']) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange }) => (
  <div className="role-selection">
    {(['employee', 'visitor'] as const).map(r => (
      <label key={r} className="role-option">
        <input
          type="radio"
          name="role"
          value={r}
          checked={value === r}
          onChange={() => onChange(r)}
        />
        <span className="role-label">{r === 'employee' ? '员工' : '访客'}</span>
      </label>
    ))}
  </div>
);

export default RoleSelector;