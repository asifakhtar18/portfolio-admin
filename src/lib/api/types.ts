// Canonical API response types for the portfolio-admin CMS.
//
// These mirror the API's canonical models (portfolio-api/src/models/canonical.ts):
// the MongoDB `_id` is serialized as a string `id`, all dates are ISO-8601
// strings, and field names are canonical (`isApproved`, `createdAt`, `images`).
// Task 28 will finalize/consolidate the shared types across projects; for now
// these live under `src/lib/api` so the API modules are strongly typed and the
// existing `src/lib/types.ts` (used by current components) is left untouched.

/** A single social-media link on a contact record. */
export interface SocialMediaLink {
  platform: string;
  url: string;
}

/** Canonical About singleton. */
export interface AboutResponse {
  id: string;
  bio: string;
  designation: string;
  profileImage?: string;
  updatedAt: string;
}

/** Canonical Skills singleton. */
export interface SkillsResponse {
  id?: string;
  items: string[];
  updatedAt?: string;
}

/** A single project image (canonical `images` item shape). */
export interface ProjectImage {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;
}

/** Canonical Project. */
export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  images: ProjectImage[];
  link?: string;
  sourceCode?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Fields accepted when creating or updating a project (excludes server-managed fields). */
export interface ProjectInput {
  name: string;
  description: string;
  technologies?: string[];
  link?: string;
  sourceCode?: string;
  featured?: boolean;
}

/** Canonical Experience. */
export interface ExperienceResponse {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies?: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** Fields accepted when creating or updating an experience. */
export interface ExperienceInput {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies?: string[];
  imageUrl?: string;
}

/** Canonical ContactInfo singleton. */
export interface ContactInfoResponse {
  id: string;
  email: string;
  phone: string;
  socialMedia: SocialMediaLink[];
  updatedAt: string;
}

/** Fields accepted when creating or updating contact info. */
export interface ContactInfoInput {
  email: string;
  phone: string;
  socialMedia?: SocialMediaLink[];
}

/** Canonical Testimonial (canonical approval field `isApproved`). */
export interface TestimonialResponse {
  id: string;
  name: string;
  role: string;
  company: string;
  message: string;
  avatar?: string;
  rating?: number;
  linkedin?: string;
  twitter?: string;
  isApproved: boolean;
  createdAt: string;
}

/** Canonical Message (canonical timestamp field `createdAt`). */
export interface MessageResponse {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

/** Canonical Update_Log entry. */
export interface UpdateLogResponse {
  id: string;
  section: string;
  title: string;
  updatedAt: string;
}

/** Dashboard stats counts. */
export interface StatsResponse {
  projects: number;
  skills: number;
  experiences: number;
}

/** Authenticated tenant profile from `/auth/me` (no secrets). */
export interface TenantProfile {
  id: string;
  email: string;
  username: string;
  storageConfigured: boolean;
  /**
   * Whether the tenant's email has been verified (surfaced by the API now that
   * email OTP exists). `true` for tenants created before OTP, for Google
   * sign-ups, and for tenants who completed OTP verification.
   */
  emailVerified: boolean;
}

/**
 * A JWT-bearing auth response. Returned by `/auth/login` and `/auth/verify-otp`
 * on success, and by `/auth/register` when email OTP is disabled.
 */
export interface AuthTokenResponse {
  token: string;
}

/**
 * `/auth/register` response when email OTP is enabled (`202`): the tenant must
 * verify a code before a token is issued, so no `token` is present. The API
 * also returns this for an existing-but-unverified email so the flow is
 * uniform (R2, R6.2).
 */
export interface PendingVerificationResponse {
  pendingVerification: true;
}

/**
 * The two possible `/auth/register` outcomes. Callers narrow on the shape:
 * `"token" in res` means registration is complete (OTP off); otherwise the
 * tenant must complete the OTP step.
 */
export type RegisterResponse = AuthTokenResponse | PendingVerificationResponse;

/** `/auth/resend-otp` response (`202`): uniform acknowledgement (R6.2). */
export interface ResendOtpResponse {
  ok: true;
}

// ---------------------------------------------------------------------------
// Phase 8 — AI Career Platform types
//
// These mirror the API responses from the Phase 1–7 routes (profile, ai,
// resumes, linkedin, payments/subscription). Field names and shapes match the
// API exactly — the UI adapts to the API, never the reverse.
// ---------------------------------------------------------------------------

/** Provenance of a profile field (so AI never silently overwrites user data). */
export type Provenance = "cms" | "linkedin" | "user" | "ai";

/** A work-experience entry in the unified profile. */
export interface ProfileExperience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  source: Provenance;
}

/** A project in the unified profile. */
export interface ProfileProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  sourceCode?: string;
  featured: boolean;
  source: Provenance;
}

