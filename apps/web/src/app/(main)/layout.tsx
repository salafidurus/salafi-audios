import { Footer, Sidebar, TopAuthStrip } from "@sd/feature-navigation";
import { MiniPlayerWeb } from "@sd/feature-playback";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="appFrame">
      <div className="appShell">
        <Sidebar />
        <div className="appMain">
          <TopAuthStrip />
          <div className="appContent">{children}</div>
          <MiniPlayerWeb />
          <Footer />
        </div>
      </div>
    </div>
  );
}
