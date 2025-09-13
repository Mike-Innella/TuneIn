import { Component } from "react";

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() { 
    return { hasError: true }; 
  }
  
  componentDidCatch(err, info) { 
    console.error("ErrorBoundary:", err, info); 
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold">Something went wrong.</h2>
          <p className="mt-2 opacity-80">Please try refreshing the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}