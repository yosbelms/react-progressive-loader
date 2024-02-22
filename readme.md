# React Progressive Loader

Defer the load of non-critical images and components if they are off-screen.

This library makes possible to progressively load images, just like [Medium](https://medium.com) does, and React components only when the user is ready to consume the content. Additionaly, take component based code splitting for free. Two at the price of one.

Lazy Loading Images: https://developers.google.com/web/fundamentals/performance/lazy-loading-guidance/images-and-video/


* [Installation](#installation)
* [Usage](#usage)
* [Components](#components)
  * [Defer](#defer)
  * [Img](#img)

## Installation

```
// with yarn
yarn add react-progressive-loader

// with npm
npm install react-progressive-loader
```

## Usage

```ts
// ES2015+ and TS
import { Defer, Img } from 'react-progressive-loader'
```

## Components

### Defer

Defers the loading of a React component

Props:
* `render`: The content to render
* `renderPlaceholder`: The content to render while the content is loading
* `loadOnScreen`: Load the content only when the area it is going to be rendered is visible for the user

If case the React component is `default-exported` in `./comp` module

```jsx
<Defer
  render={() => import('./comp')}
  renderPlaceholder={() => <div>Loading...</div>}
/>
```

If the component is not `default-exported`

```jsx
// './comp.jsx'
export const MyComp = () => 'Loaded!'

// './app.jsx'
<Defer
  render={() => import('./comp').then(({MyComp}) => <MyComp />)}
/>
```

The `render` prop can also be a React element

```jsx
<Defer
  render={() => <img src='my-img.png'></img>}
  renderPlaceholder={() => <div>Loading...</div>}
/>
```

Load the content only when it is on-screen

```jsx
<Defer
  render={() => <img src='my-img.png'></img>}
  renderPlaceholder={() => <div>Loading...</div>}
  loadOnScreen
/>
```

### Img

Progressively load images. This component makes a smooth animated transition in the following order:

`[Background]->[Placeholder]->[Content]`

Props:
* `src`: The source of the content
* `placeholderSrc`: The source of the image that is going to be showed while the content is loading
* `srcSet`: The source of the content (see: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-srcset)
* `sizes`: A set of source sizes (see: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-sizes)
* `bgColor`: The color of the backgroud that is going to be showed while the placeholder is loading
* `aspectRatio`: A static aspect ratio for image, placeholder, and background color. The aspect ratio provided must be calculated in the following way: `height / width`
* `loadOnScreen`: Load the content only when the area it is going to be rendered is visible for the user
* `alt`: Alternative text (see: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-alt)

_Any other prop (not listed here) passed to this components will be passed down to the wrapper `div`_

Basic usage

```jsx
<Img
  src='image.jpeg'
  placeholderSrc='image-placeholder.jpeg'
/>
```

Transitioning only between background and content. Sometimes you may want to transit only from background to content by finding the dominant color of the image and assigning it to `bgColor`. This strategy is used by [Google](https://www.google.com) image search.

```jsx
<Img
  bgColor='#FA8054'
  src='image.jpeg'
/>
```

Load the content only when it is on-screen

```jsx
<Img
  src='image.jpeg'
  placeholderSrc='image-placeholder.jpeg'
  loadOnScreen
/>
```

_This library uses IntersectionObserver API, for wide browser compatibility consider to add a [polyfill](https://github.com/w3c/IntersectionObserver/tree/master/polyfill)_

Published under MIT Licence

(c) Yosbel Marin 2018
