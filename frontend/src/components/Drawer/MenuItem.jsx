import { memo } from 'react';

import './MenuItem.css';

export const MenuItem = memo(({ item, onClose }) => {
  return (
    <li className="drawer-menu-item">
      <a
        href={item.path}
        className="drawer-menu-link"
        onClick={(e) => {
          e.preventDefault();
          window.location.href = item.path;
          onClose();
        }}
      >
        {item.label}
      </a>
    </li>
  );
});
