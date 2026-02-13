type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="catalog-header-panel">
      <p className="catalog-header-kicker">Read-only catalog</p>
      <h1 className="catalog-title">{title}</h1>
      {subtitle ? <p className="catalog-subtitle">{subtitle}</p> : null}
    </header>
  );
}
