/** Identifies the two localized legal-copy variants that clients may render. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- this alias is the complete supported locale set.
export type LegalLocale = "en" | "ar";

/** Describes a link from legal copy to the native or web Support destination. */
type InternalLegalLink = {
  // oxlint-disable-next-line anti-slop/require-tsdoc -- the literal discriminant names this link kind.
  kind: "internal";
  destination: "support";
};

/** Describes a legal-copy link to an external policy or help page. */
type ExternalLegalLink = {
  // oxlint-disable-next-line anti-slop/require-tsdoc -- the literal discriminant names this link kind.
  kind: "external";
  url: string;
};

/** A renderer-neutral policy block. Links express semantic destinations, not UI components. */
export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "subheading"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "definitions"; items: Array<{ term: string; definition: string }> }
  | {
      type: "link";
      text: string;
      href: InternalLegalLink | ExternalLegalLink;
    };

/** Defines one ordered policy section with localized heading and content blocks. */
export interface LegalSection {
  id: string;
  heading: Record<LegalLocale, string>;
  blocks: Record<LegalLocale, LegalBlock[]>;
}

/** Defines one complete policy document consumed by web and native renderers. */
export interface LegalDocument {
  /** Stable route-facing identifier used to select one published legal document. */
  id: "terms" | "privacy" | "cookies";
  title: Record<LegalLocale, string>;
  intro: Record<LegalLocale, string[]>;
  /** ISO calendar date shown to users so publication changes are auditable. */
  updatedAt: string;
  sections: LegalSection[];
}

/** Identifies the legal entity and public website named by the documents. */
export const legalCompany = {
  name: "Salafi Durus",
  website: "https://www.salafidurus.com",
  country: "Nigeria",
} as const;

/** Records the publication date for each currently published legal document. */
export const legalUpdateDates = {
  terms: "2026-07-21",
  privacy: "2026-07-21",
  cookies: "2026-07-21",
} as const;

const supportLink = (text: string): LegalBlock => ({
  type: "link",
  text,
  href: { kind: "internal", destination: "support" },
});

const commonInterpretation = (policyName: string): LegalBlock[] => [
  { type: "subheading", text: "Interpretation" },
  {
    type: "paragraph",
    text: `The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.`,
  },
  { type: "subheading", text: "Definitions" },
  { type: "paragraph", text: `For the purposes of these ${policyName}:` },
];

