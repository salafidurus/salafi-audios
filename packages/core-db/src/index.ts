import * as analyticsClient from "./generated/analytics/client";
import * as client from "./generated/prisma/client";

/** Repository-owned database boundary re-exporting generated Prisma client types and values. */
// Export enum types and values
/** Database publication and lifecycle status type generated from the Prisma schema. */
export type Status = client.Status;
/** Database user-role type generated from the Prisma schema. */
export type UserRole = client.UserRole;
/** Database listing-format type generated from the Prisma schema. */
export type ListingFormat = client.ListingFormat;
/** Database recommendation recurrence type generated from the Prisma schema. */
export type RecommendationRecurrence = client.RecommendationRecurrence;
/** Database locale type generated from the Prisma schema. */
export type Locale = client.Locale;
/** Database translation-status type generated from the Prisma schema. */
export type TranslationStatus = client.TranslationStatus;
/** Database access-target type generated from the Prisma schema. */
export type AccessTarget = client.AccessTarget;
/** Database access-capability type generated from the Prisma schema. */
export type AccessCapability = client.AccessCapability;
/** Prisma client type exposed to repository database consumers. */
export type PrismaClient = client.PrismaClient;

// Export enum values
/** Runtime values for the database publication and lifecycle status enum. */
export const Status = client.Status;
/** Runtime values for the database user-role enum. */
export const UserRole = client.UserRole;
/** Runtime values for the database listing-format enum. */
export const ListingFormat = client.ListingFormat;
/** Runtime values for the database recommendation recurrence enum. */
export const RecommendationRecurrence = client.RecommendationRecurrence;
/** Runtime values for the database locale enum. */
export const Locale = client.Locale;
/** Runtime values for the database translation-status enum. */
export const TranslationStatus = client.TranslationStatus;
/** Runtime values for the database access-target enum. */
export const AccessTarget = client.AccessTarget;
/** Runtime values for the database access-capability enum. */
export const AccessCapability = client.AccessCapability;
/** Runtime Prisma client constructor exposed at the package boundary. */
export const PrismaClient = client.PrismaClient;

/** Analytics Prisma client for the isolated append-only product-event archive. */
export const AnalyticsPrismaClient = analyticsClient.PrismaClient;
/** Analytics Prisma client type exposed through the unified database boundary. */
export type AnalyticsPrismaClient = analyticsClient.PrismaClient;

// Export Prisma namespace/types/values (models accessed via Prisma.Scholar, Prisma.User, etc.)
export import Prisma = client.Prisma;
/** Analytics Prisma namespace exposed through the unified database boundary. */
export import AnalyticsPrisma = analyticsClient.Prisma;
