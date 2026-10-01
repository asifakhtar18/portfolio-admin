// Recent updates API module (Requirement 14.2).
//
// Mirrors the API's `/updates` endpoint returning the tenant's five most recent
// Update_Log entries.

import { apiGet } from "./client";
import type { UpdateLogResponse } from "./types";

/** Fetch the tenant's five most recent update-log entries, newest first (R14.2). */
export function getRecentUpdates(): Promise<UpdateLogResponse[]> {
  return apiGet<UpdateLogResponse[]>("/updates");
}
