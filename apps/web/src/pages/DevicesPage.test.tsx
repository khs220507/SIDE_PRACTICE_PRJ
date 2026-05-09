import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DevicesPage } from './DevicesPage';

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe('DevicesPage', () => {
  it('renders fixture devices from the mock API', async () => {
    renderWithProviders(<DevicesPage />);

    expect(await screen.findByText('Boiler Room Sensor')).toBeInTheDocument();
    expect(screen.getByText('STM32F407')).toBeInTheDocument();
    expect(screen.getByText(/GATEWAY/)).toBeInTheDocument();
  });
});
