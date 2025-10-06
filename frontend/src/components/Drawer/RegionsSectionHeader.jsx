import { memo } from 'react';

import './RegionsSectionHeader.css';

export const RegionsSectionHeader = memo(({ isExpanded, onToggle }) => {
  return (
    <li className="drawer-menu-item drawer-section-header">
      <button className="drawer-section-toggle" onClick={onToggle} aria-expanded={isExpanded}>
        <span>Регионы России</span>
        <span className={`drawer-toggle-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </button>
    </li>
  );
});
