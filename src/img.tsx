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
  src: string
  placeholderSrc?: string
  bgColor?: string
  aspectRatio: number
  loadOnScreen?: boolean
}) {
  const { src, placeholderSrc } = props
  const wrapperProps = { ...props }
  delete wrapperProps.src
  delete wrapperProps.placeholderSrc
  delete wrapperProps.bgColor
  delete wrapperProps.loadOnScreen
  delete wrapperProps.aspectRatio

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

          <If test={src && cmp.state.loaded} then={() =>
            <img key='img'
              src={src}
              style={{ ...imgStyle, opacity: 1 }}
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
  src: PropsTypes.string.isRequired,
  placeholderSrc: PropsTypes.string,
  bgColor: PropsTypes.string,
  loadOnScreen: PropsTypes.bool
}

function constructor(cmp) {
  cmp.state = {
    placeholderLoaded: false,
    loaded: false
  }
}

function beginImgLoad(cmp, props) {
  if (props.placeholderSrc) {
    loadImg(props.placeholderSrc, (img: HTMLImageElement) => {
      cmp.setState({
        placeholderLoaded: true,
        aspectRatio: getImageAspectRatio(img)
      })
    })
  }

  loadImg(props.src, (img: HTMLImageElement) => {
    cmp.setState({
      loaded: true,
      aspectRatio: getImageAspectRatio(img)
    })
  })
}

function attachWrapperElRef(cmp, props, ref) {
  if (ref) {
    cmp.domRef = ref
    ref.onIntersection = () => beginImgLoad(cmp, props)
  } else {
    cmp.domRef = null
  }
}

function didMount(cmp, props) {
  if (props.loadOnScreen) {
    observe(cmp.domRef)
  } else {
    beginImgLoad(cmp, props)
  }
}

function willUnmount(cmp) {
  cmp.observedElRef = null
}

function getImageAspectRatio(img: HTMLImageElement) {
  return img.naturalHeight / img.naturalWidth
}

function getPreserverPaddingBottom(aspectRatio) {
  const ar = Number(aspectRatio)
  return isNaN(ar) ? 0 : aspectRatio * 100 + '%'
}

function loadImg(src, onLoad) {
  const img = new Image()
  img.onload = () => onLoad(img)
  img.src = src
}
