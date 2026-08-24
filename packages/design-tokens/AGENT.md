# `@sd/design-tokens` guidance

This package is the single source of truth for semantic colors, spacing, radius,
typography, and shadows used by web and native.

Use semantic roles rather than hardcoded values. Web consumes CSS variables;
native consumes the Unistyles theme. Keep token additions minimal, semantic,
and compatible across clients. Do not use content tokens as surfaces or surface
tokens as text.
