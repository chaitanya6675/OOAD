import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = '#2563eb', bg = 'rgba(37, 99, 235, 0.1)' }) => {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
      </div>
      <div className="stat-icon-box" style={{ backgroundColor: bg }}>
        <Icon size={22} color={color} />
      </div>
    </div>
  );
};
