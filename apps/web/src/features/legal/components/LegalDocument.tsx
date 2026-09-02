/** Renders a localized legal document supplied by the framework-neutral legal domain package. */
"use client";

import type {
  LegalBlock,
  LegalDocument as LegalDocumentModel,
  LegalLocale,
} from "@sd/domain-legal";

import { routes } from "@sd/core-contracts";
import Link from "next/link";

import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

import styles from "../screens/legal-screens.module.css";

/** Renders one shared legal document with web semantics and responsive styling. */
export function LegalDocument({
  document,
  locale = "en",
}: {
  document: LegalDocumentModel;
  locale?: LegalLocale;
}) {
  return (
    <ScreenView>
      <article
        id="legal-document"
        className={styles.container}
        aria-labelledby={`${document.id}-title`}
      >
        <h1 id={`${document.id}-title`} className={styles.title}>
          {document.title[locale]}
        </h1>
        <p className={styles.lastUpdated}>Last updated: {document.updatedAt}</p>
        {document.intro[locale].map((paragraph) => (
          <p className={styles.introduction} key={paragraph}>
            {paragraph}
          </p>
        ))}
        {document.sections.map((section) => (
          <section className={styles.section} id={section.id} key={section.id}>
            <h2 className={styles.sectionTitle}>{section.heading[locale]}</h2>
            {section.blocks[locale].map((block, index) => (
              <LegalBlockView block={block} key={`${section.id}-${block.type}-${index}`} />
            ))}
          </section>
        ))}
      </article>
    </ScreenView>
  );
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.type === "subheading") return <h3 className={styles.subsectionTitle}>{block.text}</h3>;
  if (block.type === "paragraph") return <p className={styles.paragraph}>{block.text}</p>;
  if (block.type === "bullets")
    return (
      <ul className={styles.bulletList}>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  if (block.type === "definitions")
    return (
      <ul className={styles.definitionList}>
        {block.items.map((item) => (
          <li key={item.term}>
            <strong>{item.term}:</strong> {item.definition}
          </li>
        ))}
      </ul>
    );
  if (block.href.kind === "internal")
    return (
      <p className={styles.paragraph}>
        <Link className={styles.link} href={routes.support}>
          {block.text}
        </Link>
      </p>
    );
  return (
    <p className={styles.paragraph}>
      <a href={block.href.url} target="_blank" rel="noopener noreferrer">
        {block.text}
      </a>
    </p>
  );
}
