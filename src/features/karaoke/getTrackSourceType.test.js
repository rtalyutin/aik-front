import assert from 'node:assert/strict';
import test from 'node:test';
import { getTrackSourceType } from './getTrackSourceType.js';

test('определяет YouTube по коротким и полным ссылкам', () => {
  assert.equal(getTrackSourceType('https://youtu.be/dQw4w9WgXcQ'), 'youtube');
  assert.equal(
    getTrackSourceType('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s'),
    'youtube',
  );
});

test('распознаёт ссылки ВКонтакте', () => {
  assert.equal(getTrackSourceType('https://vk.com/video-123_456'), 'vk');
  assert.equal(getTrackSourceType('https://www.vkontakte.ru/video-1'), 'vk');
});

test('возвращает media для прямых файлов', () => {
  assert.equal(getTrackSourceType('https://cdn.example.com/song.mp4'), 'media');
  assert.equal(getTrackSourceType('/audio/track.webm?token=123'), 'media');
});

test('возвращает unknown для пустых или непризнанных ссылок', () => {
  assert.equal(getTrackSourceType(''), 'unknown');
  assert.equal(getTrackSourceType('not-a-url'), 'unknown');
  assert.equal(getTrackSourceType('https://example.com/profile'), 'unknown');
});
