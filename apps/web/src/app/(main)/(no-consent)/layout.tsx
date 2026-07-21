export default function NoConsentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="appFrame">
      <div className="appNoConsentShell">
        <div className="appNoConsentContent">{children}</div>
      </div>
    </div>
  );
}
