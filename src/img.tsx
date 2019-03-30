import * as React from 'react'
import * as PropsTypes from 'prop-types'
import { Bare, If } from 'react-deco'
import { observe } from './observer'
import { HTMLAttributes } from 'react';

// https://jmperezperez.com/medium-image-progressive-loading-placeholder/
// https://code.fb.com/android/the-technology-behind-preview-photos/
// https://medium.com/front-end-hacking/progressive-image-loading-and-intersectionobserver-d0359b5d90cd

const imgStyle = {
  position: 'absolute' as 'absolute',
  opacity: 0,
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
  ...imgStyle,
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

          <If test={(src || srcSet) && cmp.state.loaded} then={() =>
            <img key='img'
              src={src}
              srcSet={srcSet}
              sizes={sizes}
              style={{ ...imgStyle, opacity: 1 }}
              alt={alt}
            />
          } />

          <If test={placeholderSrc && cmp.state.placeholderLoaded} then={() =>
            <img key='placeholder'
              src={placeholderSrc}
              style={{ ...imgPlaceholderStyle, opacity: cmp.state.loaded ? 0 : 1 }}
            />
          } />

          <div key='background'
            style={{
              ...backgroundStyle,
              backgroundColor: bgColor,
              opacity: (cmp.state.loaded || cmp.state.placeholderLoaded) ? 0 : 1
            }}
          />

          <div key='preserver' style={{
            paddingBottom: (
              getPreserverPaddingBottom(Number(props.aspectRatio)) ||
              getPreserverPaddingBottom(Number(cmp.state.aspectRatio)) ||
              getPreserverPaddingBottom(.5)
            )
          }} />
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
    loaded: false
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
      loaded: true,
      aspectRatio: getImageAspectRatio(img)
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
