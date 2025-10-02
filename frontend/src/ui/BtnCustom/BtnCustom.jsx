/* eslint-disable no-unused-vars */
import { Button } from 'antd';

import { useState } from 'react';

export const BtnCustom = ({ children, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);
  const buttonStyle = {
    backgroundColor: 'var(--secondary-dark, #112240)',
    color: isHovered ? 'white' : 'var(--accent-blue)',
    borderColor: 'var(--border-color, rgba(136, 146, 176))',
    transition: 'all 0.2s ease',
    boxShadow: isHovered ? '0 4px 12px rgba(52, 152, 219, 0.3)' : 'none',
  };
  return (
    <Button
      {...props}
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </Button>
  );
};
