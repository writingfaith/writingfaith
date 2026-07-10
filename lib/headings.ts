import type { PortableTextBlock } from "@portabletext/react";

import { slugify } from "./slugify";

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
  /** The block's position in the essay's body array — how the renderer finds it again. */
  index: number;
}

function blockText(block: PortableTextBlock): string {
  const children = (block as { children?: Array<{ text?: string }> }).children;
  return children?.map((child) => child.text ?? "").join("") ?? "";
}

/**
 * Every h2/h3 in an essay body, in document order, with a stable slug id.
 * Duplicate headings ("Prayer" appearing twice) get a numbered suffix so
 * anchors never collide.
 */
export function extractHeadings(body: PortableTextBlock[]): Heading[] {
  const seen = new Map<string, number>();
  const headings: Heading[] = [];

  body.forEach((block, index) => {
    if (block._type !== "block") return;
    const style = (block as { style?: string }).style;
    if (style !== "h2" && style !== "h3") return;

    const text = blockText(block).trim();
    if (!text) return;

    let id = slugify(text) || "section";
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;

    headings.push({ id, text, level: style === "h2" ? 2 : 3, index });
  });

  return headings;
}
