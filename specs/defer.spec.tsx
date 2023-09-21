import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { Defer } from '../src/defer';
import { IntersectionObserverMock } from './mocks/IntersectionObserver';

describe('Defer', () => {
  const DeferredComp = () => <div data-testid="deferred" />;
  const PlaceholderComp = () => <div data-testid="placeholder" />;

  describe('wrapper', () => {
    it('should render wrapper', () => {
      const screen = render(<Defer render={DeferredComp} />);

      expect(screen.getByTestId('observed')).toBeInTheDocument();
    });

    it('should render default styles on wrapper', () => {
      const screen = render(<Defer render={DeferredComp} />);

      expect(screen.getByTestId('observed')).toHaveStyle({
        display: 'inline-block',
        'min-height': '1px',
        'min-width': '1px'
      });
    });

    it('should allow to override wrapper styles', () => {
      const screen = render(<Defer render={DeferredComp} style={{ display: 'block' }} />);

      expect(screen.getByTestId('observed')).toHaveStyle({
        display: 'block',
        'min-height': '1px',
        'min-width': '1px'
      });
    });

    it('should pass all element attrs to wrapper', () => {
      const screen = render(<Defer render={DeferredComp} className="test" />);

      expect(screen.getByTestId('observed')).toHaveClass('test');
    });
  });

  describe('render', () => {
    it('should render placeholder if provided while loading', () => {
      const screen = render(<Defer render={DeferredComp} renderPlaceholder={PlaceholderComp} />);

      expect(screen.getByTestId('placeholder')).toBeInTheDocument();
    });

    it('should render the given component with timeout', () => {
      jest.useFakeTimers();

      const screen = render(<Defer render={DeferredComp} renderPlaceholder={PlaceholderComp} />);

      act(() => {
        jest.advanceTimersByTime(10);
      });

      expect(screen.getByTestId('deferred')).toBeInTheDocument();
      jest.useRealTimers();
    });

    it('should support render that returns a promise React component', async () => {
      let promiseResolver;
      const PromisedDeferredComp = () => new Promise(resolve => promiseResolver = resolve);
      const screen = render(<Defer render={PromisedDeferredComp} renderPlaceholder={PlaceholderComp} />);

      expect(screen.getByTestId('placeholder')).toBeInTheDocument();

      promiseResolver(DeferredComp());

      await waitFor(() => screen.getByTestId('deferred'));

      expect(screen.getByTestId('deferred')).toBeInTheDocument();
    });

    it('should support render that returns a promise with ReactElement', async () => {
      let promiseResolver;
      const PromisedDeferredComp = () => new Promise(resolve => promiseResolver = resolve);
      const screen = render(<Defer render={PromisedDeferredComp} renderPlaceholder={PlaceholderComp} />);

      expect(screen.getByTestId('placeholder')).toBeInTheDocument();

      promiseResolver(DeferredComp());

      await waitFor(() => screen.getByTestId('deferred'));

      expect(screen.getByTestId('deferred')).toBeInTheDocument();
    });

    it('should support render that returns a promise with a default prop', async () => {
      let promiseResolver;
      const PromisedDeferredComp = () => new Promise(resolve => promiseResolver = resolve);
      const screen = render(<Defer render={PromisedDeferredComp} renderPlaceholder={PlaceholderComp} />);

      expect(screen.getByTestId('placeholder')).toBeInTheDocument();

      promiseResolver({ default: DeferredComp });

      await waitFor(() => screen.getByTestId('deferred'));

      expect(screen.getByTestId('deferred')).toBeInTheDocument();
    });
  });

  describe('loadOnScreen', () => {
    it('should wait for the wrapper to be in screen', async () => {
      jest.resetModules();
      jest.useFakeTimers();
      (global as any).IntersectionObserver = IntersectionObserverMock;

      const { Defer } = require('../src/defer');
      const screen = render(<Defer render={DeferredComp} renderPlaceholder={PlaceholderComp} loadOnScreen={true} />);

      expect(screen.queryByTestId('observed')).toBeInTheDocument();
      expect(screen.queryByTestId('placeholder')).not.toBeInTheDocument();

      act(() => {
        IntersectionObserverMock.triggerInteceptionOn('*');
      });

      expect(screen.queryByTestId('placeholder')).toBeInTheDocument();
      expect(screen.queryByTestId('deferred')).not.toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1)
      })

      expect(screen.queryByTestId('placeholder')).not.toBeInTheDocument();
      expect(screen.queryByTestId('deferred')).toBeInTheDocument();
    });
  });
});
