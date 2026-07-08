import { Studio } from "./studio";

// Sensible Studio defaults from next-sanity: noindex, same-origin referrer,
// and a viewport that fits the Studio's own layout.
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <Studio />;
}