/** A testimonial surfaced on the profile. */
export interface ProfileTestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  message: string;
  source: Provenance;
}

/** The unified Professional Profile assembled by the API (`GET /profile`). */
export interface ProfessionalProfile {
  tenantId: string;
  name?: string;
  headline?: string;
  summary?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  skills: string[];
  experience: ProfileExperience[];
  projects: ProfileProject[];
  testimonials: ProfileTestimonial[];
  links: SocialMediaLink[];
  sources: Record<string, Provenance | undefined>;
  assembledAt: string;
}

/** Weighted completeness result (`GET /profile/completeness`). */
export interface ProfileCompleteness {
  score: number;
  missing: string[];
  sections: {
    headline: boolean;
    summary: boolean;
    skills: boolean;
    experience: boolean;
    projects: boolean;
    contact: boolean;
  };
}

/** Hiring-discoverability consent (`GET/PUT /profile/consent`). */
export interface ConsentResponse {
  discoverable: boolean;
  grantedAt?: string;
  revokedAt?: string;
}

/** The metered AI features (must match the API's `AIFeature` union). */
export type AIFeature =
  | "profile_summary"
  | "cold_email"
  | "linkedin_improve"
  | "resume_tailored_basic"
  | "resume_premium"
  | "ats_analysis";

/** Shared tail added to every AI feature response (remaining quota). */
export interface WithRemaining {
  remaining?: number;
}

/** `POST /ai/profile-summary` result. */
export interface SummaryResult extends WithRemaining {
  text: string;
  promptVersion?: string;
}

/** `POST /ai/cold-email` result. */
export interface ColdEmailResult extends WithRemaining {
  subject?: string;
  shortEmail?: string;
  detailedEmail?: string;
  followUpEmail?: string;
  [key: string]: unknown;
}

/** A single LinkedIn improvement suggestion. */
export interface LinkedInSuggestion {
  field?: string;
  current?: string;
  suggestion: string;
  rationale?: string;
}

/** `POST /ai/linkedin/improve` result. */
export interface LinkedInImproveResult extends WithRemaining {
  suggestions: LinkedInSuggestion[];
  [key: string]: unknown;
}

/** An AI history entry (`GET /ai/history`). */
export interface AIHistoryEntry {
  id: string;
  feature: AIFeature;
  promptVersion: string;
  output: unknown;
  params?: Record<string, unknown>;
  createdAt: string;
}

/** A resume template option (`GET /resumes/templates`). */
export interface ResumeTemplate {
  id: string;
  name: string;
  description?: string;
  free: boolean;
  premium: boolean;
  maxPages?: number;
}

/** Structured data extracted from an uploaded resume (`POST /resumes/:id/import`). */
export interface ParsedResume {
  name?: string;
  headline?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    bullets: string[];
    technologies: string[];
  }[];
  projects: {
    name: string;
    description?: string;
    technologies: string[];
    link?: string;
  }[];
  education: { institution: string; qualification?: string; year?: string }[];
  certifications: string[];
}

/** Result of importing (parsing) an uploaded resume. */
export interface ResumeImportResult extends WithRemaining {
  parsed: ParsedResume;
  sourceKind: "pdf" | "docx" | "txt";
}

