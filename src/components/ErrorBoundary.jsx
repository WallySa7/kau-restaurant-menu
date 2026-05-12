import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
    window.location.assign('/');
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="card max-w-md w-full text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-500 mb-6">
              An unexpected error occurred. Try reloading the page.
            </p>
            <pre className="text-left bg-gray-50 p-3 rounded text-xs text-gray-700 overflow-auto max-h-32 mb-6">
              {String(this.state.error?.message ?? this.state.error)}
            </pre>
            <button onClick={this.handleReset} className="btn-primary">
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
