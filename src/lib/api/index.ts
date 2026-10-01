// Barrel export for the portfolio-admin API client library.
//
// This library replaces the Firebase SDK modules (`src/lib/firebase/*`) as the
// admin's data layer (Requirement 17.2). Every function ultimately routes
// through `fetchWithAuth`, which injects the tenant's JWT (Requirement 17.3).
//
// Note: the firebase modules are intentionally NOT deleted here (task 23) and
// components are NOT rewired here (task 22).

export * from "./client";
export * from "./types";

export * as authApi from "./auth";
export * as credentialsApi from "./credentials";
export * as aboutApi from "./about";
export * as skillsApi from "./skills";
export * as contactApi from "./contact";
export * as projectsApi from "./projects";
export * as experiencesApi from "./experiences";
export * as testimonialsApi from "./testimonials";
export * as messagesApi from "./messages";
export * as statsApi from "./stats";
export * as updatesApi from "./updates";
