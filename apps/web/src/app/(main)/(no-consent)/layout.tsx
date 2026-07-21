export default function NoConsentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="appFrame">
      <div className="appContent">{children}</div>
    </div>
  );
}
