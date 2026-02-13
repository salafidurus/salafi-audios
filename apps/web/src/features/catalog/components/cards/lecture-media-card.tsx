import Link from "next/link";
import "./lecture-media-card.css";

type LectureMediaCardProps = {
  href?: string;
  title: string;
  subtitle: string;
  tag?: string;
  duration?: string;
  coverImageUrl?: string;
};

export function LectureMediaCard({
  href,
  title,
  subtitle,
  tag,
  duration,
  coverImageUrl,
}: LectureMediaCardProps) {
  const content = (
    <>
      <div
        className="cover"
        style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})` } : undefined}
      >
        {duration ? <span className="duration">{duration}</span> : null}
      </div>
      <p className="title">{title}</p>
      <p className="subtitle">{subtitle}</p>
      {tag ? <span className="tag">{tag}</span> : null}
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
