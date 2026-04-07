import { Footer, Sidebar, TopAuthStrip } from "@sd/feature-navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="appFrame">
      <div className="appShell">
        <Sidebar />
        <div className="appMain">
          <TopAuthStrip />
          <div className="appContent">{children}</div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
