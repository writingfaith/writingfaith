import { brandImage, OG_SIZE } from "@/lib/og";

export const alt =
  "WritingFaith — Quiet reflections on following Christ in an unquiet world";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return brandImage({
    eyebrow: "Essays on faith",
    title: "Quiet reflections on following Christ in an unquiet world.",
  });
}
