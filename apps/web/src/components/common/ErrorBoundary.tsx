import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('IGNIS Uncaught Application Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 my-8">
          <div className="max-w-xl w-full bg-[#0A0E1A]/95 border border-rose-500/30 rounded-2xl p-8 shadow-2xl shadow-rose-950/40 text-center backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk',sans-serif]">
              Telemetry Diagnostic Interrupted
            </h2>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              An unexpected exception occurred while rendering this scientific view. The telemetry pipeline has been isolated to prevent corruption.
            </p>

            {this.state.error && (
              <div className="bg-black/60 border border-slate-800 rounded-xl p-3 mb-6 text-left overflow-x-auto max-h-36">
                <p className="text-xs font-mono text-rose-400 font-medium">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] font-mono text-slate-400 mt-2">
                    {this.state.errorInfo.componentStack.trim().slice(0, 300)}...
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                icon={<RefreshCw className="h-4 w-4" />}
                onClick={this.handleReset}
              >
                Reload Component
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Home className="h-4 w-4" />}
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Return to Hub
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
