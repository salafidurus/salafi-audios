import Link from "next/link";

type EntityCardProps = {
  href: string;
  title: string;
  description?: string;
  meta?: string;
};

export function EntityCard({ href, title, description, meta }: EntityCardProps) {
  return (
    <li className="catalog-card-item">
      <Link href={href} className="catalog-entity-card">
        <h3 className="catalog-card-title">{title}</h3>
        {description ? <p className="catalog-card-description">{description}</p> : null}
        <div className="catalog-card-footer">
          {meta ? (
            <p className="catalog-card-meta">{meta}</p>
          ) : (
            <span className="catalog-card-meta">Catalog page</span>
          )}
          <span className="catalog-card-cta">Open</span>
        </div>
      </Link>
    </li>
  );
}
