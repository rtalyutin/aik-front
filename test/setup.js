import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
});

const { window } = dom;

function copyProps(src, target) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  });
}

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
