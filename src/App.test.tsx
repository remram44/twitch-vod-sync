import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { computeDelay, formatDelay } from './utils';

test('renders redirect to Twitch auth', () => {
  render(<App />);
  const linkElement = screen.getByText(/Redirecting you to Twitch to authorize/i);
  expect(linkElement).toBeInTheDocument();
});

test('parsing delay', () => {
  expect(computeDelay('1:03:45')).toBe(3600 + 3 * 60 + 45);
  expect(computeDelay('-1:00:45')).toBe(-(3600 + 45));
  expect(computeDelay('-12:45')).toBe(-(12 * 60 + 45));
  expect(computeDelay('4:31')).toBe(4 * 60 + 31);
  expect(computeDelay('-5m')).toBe(-5 * 60);
});

test('formatting delay', () => {
  expect(formatDelay(3600 + 3 * 60 + 45)).toBe('01:03:45');
  expect(formatDelay(-(3600 + 45))).toBe('-01:00:45');
  expect(formatDelay(-(12 * 60 + 45))).toBe('-12:45');
  expect(formatDelay(4 * 60 + 31)).toBe('04:31');
});
