import * as React from 'react'
import * as PropsTypes from 'prop-types'
import { Bare, Switch, When, If } from 'react-deco'
import { observe } from './observer'
import { HTMLAttributes } from 'react';

const observedElStyle = {
  display: 'inline-block',
  minHeight: '1px',
  minWidth: '1px'
}

export function Defer(props: HTMLAttributes<any> & {
  render: any
  renderPlaceholder?: any
  loadOnScreen?: boolean
}) {
  const observedDivElProps = { ...{ style: observedElStyle }, ...props }
  delete observedDivElProps.render
  delete observedDivElProps.renderPlaceholder
  delete observedDivElProps.loadOnScreen

  return (
    <Bare
      constructor={constructor}
      didMount={(cmp) => didMount(cmp, props)}
      willUnmount={willUnmount}
      render={(cmp) =>
        <Switch>
          <When test={cmp.state.componentToRender} render={cmp.state.componentToRender} />
          <When test={true} render={() =>
            <div {...observedDivElProps}
              data-observed
              ref={(observedElRef) => attachObservedElRef(cmp, observedElRef)}>
              <If test={cmp.state.loading} then={() =>
                (loadComponent(cmp, props), props.renderPlaceholder && props.renderPlaceholder())
              } />
            </div>
          } />
        </Switch>
      }
    />
  )
}

(Defer as any).propTypes = {
  render: PropsTypes.any.isRequired,
  renderPlaceholder: PropsTypes.any,
  loadOnScreen: PropsTypes.bool
}

function constructor(cmp) {
  cmp.state = {
    loading: false,
    componentToRender: false
  }
}

function didMount(cmp, props) {
  if (props.loadOnScreen) {
    observe(cmp.observedElRef)
  } else {
    cmp.setState({ loading: true })
  }
}

function willUnmount(cmp) {
  cmp.observedElRef = null
}

function attachObservedElRef(cmp, observedElRef) {
  if (observedElRef) {
    cmp.observedElRef = observedElRef
    observedElRef.onIntersection = () => {
      cmp.setState({ loading: true })
    }
  } else {
    cmp.observedElRef = null
  }
}

function loadComponent(cmp, props) {
  const result = props.render()
  if (result.then) {
    result.then((mod) => {
      let cmpToRender

      if (mod) {
        if (typeof mod === 'function') {
          cmpToRender = mod
        } else if (typeof mod.default === 'function') {
          cmpToRender = mod.default
        }
      }

      return cmp.setState({
        loading: false,
        componentToRender: cmpToRender
      })
    })
  } else {
    setTimeout(() => {
      cmp.setState({
        loading: false,
        componentToRender: result
      })
    }, 0)
  }
}
