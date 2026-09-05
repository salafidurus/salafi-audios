/** Documents this module's responsibility and public boundary. */
/** Border-width tokens used by web components and generated theme CSS. */
export const borderWeb = {
  width: {
    default: "1px",
    hairline: "1px",
  },
} as const;

/** Type of the canonical web border token collection. */
export type BorderWeb = typeof borderWeb;
