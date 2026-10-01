// Testimonials API module (Requirement 12, owner side).
//
// Mirrors the API's owner `/testimonials` endpoints: list all (regardless of
// approval state), approve, and delete. Public submission lives in v2, not here.

import { apiGet, apiSend } from "./client";
import type { TestimonialResponse } from "./types";

/**
 * List ALL of the tenant's testimonials regardless of approval state, ordered
 * by creation time descending (R12.7).
 */
export function getTestimonials(): Promise<TestimonialResponse[]> {
  return apiGet<TestimonialResponse[]>("/testimonials");
}

/** Approve a testimonial, setting `isApproved` to true (R12.4). */
export function approveTestimonial(id: string): Promise<TestimonialResponse> {
  return apiSend<TestimonialResponse>("PATCH", `/testimonials/${id}/approve`);
}

/**
 * Set a testimonial's approval state, supporting both approve and unapprove.
 * Posts `{ isApproved }` to the `/approval` endpoint.
 */
export function setTestimonialApproval(
  id: string,
  isApproved: boolean,
): Promise<TestimonialResponse> {
  return apiSend<TestimonialResponse>("PATCH", `/testimonials/${id}/approval`, {
    isApproved,
  });
}

/** Delete a testimonial and its avatar blob (R12.5). */
export function deleteTestimonial(id: string): Promise<void> {
  return apiSend<void>("DELETE", `/testimonials/${id}`);
}
