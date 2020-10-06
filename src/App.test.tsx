import React from 'react';
import { render } from '@testing-library/react';
import { App } from './App';

test('renders redirect to Twitch auth', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Redirecting you to Twitch to authorize/i);
  expect(linkElement).toBeInTheDocument();
});
