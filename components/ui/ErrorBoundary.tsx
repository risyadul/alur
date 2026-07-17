import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type Props = {
  fallback: ReactNode;
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * PRD §10 — kegagalan inisialisasi kanvas tidak boleh mengosongkan layar.
 * Class component adalah satu-satunya bentuk error boundary yang didukung React 19.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Jangan telan diam-diam: crash tak terduga tetap harus terlihat saat debug.
    console.error("Kanvas peta gagal dirender:", error, info.componentStack);
  }

  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
