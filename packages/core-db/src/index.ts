import * as client from "./generated/prisma/client";

// Export enum types and values
export type Status = client.Status;
export type UserRole = client.UserRole;
export type Permission = client.Permission;
export type ListingFormat = client.ListingFormat;
export type RecommendationRecurrence = client.RecommendationRecurrence;
export type Locale = client.Locale;
export type TranslationStatus = client.TranslationStatus;
export type AccessTarget = client.AccessTarget;
export type AccessCapability = client.AccessCapability;
export type PrismaClient = client.PrismaClient;

// Export enum values
export const Status = client.Status;
export const UserRole = client.UserRole;
export const Permission = client.Permission;
export const ListingFormat = client.ListingFormat;
export const RecommendationRecurrence = client.RecommendationRecurrence;
export const Locale = client.Locale;
export const TranslationStatus = client.TranslationStatus;
export const AccessTarget = client.AccessTarget;
export const AccessCapability = client.AccessCapability;
export const PrismaClient = client.PrismaClient;

// Export Prisma namespace/types/values (models accessed via Prisma.Scholar, Prisma.User, etc.)
export import Prisma = client.Prisma;
