import '../test/setup.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('статусный виджет рендерится после плеера в рабочей области', async () => {
  render(<App />);

  const playerRegion = await screen.findByRole('region', { name: /Аудиоплеер/i });
  const statusHeading = await screen.findByRole('heading', {
    level: 2,
    name: 'Статус обработки',
  });

  const detailsContainer = playerRegion.closest('.workspace__details');
  assert.ok(detailsContainer, 'Плеер должен находиться внутри контейнера workspace__details');

  const elements = Array.from(detailsContainer.children).filter(
    (node) => node.nodeType === Node.ELEMENT_NODE,
  );
  const playbackIndex = elements.findIndex((element) => element.contains(playerRegion));
  const statusIndex = elements.findIndex((element) => element.contains(statusHeading));

  assert.ok(playbackIndex >= 0, 'Область воспроизведения должна присутствовать в дереве');
  assert.ok(statusIndex >= 0, 'Статусный виджет должен присутствовать в дереве');
  assert.ok(
    statusIndex > playbackIndex,
    'Статусный виджет должен следовать после области воспроизведения',
  );
});
