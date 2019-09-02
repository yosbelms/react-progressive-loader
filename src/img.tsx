import * as React from 'react'
import * as PropsTypes from 'prop-types'
import { Bare, If } from 'react-deco'
import { observe } from './observer'
import { HTMLAttributes } from 'react'

// https://jmperezperez.com/medium-image-progressive-loading-placeholder/
// https://code.fb.com/android/the-technology-behind-preview-photos/
// https://medium.com/front-end-hacking/progressive-image-loading-and-intersectionobserver-d0359b5d90cd

const rAF = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : setTimeout
const afterAF = (fn: any, aFNumber: number = 0) => {
  rAF(() => aFNumber === 0 ? fn() : afterAF(fn, aFNumber - 1))
}

const imgStyle = {
  position: 'absolute' as 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: 'auto',
  transition: 'opacity 1s linear'
}

const imgPlaceholderStyle = {
  ...imgStyle,
  filter: 'blur(50px)',
  transform: 'scale(1)'
}

const wrapperStyle = {
  position: 'relative' as 'relative',
  overflow: 'hidden'
}

const backgroundStyle = {
  transition: 'opacity 1s linear',
  width: '100%',
  height: '100%',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat'
}

const defaultBgColor = '#f6f6f6'

export function Img(props: HTMLAttributes<any> & {
  src?: string
  srcSet?: string
  sizes?: string
  alt?: string
  placeholderSrc?: string
  bgColor?: string
  aspectRatio?: number
  loadOnScreen?: boolean
}) {
  const { src, srcSet, placeholderSrc, alt, sizes } = props
  const wrapperProps = { ...props }
  delete wrapperProps.src
  delete wrapperProps.srcSet
  delete wrapperProps.sizes
  delete wrapperProps.alt
  delete wrapperProps.placeholderSrc
  delete wrapperProps.bgColor
  delete wrapperProps.aspectRatio
  delete wrapperProps.loadOnScreen

  const bgColor = props.bgColor || defaultBgColor

  return (
    <Bare
      constructor={constructor}
      didMount={(cmp) => didMount(cmp, props)}
      willUnmount={willUnmount}
      render={(cmp) =>
        <div {...wrapperProps}
          data-wrapper
          style={{ ...wrapperStyle, ...wrapperProps.style }}
          ref={(ref) => attachWrapperElRef(cmp, props, ref)}>

          <If test={(src || srcSet) && cmp.state.imageLoaded} then={() =>
            <img key='img'
              src={src}
              srcSet={srcSet}
              sizes={sizes}
              style={{ ...imgStyle, opacity: cmp.state.imageReady ? 1 : .1 }}
              alt={alt}
            />
          } />

          <If test={placeholderSrc && cmp.state.placeholderLoaded} then={() =>
            <img key='placeholder'
              src={placeholderSrc}
              style={{ ...imgPlaceholderStyle, opacity: cmp.state.imageReady ? 0 : .99 }}
            />
          } />

          <div key='background'
            style={{
              ...backgroundStyle,
              backgroundColor: bgColor,
              opacity: (cmp.state.imageReady || cmp.state.placeholderLoaded) ? 0 : .99,
              paddingBottom: (
                getPreserverPaddingBottom(Number(props.aspectRatio)) ||
                getPreserverPaddingBottom(Number(cmp.state.aspectRatio)) ||
                getPreserverPaddingBottom(.5)
              )
            }}
          />

        </div>
      } />
  )
}

(Img as any).propTypes = {
  src: PropsTypes.string,
  srcSet: PropsTypes.string,
  sizes: PropsTypes.string,
  alt: PropsTypes.string,
  placeholderSrc: PropsTypes.string,
  bgColor: PropsTypes.string,
  aspectRatio: PropsTypes.number,
  loadOnScreen: PropsTypes.bool
}

function constructor(cmp: any) {
  cmp.state = {
    placeholderLoaded: false,
    imageLoaded: false,
    imageReady: false,
  }
}

function beginImgLoad(cmp: any, props: { [key: string]: any }) {
  if (props.placeholderSrc) {
    loadImg(props.placeholderSrc, null, null, (img: HTMLImageElement) => {
      cmp.setState({
        placeholderLoaded: true,
        aspectRatio: getImageAspectRatio(img)
      })
    })
  }

  loadImg(props.src, props.srcSet, props.sizes, (img: HTMLImageElement) => {
    cmp.setState({
      imageLoaded: true,
      aspectRatio: getImageAspectRatio(img),
    }, () => {
      // nothing fancy, just a trick
      // we set imageReady to true after 5 timeframes,
      // to let the browser to render big images
      // and "try" guarantee smooth transition
      // Anyway, this may not work for very big images
      afterAF(() => cmp.setState({ imageReady: true }), 5)
    })
  })
}

function attachWrapperElRef(cmp: any, props: { [key: string]: any }, ref: HTMLDivElement) {
  if (ref) {
    (ref as any).onIntersection = () => beginImgLoad(cmp, props)
    cmp.domRef = ref
  } else {
    cmp.domRef = null
  }
}

function didMount(cmp: any, props: { [key: string]: any }) {
  if (props.loadOnScreen) {
    observe(cmp.domRef)
  } else {
    beginImgLoad(cmp, props)
  }
}

function willUnmount(cmp: any) {
  cmp.observedElRef = null
}

function getImageAspectRatio(img: HTMLImageElement) {
  return img.naturalHeight / img.naturalWidth
}

function getPreserverPaddingBottom(aspectRatio: number) {
  const ar = Number(aspectRatio)
  return isNaN(ar) ? 0 : aspectRatio * 100 + '%'
}

function loadImg(src: string, srcSet: string, sizes: string, onLoad: (...args: any[]) => void) {
  const img = new Image()
  img.onload = () => onLoad(img)
  img.src = src
  if (typeof srcSet === 'string') {
    img.srcset = srcSet
  }
  if (typeof sizes === 'string') {
    img.sizes = sizes
  }
}
