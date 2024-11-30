import { act } from '@testing-library/react';
import crypto from 'node:crypto';

export class ImageMock {
  static callbacks = new Map<string, { src: string, onload: () => void }>();

  static triggerLoadOf(imgSrc: string | '*') {

    act(() => {
      ImageMock.callbacks.forEach(({
        onload,
        src
      }) => (src === imgSrc || imgSrc === '*') && typeof onload === 'function' && onload());
    });

  }

  public id: string;

  constructor() {
    const buffer = crypto.randomBytes(10);
    this.id = buffer.toString('hex');
  }

  public get src() {
    return ImageMock.callbacks.get(this.id).src;
  }

  public set src(url: string) {
    if (!ImageMock.callbacks.has(this.id)) {
      ImageMock.callbacks.set(this.id, { src: '', onload: null });
    }

    ImageMock.callbacks.get(this.id).src = url;

  }

  public get onload() {
    return ImageMock.callbacks.get(this.id).onload;
  }

  public set onload(callback: () => void) {
    if (!ImageMock.callbacks.has(this.id)) {
      ImageMock.callbacks.set(this.id, { src: '', onload: null });
    }

    ImageMock.callbacks.get(this.id).onload = callback;
  }
}
