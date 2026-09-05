/** Documents this module's responsibility and public boundary. */
"use client";

import Link from "next/link";
import { useState } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

import styles from "./support.screen.module.css";

/** Renders localized support FAQs and the support-request form. */
export function SupportScreen() {
  const { t } = useTranslation();
  const [category, setCategory] = useState("technical");
  const faqs = [
    {
      question: t("support.faq.whatIs.q"),
      answer: t("support.faq.whatIs.a"),
    },
    {
      question: t("support.faq.saveLectures.q"),
      answer: t("support.faq.saveLectures.a"),
    },
    {
      question: t("support.faq.offline.q"),
      answer: t("support.faq.offline.a"),
    },
    {
      question: t("support.faq.followScholar.q"),
      answer: t("support.faq.followScholar.a"),
    },
  ];

  return (
    <ScreenView backgroundVariant="mixedWash">
      <div className={styles.container}>
        <PageHeader title={t("support.title", "Support")} subtitle={t("support.subtitle")} />

        <div className={styles.layout}>
          <Card className={styles.formCard}>
            <CardHeader className={styles.sectionHeader}>
              <p className={styles.eyebrow}>{t("support.formEyebrow")}</p>
              <CardTitle id="support-form-heading" className={styles.sectionTitle}>
                {t("support.formSection", "Report an issue")}
              </CardTitle>
              <CardDescription>{t("support.formDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form className={styles.form}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="support-name">{t("support.form.name")}</FieldLabel>
                    <Input id="support-name" name="name" autoComplete="name" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="support-email">{t("support.form.email")}</FieldLabel>
                    <Input
                      id="support-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="support-category">{t("support.form.category")}</FieldLabel>
                    <Select name="category" value={category} onValueChange={setCategory}>
                      <SelectTrigger id="support-category" aria-label={t("support.form.category")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">{t("support.form.technical")}</SelectItem>
                        <SelectItem value="content">{t("support.form.content")}</SelectItem>
                        <SelectItem value="account">{t("support.form.account")}</SelectItem>
                        <SelectItem value="other">{t("support.form.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="support-subject">{t("support.form.subject")}</FieldLabel>
                    <Input id="support-subject" name="subject" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="support-message">{t("support.form.message")}</FieldLabel>
                    <Textarea id="support-message" name="message" required />
                    <FieldDescription>{t("support.form.messageHint")}</FieldDescription>
                  </Field>
                </FieldGroup>
                <Button type="submit" disabled>
                  {t("support.form.submit", "Send to maintainers")}
                </Button>
                <p className={styles.formNotice}>{t("support.form.comingSoon")}</p>
              </form>
            </CardContent>
          </Card>

          <Card className={styles.faqCard}>
            <CardHeader className={styles.sectionHeader}>
              <p className={styles.eyebrow}>{t("support.faqEyebrow")}</p>
              <CardTitle id="support-faq-heading" className={styles.sectionTitle}>
                {t("support.faqSection", "Frequently Asked Questions")}
              </CardTitle>
              <CardDescription>{t("support.faqDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className={styles.accordion}>
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`faq-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className={styles.contactCard}>
            <CardHeader>
              <p className={styles.eyebrow}>{t("support.contactEyebrow")}</p>
              <CardTitle id="support-contact-heading" className={styles.sectionTitle}>
                {t("support.contactSection", "Contact Us")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={styles.contactCopy}>{t("support.contactCopy")}</p>
              <a className={styles.emailLink} href="mailto:support@salafidurus.com">
                support@salafidurus.com
              </a>
              <div className={styles.legalLinks}>
                <span>{t("support.legalPrompt")}</span>
                <Link href="/privacy">{t("privacyPolicy", "Privacy Policy")}</Link>
                <Link href="/terms-of-use">{t("termsOfService", "Terms of Use")}</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScreenView>
  );
}
