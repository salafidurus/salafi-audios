# Legal domain context

`@sd/domain-legal` is the source of truth for policy metadata and copy. It must
not import React, Expo, Next.js, router APIs, or `@sd/core-i18n`. Locale
selection happens at the client boundary; legal content is represented here as
structured localized data.
