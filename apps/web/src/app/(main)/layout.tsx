import { Footer } from "@/features/navigation/components/footer/footer";
import { Sidebar } from "@/features/navigation/components/sidebar/sidebar";
import { TopAuthStrip } from "@/features/navigation/components/top-auth-strip/top-auth-strip";
import { MiniPlayer } from "@/features/audio";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="appFrame">
      <div className="appShell">
        <Sidebar />
        <div className="appMain">
          <TopAuthStrip />
          <div className="appContent">{children}</div>
          <MiniPlayer />
          <Footer />
        </div>
      </div>
    </div>
  );
}
