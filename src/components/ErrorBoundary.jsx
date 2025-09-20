import { Component } from "react";
import { error } from '../lib/logger';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    error("ErrorBoundary caught error:", error);
    error("Error info:", errorInfo);
    error("Component stack:", errorInfo.componentStack);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center bg-red-50 border border-red-200 rounded-lg m-4">
          <h2 className="text-xl font-semibold text-red-800">Something went wrong.</h2>
          <p className="mt-2 text-red-600">Please check the console for details.</p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-red-700 font-medium">Error Details</summary>
              <pre className="mt-2 text-sm bg-red-100 p-2 rounded overflow-auto">
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}