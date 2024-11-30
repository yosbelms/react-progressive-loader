export class IntersectionObserverMock {
  static callbacks = [];
  static observeList = [];

  static triggerInteceptionOn(htmlElement: HTMLElement | '*') {
    if (IntersectionObserverMock.observeList.includes(htmlElement) || htmlElement === '*') {
      IntersectionObserverMock.callbacks.forEach(callback => callback(htmlElement === '*' ? IntersectionObserverMock.observeList.map(target => ({
        isIntersecting: true,
        target
      })) : [{
        isIntersecting: true,
        target: htmlElement
      }]));
    }
  }

  constructor(callback) {
    IntersectionObserverMock.callbacks.push(callback);
    Object.keys(Object.getPrototypeOf(this)).forEach(method => jest.spyOn(Object.getPrototypeOf(this), method));
  }

  public observe(elem: HTMLElement) {
    IntersectionObserverMock.observeList.push(elem);
  }

  public unobserve(elem: HTMLElement) {
    IntersectionObserverMock.observeList.splice(IntersectionObserverMock.observeList.indexOf(elem), 1);
  }
}
