import Link from "next/link";

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
        className="home-media-cover"
        style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})` } : undefined}
      >
        {duration ? <span className="home-media-duration">{duration}</span> : null}
      </div>
      <p className="home-media-title">{title}</p>
      <p className="home-media-subtitle">{subtitle}</p>
      {tag ? <span className="home-media-tag">{tag}</span> : null}
    </>
  );

  if (!href) {
    return <article className="home-media-card is-static">{content}</article>;
  }

  return (
    <Link href={href} className="home-media-card">
      {content}
    </Link>
  );
}
