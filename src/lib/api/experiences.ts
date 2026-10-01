// Experiences API module (Requirement 10).
//
// Mirrors the API's `/experiences` CRUD endpoints.

import { apiGet, apiSend } from "./client";
import type { ExperienceInput, ExperienceResponse } from "./types";

/** List the tenant's experiences ordered by creation time descending (R10.4). */
export function getExperiences(): Promise<ExperienceResponse[]> {
  return apiGet<ExperienceResponse[]>("/experiences");
}

/**
 * Fetch a single experience by id. The API exposes only a list endpoint for
 * owner reads, so this fetches the list and finds the matching entry, returning
 * `null` when not found.
 */
export function getExperience(id: string): Promise<ExperienceResponse | null> {
  return getExperiences().then((list) => list.find((e) => e.id === id) ?? null);
}

/** Create an experience entry (R10.1). */
export function createExperience(
  input: ExperienceInput,
): Promise<ExperienceResponse> {
  return apiSend<ExperienceResponse>("POST", "/experiences", input);
}

/** Update an experience entry (R10.2). */
export function updateExperience(
  id: string,
  input: Partial<ExperienceInput>,
): Promise<ExperienceResponse> {
  return apiSend<ExperienceResponse>("PUT", `/experiences/${id}`, input);
}

/** Delete an experience entry (R10.3). */
export function deleteExperience(id: string): Promise<void> {
  return apiSend<void>("DELETE", `/experiences/${id}`);
}
