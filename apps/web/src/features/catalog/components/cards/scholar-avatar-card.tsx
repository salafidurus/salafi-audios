import Link from "next/link";

type ScholarAvatarCardProps = {
  href?: string;
  name: string;
  subtitle?: string;
  featured?: boolean;
};

export function ScholarAvatarCard({
  href,
  name,
  subtitle,
  featured = false,
}: ScholarAvatarCardProps) {
  const initial = name.charAt(0).toUpperCase();

  const content = (
    <>
      <div className={`home-scholar-avatar${featured ? " is-featured" : ""}`}>{initial}</div>
      <p className="home-scholar-name">{name}</p>
      {subtitle ? <p className="home-scholar-subtitle">{subtitle}</p> : null}
    </>
  );

  if (!href) {
    return <article className="home-scholar-card is-static">{content}</article>;
  }

  return (
    <Link href={href} className="home-scholar-card">
      {content}
    </Link>
  );
}
