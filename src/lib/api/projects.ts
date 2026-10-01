// Projects API module (Requirement 9).
//
// Mirrors the API's `/projects` CRUD plus the dedicated image-upload endpoint.
// Image uploads are sent as multipart/form-data with one or more files under
// the `images` field so the API stores them in the tenant's Tenant_Blob.

import { apiGet, apiSend, apiSendForm } from "./client";
import type { ProjectInput, ProjectResponse } from "./types";

/** The multipart field name for uploaded project images (matches the API). */
export const PROJECT_IMAGES_FIELD = "images";

/** List the tenant's projects ordered by creation time descending (R9.5). */
export function getProjects(): Promise<ProjectResponse[]> {
  return apiGet<ProjectResponse[]>("/projects");
}

/**
 * Fetch a single project by id. The API exposes only a list endpoint for owner
 * reads, so this fetches the list and finds the matching project, returning
 * `null` when not found.
 */
export function getProject(id: string): Promise<ProjectResponse | null> {
  return getProjects().then((list) => list.find((p) => p.id === id) ?? null);
}

/** Create a project (R9.1). Images are attached separately via {@link uploadProjectImages}. */
export function createProject(input: ProjectInput): Promise<ProjectResponse> {
  return apiSend<ProjectResponse>("POST", "/projects", input);
}

/** Update a project's fields (R9.4). */
export function updateProject(
  id: string,
  input: Partial<ProjectInput>,
): Promise<ProjectResponse> {
  return apiSend<ProjectResponse>("PUT", `/projects/${id}`, input);
}

/** Delete a project and its blob images (R9.3). */
export function deleteProject(id: string): Promise<void> {
  return apiSend<void>("DELETE", `/projects/${id}`);
}

/**
 * Upload one or more images to a project (R9.2). The files are appended under
 * the multipart `images` field; the API preserves input order and returns the
 * updated project with the new image URLs.
 */
export function uploadProjectImages(
  id: string,
  files: File[],
): Promise<ProjectResponse> {
  const form = new FormData();
  for (const file of files) {
    form.append(PROJECT_IMAGES_FIELD, file);
  }
  return apiSendForm<ProjectResponse>("POST", `/projects/${id}/images`, form);
}