const termsSections: LegalSection[] = [
  {
    id: "interpretation",
    heading: { en: "Interpretation and Definitions", ar: "التفسير والتعريفات" },
    blocks: {
      en: [
        ...commonInterpretation("Terms and Conditions"),
        {
          type: "definitions",
          items: [
            {
              term: "Application",
              definition:
                "the software program provided by the Company downloaded by You on any electronic device.",
            },
            {
              term: "Company",
              definition:
                "Salafi Durus, referred to as either the Company, We, Us or Our in these Terms.",
            },
            { term: "Country", definition: "Nigeria." },
            {
              term: "Device",
              definition:
                "any device that can access the Service such as a computer, a cellphone or a digital tablet.",
            },
            { term: "Service", definition: "the Website and the Application." },
            {
              term: "Website",
              definition: "Salafi Durus, accessible from https://www.salafidurus.com.",
            },
            {
              term: "You",
              definition:
                "the individual accessing or using the Service, or the legal entity on whose behalf they do so.",
            },
          ],
        },
      ],
      ar: [{ type: "paragraph", text: "توضح هذه الوثيقة شروط استخدام خدمة سلفي دروس." }],
    },
  },
  {
    id: "acknowledgment",
    heading: { en: "Acknowledgment", ar: "الإقرار" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "These Terms and Conditions govern the use of this Service and the agreement between You and the Company.",
        },
        {
          type: "paragraph",
          text: "Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "يخضع وصولك إلى الخدمة واستخدامك لها لموافقتك على هذه الشروط والالتزام بها.",
        },
      ],
    },
  },
  {
    id: "links",
    heading: { en: "Links to Other Websites", ar: "الروابط إلى مواقع أخرى" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "Our Service may contain links to third-party websites or services that are not owned or controlled by the Company.",
        },
        {
          type: "paragraph",
          text: "The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of third-party websites or services.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "قد تتضمن خدمتنا روابط لمواقع أو خدمات تابعة لجهات أخرى لا تملكها الشركة أو تتحكم بها.",
        },
      ],
    },
  },
  {
    id: "termination",
    heading: { en: "Termination", ar: "الإنهاء" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "We may terminate or suspend Your access immediately, without prior notice or liability, if You breach these Terms and Conditions.",
        },
      ],
      ar: [
        { type: "paragraph", text: "يجوز لنا إنهاء وصولك أو تعليقه فوراً إذا خالفت هذه الشروط." },
      ],
    },
  },
  {
    id: "liability",
    heading: { en: "Limitation of Liability", ar: "حدود المسؤولية" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "To the maximum extent permitted by applicable law, the liability of the Company and its suppliers under these Terms is limited to damages directly caused by a proven breach.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "إلى أقصى حد يسمح به القانون، تقتصر مسؤولية الشركة ومورديها على الأضرار الناتجة مباشرة عن مخالفة مثبتة.",
        },
      ],
    },
  },
  {
    id: "disclaimer",
    heading: { en: "AS IS and AS AVAILABLE Disclaimer", ar: "إخلاء المسؤولية: كما هي ومتاحة" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "The Service is provided to You AS IS and AS AVAILABLE and with all faults and defects without warranty of any kind.",
        },
      ],
      ar: [{ type: "paragraph", text: "تُقدم الخدمة كما هي وكما هي متاحة، دون أي ضمان من أي نوع." }],
    },
  },
  {
    id: "governing-law",
    heading: { en: "Governing Law", ar: "القانون الحاكم" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "The laws of the Country, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service.",
        },
      ],
      ar: [{ type: "paragraph", text: "تخضع هذه الشروط وقواعد استخدامك للخدمة لقوانين الدولة." }],
    },
  },
  {
    id: "disputes",
    heading: { en: "Disputes Resolution", ar: "حل النزاعات" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "If You have any concern or dispute about the Service, You agree to first try to resolve it informally by contacting the Company.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "إذا كان لديك نزاع بشأن الخدمة، توافق أولاً على محاولة حله ودياً بالتواصل مع الشركة.",
        },
      ],
    },
  },
  {
    id: "severability",
    heading: { en: "Severability and Waiver", ar: "قابلية الفصل والتنازل" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "If any provision of these Terms is held to be unenforceable or invalid, the remaining provisions will continue in full force and effect.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "إذا اعتُبر أي حكم من هذه الشروط غير قابل للتنفيذ أو باطلاً، تبقى الأحكام الأخرى سارية.",
        },
      ],
    },
  },
  {
    id: "translation",
    heading: { en: "Translation Interpretation", ar: "تفسير الترجمة" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "The original English text shall prevail in the case of a dispute about a translation.",
        },
      ],
      ar: [{ type: "paragraph", text: "يسود النص الإنجليزي الأصلي عند وجود نزاع حول الترجمة." }],
    },
  },
  {
    id: "changes",
    heading: { en: "Changes to These Terms and Conditions", ar: "التغييرات على هذه الشروط" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "We reserve the right to modify or replace these Terms. Material revisions will receive reasonable advance notice.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "نحتفظ بالحق في تعديل هذه الشروط أو استبدالها، وسنقدم إشعاراً معقولاً بالتغييرات الجوهرية.",
        },
      ],
    },
  },
  {
    id: "contact",
    heading: { en: "Contact Us", ar: "تواصل معنا" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "If you have questions about these Terms and Conditions, contact us by visiting this page on our website:",
        },
        supportLink("Support"),
      ],
      ar: [
        {
          type: "paragraph",
          text: "إذا كانت لديك أسئلة حول هذه الشروط، تواصل معنا عبر صفحة الدعم:",
        },
        supportLink("الدعم"),
      ],
    },
  },
];