/** A resume summary (`GET /resumes`). */
export interface ResumeSummary {
  id: string;
  name: string;
  templateId: string;
  targetRole?: string;
  targetCompany?: string;
  currentVersionId?: string;
  version?: number;
  createdAt: string;
  updatedAt: string;
}

/** Keyword gap info returned by resume generation. */
export interface KeywordGaps {
  missing: string[];
  present?: string[];
}

/** Result of generating a resume version. */
export interface ResumeGenerateResult extends WithRemaining {
  version: number;
  versionId: string;
  resumeJson: unknown;
  keywordGaps?: KeywordGaps;
  downloadPath: string;
}

/** A single component of the ATS score breakdown. */
export interface ATSBreakdownItem {
  label: string;
  score: number;
  max: number;
  detail?: string;
}

/** Result of an ATS analysis (`POST /resumes/:id/ats`). Always an estimate. */
export interface ATSResult extends WithRemaining {
  score: number;
  methodologyVersion: string;
  breakdown: ATSBreakdownItem[];
  suggestions?: string[];
  keywordGaps?: KeywordGaps;
  [key: string]: unknown;
}

/** LinkedIn connection status (`GET /linkedin/status`). */
export interface LinkedInStatus {
  connected: boolean;
  linkedInId?: string;
  connectedAt?: string;
  lastSyncedAt?: string;
  expiresAt?: string;
}

/** The product category of a purchasable product (`GET /payments/plans`). */
export type ProductType = "subscription" | "one_time";

/** The category a credit applies to (the only kind in this feature). */
export type CreditKind = "resume_premium";

/**
 * A purchasable product (`GET /payments/plans`).
 *
 * `type` distinguishes subscription products (positive `periodDays`) from
 * one-time products, which instead grant `creditQuantity` credits of a
 * specific `creditKind` per purchase. The `amount` is the backend's
 * authoritative price in the smallest currency unit (paise); Admin_UI displays
 * it rather than hardcoding a value (R2.3, R8, R11).
 */
export interface PlanOption {
  id: string;
  name: string;
  type: ProductType;
  amount: number;
  currency: string;
  periodDays: number;
  /** Present only for one-time products: the credit category granted. */
  creditKind?: CreditKind;
  /** Present only for one-time products: credits granted per purchase. */
  creditQuantity?: number;
}

/** The current subscription (`GET /subscription`), or null for free tier. */
export interface SubscriptionResponse {
  plan: string;
  status: "ACTIVE" | "PENDING" | "CANCELLED" | "EXPIRED";
  provider?: string;
  startDate?: string;
  endDate?: string;
  /**
   * Current credit balances per credit kind (R8.1). Always reports a count
   * (0 when the tenant has none), never omitted-as-error.
   */
  credits?: { resume_premium: number };
}

/**
 * Result of `POST /payments/verify` (R4, R8).
 *
 * `activated` reports whether this verification first transitioned the order to
 * paid. For a subscription grant the activated `plan` is returned; for a
 * one-time grant the backend returns the granted `grantedKind` and the updated
 * `creditBalance` so Admin_UI can reflect the new count (R9.3).
 */
export interface VerifyPaymentResponse {
  activated: boolean;
  productId: string;
  plan?: string;
  grantedKind?: CreditKind;
  creditBalance?: number;
}

/** A payment history record (`GET /payments/history`). */
export interface PaymentRecord {
  /**
   * Backend product reference, e.g. `PREMIUM_MONTHLY` or `RESUME_DOWNLOAD`.
   * The API widened the subscription-only `plan` field to this product
   * reference (R12.1); legacy records resolve back to it server-side so the
   * read surface always sends `productId`.
   */
  productId: string;
  /**
   * Legacy field name, kept optional only for backward compatibility with any
   * cached/older response; the current API emits `productId`.
   */
  plan?: string;
  amount: number;
  currency: string;
  /** Lowercase provider status: created | pending | paid | failed. */
  status: string;
  createdAt: string;
}

/** An order created for checkout (`POST /payments/order`). */
export interface OrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string;
  [key: string]: unknown;
}
