import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/** Leaves draft preview and returns to the published site. */
export async function GET() {
  (await draftMode()).disable();
  redirect("/");
}
