import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  /** What to show instead of the failed subtree. `null` hides it silently. */
  fallback: ReactNode
  children: ReactNode
}

interface State {
  failed: boolean
}

/**
 * Contains a rendering failure to the part of the page that caused it.
 * Without this, one error anywhere (e.g. a PC with WebGL disabled, a chunk
 * that fails to download, a malformed data row) unmounts the whole app and
 * leaves a blank page.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[NBG] contained render error:', error, info.componentStack)
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
