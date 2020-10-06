import React from 'react';
import { render } from '@testing-library/react';
import { App } from './App';
import { computeDelay } from './utils';

test('renders redirect to Twitch auth', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Redirecting you to Twitch to authorize/i);
  expect(linkElement).toBeInTheDocument();
});

test('parsing delay', () => {
  expect(computeDelay('1:23:45').delaySeconds).toBe(3600 + 23 * 60 + 45);
  expect(computeDelay('-1:00:45').delaySeconds).toBe(-(3600 + 45));
  expect(computeDelay('-12:45').delaySeconds).toBe(-(12 * 3600 + 45 * 60));
  expect(computeDelay('4:31').delaySeconds).toBe(4 * 3600 + 31 * 60);
  expect(computeDelay('-5m').delaySeconds).toBe(-5 * 60);
});
