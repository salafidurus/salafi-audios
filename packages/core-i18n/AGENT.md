# `@sd/core-i18n` guidance

This package owns supported locales, typed translation keys, and interpolation
behavior shared by web and native.

Do not hardcode user-facing text in components. When translation keys change,
update every locale catalog and affected client usage. Keep the package free of
framework-specific dependencies.
