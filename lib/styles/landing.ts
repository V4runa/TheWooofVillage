import type { CSSProperties } from "react";

/**
 * Shared landing page styles to prevent duplication.
 * Used across home page and dogs listing page.
 */

/**
 * Typography style for photo titles with gradient text effect.
 */
export const photoTitleStyle: CSSProperties = {
  backgroundImage:
    "linear-gradient(90deg, rgba(255,236,210,0.98) 0%, rgba(248,252,255,0.96) 46%, rgba(255,226,198,0.98) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
  textShadow:
    "0 24px 64px rgba(12,16,22,0.26), " +
    "0 7px 20px rgba(12,16,22,0.16), " +
    "0 1px 2px rgba(12,16,22,0.18), " +
    "0 -1px 0 rgba(255,235,210,0.18)",
};

/**
 * Typography style for photo body text with shadow.
 */
export const photoBodyStyle: CSSProperties = {
  color: "rgba(255, 244, 228, 0.95)",
  textShadow:
    "0 22px 58px rgba(12,16,22,0.22), " +
    "0 6px 18px rgba(12,16,22,0.12), " +
    "0 1px 2px rgba(12,16,22,0.14)",
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
