import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="max-w-md text-center space-y-4">
            <div className="text-6xl">😿</div>
            <h1 className="text-2xl font-bold text-destructive">Algo deu errado</h1>
            <p className="text-muted-foreground">{this.state.error?.message || 'Erro desconhecido'}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
