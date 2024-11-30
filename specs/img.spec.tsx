import { render } from '@testing-library/react';
import React from 'react';
import { Img } from '../src/img';
import { ImageMock } from './mocks/Image';
import { IntersectionObserverMock } from './mocks/IntersectionObserver';

describe('Img', () => {

  describe('wrapper', () => {
    it('should render wrapper', () => {
      const screen = render(<Img src="path/img.jpg" />);
      expect(screen.getByTestId('wrapper')).toBeInTheDocument();
    });

    it('should render default styles on wrapper', () => {
      const screen = render(<Img src="path/img.jpg" />);

      expect(screen.getByTestId('wrapper')).toHaveStyle({
        position: 'relative', overflow: 'hidden'
      });
    });

    it('should allow to override wrapper styles', () => {
      const screen = render(<Img src="path/img.jpg" style={{ position: 'static' }} />);

      expect(screen.getByTestId('wrapper')).toHaveStyle({
        position: 'static', overflow: 'hidden'
      });
    });

    it('should pass all element attrs to wrapper', () => {
      const screen = render(<Img src="path/img.jpg" className="test" />);

      expect(screen.getByTestId('wrapper')).toHaveClass('test');
    });

    it('should allow to set bgColor', () => {
      const screen = render(<Img src="path/img.jpg" bgColor="red" />);

      expect(screen.getByTestId('wrapper')).toHaveStyle({ 'background-color': 'red' });
    });

    it('should preserve aspectRatio', () => {
      const screen = render(<Img src="path/img.jpg" aspectRatio={1 / 5} />);

      expect(screen.getByTestId('wrapper')).toHaveStyle({ 'padding-bottom': '20%' });
    });

    it('should set paddingBottom of a square if no value to calculate from', () => {
      const screen = render(<Img src="path/img.jpg" />);

      expect(screen.getByTestId('wrapper')).toHaveStyle({ 'padding-bottom': '50%' });
    });
  });

  describe('placeholder', () => {
    beforeAll(() => {
      (window as any).Image = ImageMock;
    });

    it('should render a placeholder image', () => {
      const screen = render(<Img src="img.jpg" placeholderSrc="placeholder.jpg" />);

      ImageMock.triggerLoadOf('placeholder.jpg');

      expect(screen.getByTestId('placeholder')).toBeInTheDocument();
      expect(screen.getByTestId('placeholder').tagName).toBe('IMG');
      expect(screen.getByTestId('placeholder')).toHaveAttribute('src', 'placeholder.jpg');
    });

    it('should render a placeholder with default styles', () => {
      const screen = render(<Img src="img.jpg" placeholderSrc="placeholder.jpg" />);

      ImageMock.triggerLoadOf('placeholder.jpg');

      expect(screen.getByTestId('placeholder')).toHaveStyle({
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: '100%',
        height: 'auto',
        transition: 'opacity 1s linear',
        'z-index': '1',
        filter: 'blur(50px)',
        transform: 'scale(1)',
        opacity: '0.99',
      });
    });

    it('should change opacity when main image loaded', () => {
      const screen = render(<Img src="img.jpg" placeholderSrc="placeholder.jpg" />);

      ImageMock.triggerLoadOf('*');

      expect(screen.getByTestId('placeholder')).not.toHaveStyle({ opacity: '0' });

      (window.requestAnimationFrame as any).mock.runAllAnimationFramesChains();

      expect(screen.getByTestId('placeholder')).toHaveStyle({ opacity: '0' });
    });
  });

  describe('mainImage', () => {
    it('should not load main image at start', () => {
      const screen = render(<Img src="img.jpg" />);

      expect(screen.queryByTestId('img')).not.toBeInTheDocument();

      ImageMock.triggerLoadOf('*');

      expect(screen.queryByTestId('img')).toBeInTheDocument();
      expect(screen.getByTestId('img')).toHaveStyle({
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: '100%',
        height: 'auto',
        transition: 'opacity 1s linear',
        'z-index': '2',
        opacity: '0.1',
      });
    });

    it('should allow passing srcSet, sizes, alt', () => {
      const screen = render(<Img src="img.jpg" srcSet="test-srcSet" sizes="test-sizes" alt="test-alt" />);
      ImageMock.triggerLoadOf('*');

      ['srcSet', 'sizes', 'alt'].forEach(attr => {
        expect(screen.queryByTestId('img')).toHaveAttribute(attr, `test-${attr}`);
      })
    });

    it('should change opacity after image ready', () => {
      const screen = render(<Img src="img.jpg" />);

      ImageMock.triggerLoadOf('*');

      expect(screen.getByTestId('img')).toHaveStyle({ opacity: '0.1' });

      (window.requestAnimationFrame as any).mock.runAllAnimationFramesChains();

      expect(screen.getByTestId('img')).toHaveStyle({ opacity: '1' });
    });
  });

  describe('loadOnScreen', () => {
    let ImgInternal
    beforeAll(() => {
      jest.resetModules();
      (global as any).IntersectionObserver = IntersectionObserverMock

      ImgInternal = require('../src/img').Img
    });

    it('should change opacity after image ready', () => {
      const screen = render(<ImgInternal src="img.jpg" loadOnScreen={true} />);

      expect(screen.queryByTestId('img')).not.toBeInTheDocument();

      IntersectionObserverMock.triggerInteceptionOn('*')
      ImageMock.triggerLoadOf('*');

      expect(screen.getByTestId('img')).toBeInTheDocument();
    });
  });
});
