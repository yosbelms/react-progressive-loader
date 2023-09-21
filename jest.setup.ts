import '@testing-library/jest-dom';
import { act } from '@testing-library/react';

const callbacks = [];

(window as any).requestAnimationFrame = (fn: any) => {
  callbacks.push(fn);
};

(window as any).requestAnimationFrame.mock = {
  runAllAnimationFramesChains() {
    act(() => {
      while (callbacks.length > 0) {
        callbacks.pop()();
      }
    });
  }
};
