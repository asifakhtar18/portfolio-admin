// Dashboard stats API module (Requirement 14.1).
//
// Mirrors the API's `/stats` endpoint returning the tenant's project, skill,
// and experience counts.

import { apiGet } from "./client";
import type { StatsResponse } from "./types";

/** Fetch the tenant's dashboard counts (R14.1). */
export function getStats(): Promise<StatsResponse> {
  return apiGet<StatsResponse>("/stats");
}