const privacySections: LegalSection[] = [
  {
    id: "interpretation",
    heading: { en: "Interpretation and Definitions", ar: "التفسير والتعريفات" },
    blocks: {
      en: [
        ...commonInterpretation("Privacy Policy"),
        {
          type: "definitions",
          items: [
            {
              term: "Account",
              definition: "a unique account created for You to access Our Service.",
            },
            {
              term: "Application",
              definition: "the Salafi Durus software program provided by the Company.",
            },
            {
              term: "Company",
              definition: "Salafi Durus, referred to as the Company, We, Us or Our.",
            },
            {
              term: "Cookies",
              definition: "small files or similar technologies placed on Your device by a website.",
            },
            { term: "Country", definition: "Nigeria." },
            { term: "Device", definition: "any device that can access the Service." },
            {
              term: "Personal Data",
              definition: "information relating to an identified or identifiable individual.",
            },
            { term: "Service", definition: "the Application or the Website or both." },
            {
              term: "Service Provider",
              definition: "a person or company that processes data on behalf of the Company.",
            },
            {
              term: "Usage Data",
              definition: "data collected automatically through use of the Service.",
            },
            {
              term: "Website",
              definition: `Salafi Durus, accessible from ${legalCompany.website}.`,
            },
            {
              term: "You",
              definition: "the individual or legal entity accessing or using the Service.",
            },
          ],
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "توضح هذه الوثيقة كيفية جمع بياناتك الشخصية واستخدامها وحمايتها.",
        },
      ],
    },
  },
  {
    id: "collecting",
    heading: {
      en: "Collecting and Using Your Personal Data",
      ar: "جمع بياناتك الشخصية واستخدامها",
    },
    blocks: {
      en: [
        { type: "subheading", text: "Personal Data" },
        {
          type: "paragraph",
          text: "While using Our Service, We may ask You to provide information that can be used to contact or identify You, including Your email address, name, and profile picture.",
        },
        {
          type: "paragraph",
          text: "We do not use Your email address to contact You proactively. Scholar profiles may also display publicly curated social media links.",
        },
        { type: "subheading", text: "Usage Data" },
        {
          type: "paragraph",
          text: "Usage Data is collected automatically and may include Your IP address, browser or device type, pages visited, visit times, time spent, unique device identifiers, and diagnostic data.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "قد نجمع اسمك وبريدك الإلكتروني وصورة ملفك الشخصي وبيانات الاستخدام اللازمة لتقديم الخدمة وتحسينها.",
        },
      ],
    },
  },
  {
    id: "use",
    heading: { en: "Use of Your Personal Data", ar: "استخدام بياناتك الشخصية" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "The Company may use Personal Data to provide and maintain the Service, manage Your Account, respond to support requests, manage business transfers, and analyze usage trends to improve the Service.",
        },
        { type: "subheading", text: "Sharing Your Personal Data" },
        {
          type: "bullets",
          items: [
            "With Service Providers to monitor and analyze use of the Service.",
            "For business transfers such as a merger, sale, financing, or acquisition.",
            "With Your consent for any other purpose.",
          ],
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "نستخدم بياناتك لتقديم الخدمة وإدارة حسابك والرد على طلبات الدعم وتحسين الخدمة.",
        },
      ],
    },
  },
  {
    id: "retention",
    heading: { en: "Retention of Your Personal Data", ar: "الاحتفاظ ببياناتك الشخصية" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "The Company retains Your Personal Data only as long as necessary for the purposes in this Privacy Policy, including legal obligations, dispute resolution, and enforcement of agreements. When it is no longer necessary, We securely delete or anonymize it unless a lawful retention basis applies.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "نحتفظ ببياناتك فقط للمدة اللازمة للأغراض الموضحة في سياسة الخصوصية أو للامتثال للالتزامات القانونية.",
        },
      ],
    },
  },
  {
    id: "transfer",
    heading: { en: "Transfer of Your Personal Data", ar: "نقل بياناتك الشخصية" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "Your information may be processed in locations outside Your jurisdiction where data-protection laws may differ. Where required, We apply appropriate safeguards and take reasonable steps to protect Your data during international transfers.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "قد تُعالج بياناتك خارج نطاق ولايتك، وسنتخذ الضمانات المناسبة التي يقتضيها القانون لحمايتها.",
        },
      ],
    },
  },
  {
    id: "delete",
    heading: { en: "Delete Your Personal Data", ar: "حذف بياناتك الشخصية" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "You may update, amend, or delete Your information through account settings where available, or contact Us to request access, correction, or deletion. We may retain information where required by law or where another lawful basis applies.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "يمكنك تحديث بياناتك أو تعديلها أو حذفها من إعدادات الحساب، أو التواصل معنا لطلب الوصول أو التصحيح أو الحذف.",
        },
      ],
    },
  },
  {
    id: "disclosure",
    heading: { en: "Disclosure of Your Personal Data", ar: "الإفصاح عن بياناتك الشخصية" },
    blocks: {
      en: [
        { type: "subheading", text: "Business Transactions" },
        {
          type: "paragraph",
          text: "If the Company is involved in a merger, acquisition, or asset sale, Your Personal Data may be transferred. We will provide notice before it becomes subject to a different Privacy Policy.",
        },
        { type: "subheading", text: "Law enforcement and other legal requirements" },
        {
          type: "paragraph",
          text: "We may disclose Your Personal Data when required by law or when We believe in good faith that disclosure is necessary to comply with a legal obligation, protect rights or property, prevent wrongdoing, protect people, or defend against legal liability.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "قد نفصح عن بياناتك عند الضرورة للامتثال للقانون أو حماية الحقوق أو منع المخالفات أو حماية المستخدمين.",
        },
      ],
    },
  },
  {
    id: "security",
    heading: { en: "Security of Your Personal Data", ar: "أمان بياناتك الشخصية" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "The security of Your Personal Data is important to Us. We use commercially reasonable means to protect it, but no method of transmission or electronic storage is completely secure.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "أمان بياناتك مهم لدينا، لكن لا توجد وسيلة نقل أو تخزين إلكتروني آمنة بشكل مطلق.",
        },
      ],
    },
  },
  {
    id: "children",
    heading: { en: "Children's Privacy", ar: "خصوصية الأطفال" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "Our Service does not knowingly collect personally identifiable information from children under 13. If You believe a child has provided Us Personal Data, please contact Us so We can remove it where appropriate.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "لا نجمع عن قصد معلومات تعريفية من الأطفال دون الثالثة عشرة، ونرجو التواصل معنا إذا علمت بتقديم طفل لبياناته.",
        },
      ],
    },
  },
  {
    id: "links",
    heading: { en: "Links to Other Websites", ar: "الروابط إلى مواقع أخرى" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "Our Service may contain links to websites not operated by Us. We strongly advise You to review the Privacy Policy of every site You visit. We have no control over third-party content or practices.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "قد تتضمن خدمتنا روابط لمواقع لا نديرها، وننصحك بمراجعة سياسة الخصوصية لكل موقع تزوره.",
        },
      ],
    },
  },
  {
    id: "changes",
    heading: { en: "Changes to this Privacy Policy", ar: "التغييرات على سياسة الخصوصية" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "We may update this Privacy Policy from time to time by posting the new version on this page. We may also notify You by email or a prominent notice before material changes take effect. Changes are effective when posted.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "قد نحدّث سياسة الخصوصية من وقت لآخر، وسننشر النسخة الجديدة ونحدّث تاريخ آخر تعديل.",
        },
      ],
    },
  },
  {
    id: "contact",
    heading: { en: "Contact Us", ar: "تواصل معنا" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "If You have questions about this Privacy Policy, contact Us through:",
        },
        supportLink("Support"),
      ],
      ar: [
        { type: "paragraph", text: "إذا كانت لديك أسئلة حول سياسة الخصوصية، تواصل معنا عبر:" },
        supportLink("الدعم"),
      ],
    },
  },
];

