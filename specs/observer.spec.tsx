import { IntersectionObserverMock } from './mocks/IntersectionObserver';

describe('observer', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should throw if InterceptionObserver is not supported', () => {
    const { observe } = require('../src/observer');

    expect(() => observe(null)).toThrowError(/This browser doesn't support InterceptionObserver/);
  });

  describe('with InterceptionObserver', () => {
    beforeEach(() => {
      (global as any).IntersectionObserver = IntersectionObserverMock;
    });

    it('should observe element', () => {
      const { observe } = require('../src/observer');

      const elem: any = document.createElement('div');
      elem.id = 'observed';
      elem.onIntersection = jest.fn();

      observe(elem);

      expect(elem.onIntersection).not.toHaveBeenCalled();
      IntersectionObserverMock.triggerInteceptionOn(null);
      expect(elem.onIntersection).not.toHaveBeenCalled();

      IntersectionObserverMock.triggerInteceptionOn(elem);
      expect(elem.onIntersection).toHaveBeenCalled();
    });

    it('should unobserve when intercepted for the first time', () => {
      const { observe, intersectionObserver } = require('../src/observer');

      const elem: any = document.createElement('div');
      elem.id = 'observed';
      elem.onIntersection = jest.fn();

      observe(elem);

      IntersectionObserverMock.triggerInteceptionOn(elem);

      expect(intersectionObserver.unobserve).toHaveBeenCalled()
    });
  });
});
