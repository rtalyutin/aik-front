import React, { useEffect } from 'react';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
});

const { window } = dom;

const defaultImportMetaEnv = {
  VITE_AUTH_SIGN_IN_ENDPOINT: process.env.VITE_AUTH_SIGN_IN_ENDPOINT || '/auth',
  VITE_READY_TRACKS_ENDPOINT: process.env.VITE_READY_TRACKS_ENDPOINT || '/ready',
  VITE_JOB_STATUS_ENDPOINT: process.env.VITE_JOB_STATUS_ENDPOINT || '/job-status',
  VITE_CREATE_TASK_URL: process.env.VITE_CREATE_TASK_URL || '/task/url',
  VITE_CREATE_TASK_FILE:
    process.env.VITE_CREATE_TASK_FILE ||
    '/api/karaoke-tracks/create-task-from-file',
};

function copyProps(src, target) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  });
}

globalThis.import_meta_env = defaultImportMetaEnv;
globalThis.window = window;
globalThis.document = window.document;
globalThis.navigator = window.navigator;
globalThis.HTMLElement = window.HTMLElement;
copyProps(window, globalThis);

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

if (!window.HTMLMediaElement.prototype.play) {
  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value() {
      this.paused = false;
      this.dispatchEvent(new window.Event('play'));
      return Promise.resolve();
    },
  });
} else {
  const originalPlay = window.HTMLMediaElement.prototype.play;
  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value() {
      this.paused = false;
      this.dispatchEvent(new window.Event('play'));
      const result = originalPlay.apply(this, arguments);
      return result ?? Promise.resolve();
    },
  });
}

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value() {
    this.paused = true;
    this.dispatchEvent(new window.Event('pause'));
  },
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value() {
    this.dispatchEvent(new window.Event('loadedmetadata'));
  },
});

if (!window.HTMLElement.prototype.scrollIntoView) {
  Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value() {},
  });
}

if (!globalThis.REACT_PLAYER_MOCK) {
  globalThis.REACT_PLAYER_MOCK = function MockReactPlayer({ url, playing, onReady, onEnded }) {
    useEffect(() => {
      if (typeof onReady === 'function') {
        onReady();
      }
    }, [onReady]);

    useEffect(() => {
      if (playing && typeof onEnded === 'function') {
        onEnded();
      }
    }, [playing, onEnded]);

    return React.createElement('div', {
      'data-testid': 'react-player-mock',
      'data-url': url,
      'data-playing': playing ? 'true' : 'false',
      'aria-label': 'Эмбед-плеер',
    });
  };
}
