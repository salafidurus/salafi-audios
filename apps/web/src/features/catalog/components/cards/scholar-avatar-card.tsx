import Link from "next/link";
import "./scholar-avatar-card.css";

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
      <div className={featured ? "avatarFeatured" : "avatar"}>{initial}</div>
      <p className="name">{name}</p>
      {subtitle ? <p className="subtitle">{subtitle}</p> : null}
    </>
  );

  if (!href) {
    return <article className="cardStatic">{content}</article>;
  }

  return (
    <Link href={href} className="card">
      {content}
    </Link>
  );
}
