import { render } from '@testing-library/react';

import { MemoryRouter } from 'react-router';

export const renderWithRouter = (component, options = {}) => {
  const Wrapper = ({ children }) => <MemoryRouter {...options}>{children}</MemoryRouter>;

  return render(component, { wrapper: Wrapper });
};
