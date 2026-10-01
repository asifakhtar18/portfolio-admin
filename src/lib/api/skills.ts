// Skills section API module (Requirement 8).
//
// Mirrors the API's `/skills` endpoints: owner read and full replacement of the
// skills list. The API stores skills as a singleton `{ items: string[] }`.

import { apiGet, apiSend } from "./client";
import type { SkillsResponse } from "./types";

/** Fetch the tenant's skills list. Returns `{ items: [] }` when unset (R8.3). */
export function getSkills(): Promise<SkillsResponse> {
  return apiGet<SkillsResponse>("/skills");
}

/** Replace the tenant's skills list (R8.1). */
export function updateSkills(items: string[]): Promise<SkillsResponse> {
  return apiSend<SkillsResponse>("PUT", "/skills", { items });
}
