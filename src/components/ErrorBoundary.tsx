import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Suppress AbortError from React Router
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      console.debug('Navigation aborted (suppressed)');
      return;
    }
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return null; // Silently recover
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
