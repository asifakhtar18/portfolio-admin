// About section API module (Requirement 7).
//
// Mirrors the API's `/about` endpoints: owner read and upsert. The upsert
// supports an optional profile-image file, sent as multipart/form-data under
// the `profileImage` field so the API uploads it to the tenant's Tenant_Blob.

import { apiGet, apiSend, apiSendForm } from "./client";
import type { AboutResponse } from "./types";

/** The multipart field name for an uploaded About profile image (matches the API). */
export const ABOUT_IMAGE_FIELD = "profileImage";

/** Text fields for an About upsert. */
export interface AboutInput {
  bio: string;
  designation: string;
  /** An existing profile image URL to keep, when not uploading a new file. */
  profileImage?: string;
}

/** Fetch the tenant's About record. Returns `null` when unset (R7.4). */
export function getAbout(): Promise<AboutResponse | null> {
  return apiGet<AboutResponse | null>("/about");
}

/**
 * Upsert the About record (R7.1). When `imageFile` is provided the request is
 * sent as multipart/form-data with the file under `profileImage`; otherwise a
 * JSON body is sent (optionally including a `profileImage` URL string to keep).
 */
export function updateAbout(
  input: AboutInput,
  imageFile?: File,
): Promise<AboutResponse> {
  if (imageFile) {
    const form = new FormData();
    form.append("bio", input.bio);
    form.append("designation", input.designation);
    form.append(ABOUT_IMAGE_FIELD, imageFile);
    return apiSendForm<AboutResponse>("PUT", "/about", form);
  }
  return apiSend<AboutResponse>("PUT", "/about", input);
}
