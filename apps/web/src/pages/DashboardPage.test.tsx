import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';
import { DashboardPage } from './DashboardPage';

function renderWithQuery(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('DashboardPage', () => {
  it('renders the simulator-backed operational summary', async () => {
    renderWithQuery(<DashboardPage />);

    expect(screen.getByText(/Loading dashboard/i)).toBeInTheDocument();
    expect(await screen.findByText('Operational Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total devices')).toBeInTheDocument();
    expect(screen.getByText('Temperature trend')).toBeInTheDocument();
  });
});
