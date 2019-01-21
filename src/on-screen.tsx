import * as React from 'react'
import * as PropsTypes from 'prop-types'
import { Bare } from 'react-deco'
import { observe, ElementWithIntersection } from './observer'

const observedElStyle = {
  display: 'inline-block',
  minHeight: '1px',
  minWidth: '1px'
}

export function OnScreen(props: {
  execute: (...args: any[]) => any
  //once
}) {
  return (
    <Bare
      constructor={(cmp) => {
        cmp.state = {
          notified: false,
          execute: props.execute
        }
      }}

      didMount={(cmp) => {
        observe(cmp.observedElRef)
      }}

      willUnmount={(cmp) => {
        cmp.observedElRef = null
      }}

      render={(cmp) =>
        <div {...observedElStyle}
          data-observed
          ref={(observedElRef: any) => {
            if (observedElRef) {
              cmp.observedElRef = observedElRef;
              (observedElRef as ElementWithIntersection).onIntersection = () => {
                cmp.setState({ loading: true })
              }
            } else {
              cmp.observedElRef = null
            }
          }}
        />
      }
    />
  )
}

(OnScreen as any).propTypes = {
  execute: PropsTypes.func,
}