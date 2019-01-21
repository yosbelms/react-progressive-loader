export type ElementWithIntersection = HTMLElement & {
  onIntersection: () => void
}

export const intersectionObserver = (
  typeof window !== 'undefined' &&
  typeof IntersectionObserver === 'function' &&
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const domEl = entry.target as ElementWithIntersection
        domEl.onIntersection && domEl.onIntersection()
        intersectionObserver.unobserve(domEl)
      }
    })
  })
)

export function observe(domEl: Element) {
  if (intersectionObserver) {
    intersectionObserver.observe(domEl)
  } else {
    throw new Error('This browser doesn\'t support InterceptionObserver, consider to add a pollyfill')
  }
}