const cookiesSections: LegalSection[] = [
  {
    id: "interpretation",
    heading: { en: "Interpretation and Definitions", ar: "التفسير والتعريفات" },
    blocks: {
      en: [
        ...commonInterpretation("Cookies Policy"),
        {
          type: "definitions",
          items: [
            { term: "Company", definition: "Salafi Durus." },
            { term: "Cookies", definition: "Small files placed on Your device by a website." },
            { term: "Website", definition: legalCompany.website },
            { term: "You", definition: "The individual accessing or using the Website." },
          ],
        },
      ],
      ar: [
        { type: "paragraph", text: "ملفات تعريف الارتباط هي ملفات صغيرة يضعها الموقع على جهازك." },
      ],
    },
  },
  {
    id: "use",
    heading: { en: "The Use of Cookies", ar: "استخدام ملفات تعريف الارتباط" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "Cookies can be Persistent or Session Cookies. We use necessary, functionality, and anonymized analytics cookies for the purposes described in this policy.",
        },
        {
          type: "bullets",
          items: [
            "Necessary / Essential Cookies: authenticate users and prevent fraudulent use of accounts.",
            "Functionality Cookies: remember choices such as login details or language preference.",
            "Analytics Cookies: collect anonymized usage and performance data to improve the Service.",
          ],
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "قد تكون ملفات تعريف الارتباط دائمة أو مؤقتة، ونستخدم الضرورية والوظيفية والتحليلية المجهولة لتحسين الخدمة.",
        },
      ],
    },
  },
  {
    id: "changes",
    heading: { en: "Changes to this Cookies Policy", ar: "التغييرات على سياسة ملفات الارتباط" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "We may update this Cookies Policy from time to time. The Last updated date indicates when it was last revised.",
        },
      ],
      ar: [
        {
          type: "paragraph",
          text: "قد نحدّث هذه السياسة من وقت لآخر، ويشير تاريخ آخر تحديث إلى آخر مراجعة لها.",
        },
      ],
    },
  },
  {
    id: "contact",
    heading: { en: "Contact Us", ar: "تواصل معنا" },
    blocks: {
      en: [
        {
          type: "paragraph",
          text: "If you have questions about this Cookies Policy, contact us by visiting:",
        },
        supportLink("Support"),
      ],
      ar: [
        { type: "paragraph", text: "إذا كانت لديك أسئلة حول هذه السياسة، تواصل معنا عبر:" },
        supportLink("الدعم"),
      ],
    },
  },
];

