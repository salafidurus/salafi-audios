import { Component, type ReactNode } from "react";
import { Text, ScrollView } from "react-native";
import { Providers } from "../core/providers";
import { Slot } from "expo-router";

// NOTE: The route-level `export function ErrorBoundary` was removed temporarily
// so render errors propagate up to DiagnosticBoundary (which has componentDidCatch
// and can surface the component stack). Restore it after the bug is fixed.

type DiagState = { error: Error | null; stack: string | null };

class DiagnosticBoundary extends Component<{ children: ReactNode }, DiagState> {
  state: DiagState = { error: null, stack: null };

  static getDerivedStateFromError(error: Error): DiagState {
    return { error, stack: null };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // Full component stack to Metro console so we can locate the undefined element.
    // eslint-disable-next-line no-console
    console.error(
      "[DiagnosticBoundary] Render error:",
      error?.message,
      "\nComponent stack:",
      info?.componentStack ?? "(none)",
    );
    this.setState({ stack: info?.componentStack ?? null });
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView
          style={{ flex: 1, backgroundColor: "#111" }}
          contentContainerStyle={{ padding: 24 }}
        >
          <Text style={{ color: "#ff6b6b", fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
            Render error caught
          </Text>
          <Text selectable style={{ color: "#fff", marginBottom: 12 }}>
            {this.state.error.message}
          </Text>
          <Text style={{ color: "#aaa", marginBottom: 4 }}>Component stack:</Text>
          <Text selectable style={{ color: "#ffd66b", fontFamily: "GeistMono-Regular" }}>
            {this.state.stack ?? "(no component stack)"}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  return (
    <DiagnosticBoundary>
      <Providers>
        <Slot />
      </Providers>
    </DiagnosticBoundary>
  );
}
