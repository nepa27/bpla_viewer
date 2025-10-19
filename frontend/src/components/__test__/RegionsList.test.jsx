import { screen } from '@testing-library/dom';
import { describe, expect, it } from 'vitest';

import { renderWithRouter } from '../../utils/testing';
import { RegionsList } from '../Drawer/RegionsList';

describe('RegionsList', () => {
  it.todo('render correctly', () => {
    renderWithRouter(<RegionsList />);

    expect(screen.getAllByRole('link')).toHaveLength(89)
  });
});
