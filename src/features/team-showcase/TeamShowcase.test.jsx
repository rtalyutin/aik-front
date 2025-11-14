import '../../../test/setup.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import TeamShowcase from './TeamShowcase.jsx';
import teamsConfig from './config.json';

const getActiveSlide = () =>
  Array.from(document.querySelectorAll('.team-showcase__slide')).find(
    (element) => element?.getAttribute('data-active') === 'true',
  );

test('renders the first team by default with full roster', () => {
  render(<TeamShowcase />);

  const activeSlide = getActiveSlide();
  assert.ok(activeSlide, 'ожидался активный слайд карусели');

  const firstTeam = teamsConfig[0];
  const activeWithin = within(activeSlide);

  const heading = activeWithin.getByRole('heading', { name: firstTeam.name });
  assert.ok(heading, 'название команды должно отображаться в заголовке');

  firstTeam.members.forEach((member) => {
    const memberName = activeWithin.getByText(member.name, { exact: false });
    assert.ok(memberName, `в слайде должен быть участник ${member.name}`);
    if (member.hours !== null) {
      const hoursLabel = activeWithin.getByText((content) =>
        content.includes(member.hours.toLocaleString('ru-RU')),
      );
      assert.ok(hoursLabel, `в слайде должны отображаться часы игрока ${member.name}`);
    }
  });
});

test('switches slides when navigation buttons are used', () => {
  render(<TeamShowcase />);

  const nextButton = screen.getByRole('button', { name: 'Следующая команда' });
  fireEvent.click(nextButton);

  const activeSlide = getActiveSlide();
  assert.ok(activeSlide, 'ожидался активный слайд после переключения');

  const secondTeam = teamsConfig[1];
  const activeWithin = within(activeSlide);
  const heading = activeWithin.getByRole('heading', { name: secondTeam.name });
  assert.ok(heading, 'после переключения должен отображаться следующий состав');

  const indicators = screen.getAllByRole('button', { name: /Показать команду/ });
  assert.ok(indicators[1].getAttribute('aria-pressed') === 'true', 'индикатор второго слайда должен быть активен');

  const previousButton = screen.getByRole('button', { name: 'Предыдущая команда' });
  fireEvent.click(previousButton);

  const backSlide = getActiveSlide();
  const backWithin = within(backSlide);
  const firstHeading = backWithin.getByRole('heading', { name: teamsConfig[0].name });
  assert.ok(firstHeading, 'карусель должна возвращаться к первому слайду при нажатии назад');
});
