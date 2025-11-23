import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DrawerHeader } from '../Drawer/DrawerHeader';

describe('DrawerHeader', () => {
  const onClose = vi.fn();
  it('renders correctly', () => {
    render(<DrawerHeader onClose={onClose} />);

    expect(screen.getByLabelText('Закрыть меню').parentElement).toMatchSnapshot();
  });
});
