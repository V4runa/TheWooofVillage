import type { CSSProperties } from "react";

/**
 * Shared landing page styles to prevent duplication.
 * Used across home page and dogs listing page.
 */

/**
 * Section title style. Solid, warm dark ink for crisp contrast on the light
 * surface (the playful tri-color now lives in the accent rule beneath titles
 * and in card ribbons, instead of low-contrast gradient text).
 */
export const photoTitleStyle: CSSProperties = {
  color: "rgb(28 34 44)",
};

/**
 * Section body / supporting copy — readable secondary ink.
 */
export const photoBodyStyle: CSSProperties = {
  color: "rgb(62 76 98)",
};

/**
 * CSS keyframes for the woofSheen animation.
 * Use this in a <style jsx global> block.
 */
export const woofSheenKeyframes = `
  @keyframes woofSheen {
    0% {
      background-position: 0% 50%;
      filter: saturate(1) brightness(1);
    }
    50% {
      background-position: 100% 50%;
      filter: saturate(1.05) brightness(1.03);
    }
    100% {
      background-position: 0% 50%;
      filter: saturate(1) brightness(1);
    }
  }
`;
