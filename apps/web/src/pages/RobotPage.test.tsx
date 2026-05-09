import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { RobotPage } from './RobotPage';

describe('RobotPage', () => {
  it('renders the temporary robot viewer controls', async () => {
    render(<RobotPage />);

    expect(screen.getByRole('heading', { name: 'Robot Digital Twin' })).toBeInTheDocument();
    expect(screen.getByTestId('robot-canvas')).toBeInTheDocument();
    expect(screen.getByLabelText('Mock joint controls')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Pause joint animation' }));

    expect(screen.getByRole('button', { name: 'Play joint animation' })).toBeInTheDocument();
  });
});