/** Publishes the complete legal document set consumed by web and native clients. */
export const legalDocuments: LegalDocument[] = [
  {
    id: "terms",
    title: { en: "Terms of Service", ar: "شروط الخدمة" },
    intro: {
      en: ["These Terms and Conditions govern your use of Salafi Durus."],
      ar: ["تحكم هذه الشروط استخدامك لسلفي دروس."],
    },
    updatedAt: legalUpdateDates.terms,
    sections: termsSections,
  },
  {
    id: "privacy",
    title: { en: "Privacy Policy", ar: "سياسة الخصوصية" },
    intro: {
      en: [
        "This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information.",
      ],
      ar: ["توضح سياسة الخصوصية هذه سياساتنا وإجراءاتنا في جمع معلوماتك واستخدامها والإفصاح عنها."],
    },
    updatedAt: legalUpdateDates.privacy,
    sections: privacySections,
  },
  {
    id: "cookies",
    title: { en: "Cookie Policy", ar: "سياسة ملفات تعريف الارتباط" },
    intro: {
      en: ["This Cookies Policy explains what Cookies are and how We use them."],
      ar: ["توضح هذه السياسة ماهية ملفات تعريف الارتباط وكيف نستخدمها."],
    },
    updatedAt: legalUpdateDates.cookies,
    sections: cookiesSections,
  },
];

/** Returns a stable legal document or undefined for an unknown policy ID. */
export function getLegalDocument(id: LegalDocument["id"]): LegalDocument | undefined {
  return legalDocuments.find((document) => document.id === id);
}
