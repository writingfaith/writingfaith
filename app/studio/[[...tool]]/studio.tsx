"use client";

import { NextStudio } from "next-sanity/studio/client-component";

import config from "@/sanity.config";

/**
 * Client boundary for the Studio. The Sanity config contains functions, so it
 * must be imported inside a client module rather than passed across the
 * server → client prop boundary.
 */
export function Studio() {
  return <NextStudio config={config} />;
}
