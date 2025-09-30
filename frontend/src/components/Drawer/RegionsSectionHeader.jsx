// components/Drawer/RegionsSectionHeader.jsx
import './RegionsSectionHeader.css';

export const RegionsSectionHeader = ({ isExpanded, onToggle }) => {
  return (
    <li className="drawer-menu-item drawer-section-header">
      <button className="drawer-section-toggle" onClick={onToggle} aria-expanded={isExpanded}>
        <span>Регионы россии</span>
        <span className={`drawer-toggle-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </button>
    </li>
  );
};
