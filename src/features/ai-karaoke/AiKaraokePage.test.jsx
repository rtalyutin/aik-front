import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import React from 'react';
import { render, screen } from '@testing-library/react';
import AiKaraokePage from './AiKaraokePage.jsx';
import config from './config.js';

test('renders AI karaoke placeholder copy', () => {
  render(<AiKaraokePage />);

  assert.ok(screen.getByRole('heading', { name: config.title }));
  assert.ok(screen.getByText(config.description));
});
