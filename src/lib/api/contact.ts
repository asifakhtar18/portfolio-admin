// Contact info API module (Requirement 11).
//
// Mirrors the API's `/contact-info` endpoints: owner read and upsert of the
// tenant's public contact record (email, phone, social links).

import { apiGet, apiSend } from "./client";
import type { ContactInfoInput, ContactInfoResponse } from "./types";

/** Fetch the tenant's contact info. Returns `null` when unset (R11.3). */
export function getContactInfo(): Promise<ContactInfoResponse | null> {
  return apiGet<ContactInfoResponse | null>("/contact-info");
}

/** Upsert the tenant's contact info (R11.1). */
export function updateContactInfo(
  input: ContactInfoInput,
): Promise<ContactInfoResponse> {
  return apiSend<ContactInfoResponse>("PUT", "/contact-info", input);
}
