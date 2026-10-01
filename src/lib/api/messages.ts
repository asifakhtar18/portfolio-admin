// Messages API module (Requirement 13, owner side).
//
// Mirrors the API's owner `/messages` endpoint: list all received contact
// messages ordered by creation time descending. Public submission lives in v2.

import { apiGet } from "./client";
import type { MessageResponse } from "./types";

/** List the tenant's contact messages ordered by `createdAt` descending (R13.5). */
export function getMessages(): Promise<MessageResponse[]> {
  return apiGet<MessageResponse[]>("/messages");
}
