import { Footer } from "../../../features/navigation/components/footer/footer";
import { Sidebar } from "../../../features/navigation/components/sidebar/sidebar";
import { TopAuthStrip } from "../../../features/navigation/components/top-auth-strip/top-auth-strip";
import { MiniPlayerWeb } from "@sd/feature-playback";
import { ComponentErrorBoundary } from "../../../shared/components/error-boundary/ComponentErrorBoundary";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="appFrame">
      <div className="appShell">
        <ComponentErrorBoundary fallback={null}>
          <Sidebar />
        </ComponentErrorBoundary>
        <div className="appMain">
          <ComponentErrorBoundary fallback={null}>
            <TopAuthStrip />
          </ComponentErrorBoundary>
          <div className="appContent">{children}</div>
          <MiniPlayerWeb />
          <Footer />
        </div>
      </div>
    </div>
  );
}
