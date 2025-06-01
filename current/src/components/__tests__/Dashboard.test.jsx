import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../Dashboard'; // Adjust path to your Dashboard component

describe('Dashboard', () => {
  it('renders the dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('handles button click', () => {
    render(<Dashboard />);
    const button = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(button);
    // Add assertions for what should happen after click
  });
}); 