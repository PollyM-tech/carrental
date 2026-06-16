import { httpRouter, makeFunctionReference } from "convex/server";
import { httpAction } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const workosWebhook = httpAction(async (ctx, request) => {
  const webhookSecret =
    process.env.WORKOS_WEBHOOK_SECRET ?? process.env.Webhook_Secret;
  if (!webhookSecret) {
    return jsonError("Webhook is not configured.", 500);
  }

  const signature = request.headers.get("workos-signature");
  if (!signature) {
    return jsonError("Webhook signature is required.", 401);
  }

  const body = await request.text();

  if (!(await verifyWorkosSignature(body, signature, webhookSecret))) {
    return jsonError("Webhook signature could not be verified.", 401);
  }

  let payload: WorkosWebhookPayload;
  try {
    payload = parseWorkosPayload(JSON.parse(body));
  } catch {
    return jsonError("Webhook payload is invalid.", 400);
  }

  const { event, data } = payload;

  switch (event) {
    case "user.created":
      await handleUserCreated(ctx, data);
      break;
    case "user.updated":
      await handleUserUpdated(ctx, data);
      break;
    case "user.deleted":
      await handleUserDeleted(ctx, data);
      break;
    case "organization_membership.created":
      await handleMembershipCreated(ctx, data);
      break;
    case "organization_membership.deleted":
      await handleMembershipDeleted(ctx, data);
      break;
    case "organization_membership.updated":
      await handleMembershipCreated(ctx, data);
      break;
    default:
      return new Response(null, { status: 200 });
  }

  return new Response(null, { status: 200 });
});

type UserRole = "platform_admin" | "staff" | "customer";

type WorkosWebhookPayload = {
  event: string;
  data: Record<string, unknown>;
};

type WorkosUserData = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
};

type WorkosMembershipData = {
  user_id: string;
  organization_id?: string;
  role?: { slug?: string };
  roles?: Array<{ slug?: string }>;
};

type UserSyncPayload = {
  workosUserId: string;
  email: string;
  workosOrganizationId?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  syncedAt: number;
};

type UserUpdatePayload = {
  userId: Id<"users">;
  email: string;
  workosOrganizationId?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  updatedAt: number;
};

type UserDeactivatePayload = {
  userId: Id<"users">;
  updatedAt: number;
};

type UserRoleUpdatePayload = {
  userId: Id<"users">;
  role: UserRole;
  workosOrganizationId?: string;
  updatedAt: number;
};

class WebhookValidationError extends Error {}

const webhookFunctions = {
  upsertUser: makeFunctionReference<"mutation", UserSyncPayload, Id<"users">>(
    "webhooks:upsertUser",
  ),
  getUserByWorkosId: makeFunctionReference<
    "query",
    { workosUserId: string },
    { _id: Id<"users"> } | null
  >("webhooks:getUserByWorkosId"),
  updateUser: makeFunctionReference<"mutation", UserUpdatePayload, null>(
    "webhooks:updateUser",
  ),
  deactivateUser: makeFunctionReference<"mutation", UserDeactivatePayload, null>(
    "webhooks:deactivateUser",
  ),
  updateUserRole: makeFunctionReference<"mutation", UserRoleUpdatePayload, null>(
    "webhooks:updateUserRole",
  ),
};

function jsonError(message: string, status: number) {
  return Response.json({ success: false, message }, { status });
}

function parseWorkosPayload(value: unknown): WorkosWebhookPayload {
  if (!isObject(value) || typeof value.event !== "string" || !isObject(value.data)) {
    throw new WebhookValidationError("Invalid payload");
  }

  return {
    event: value.event,
    data: value.data,
  };
}

function parseUserData(data: Record<string, unknown>): WorkosUserData {
  if (typeof data.id !== "string" || typeof data.email !== "string") {
    throw new WebhookValidationError("Invalid user payload");
  }

  return {
    id: data.id,
    email: data.email,
    first_name: optionalString(data.first_name),
    last_name: optionalString(data.last_name),
    profile_picture_url: optionalString(data.profile_picture_url),
  };
}

function parseMembershipData(data: Record<string, unknown>): WorkosMembershipData {
  if (typeof data.user_id !== "string") {
    throw new WebhookValidationError("Invalid membership payload");
  }

  return {
    user_id: data.user_id,
    organization_id: optionalString(data.organization_id),
    role: parseRoleObject(data.role),
    roles: Array.isArray(data.roles)
      ? data.roles
          .map(parseRoleObject)
          .filter((role): role is { slug: string } => Boolean(role))
      : undefined,
  };
}

function parseRoleObject(value: unknown) {
  if (!isObject(value)) return undefined;
  const slug = optionalString(value.slug);
  return slug ? { slug } : undefined;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveRole(data: WorkosMembershipData): UserRole {
  const adminOrgId = process.env.WORKOS_ADMIN_ORG_ID;
  const staffOrgId = process.env.WORKOS_STAFF_ORG_ID;
  const roleSlugs = [data.role?.slug, ...(data.roles?.map((role) => role.slug) ?? [])]
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => slug.replace(/-/g, "_").toLowerCase());

  if (
    data.organization_id === adminOrgId ||
    roleSlugs.includes("platform_admin") ||
    roleSlugs.includes("admin")
  ) {
    return "platform_admin";
  }

  if (data.organization_id === staffOrgId || roleSlugs.includes("staff")) {
    return "staff";
  }

  return "customer";
}

async function verifyWorkosSignature(
  body: string,
  signatureHeader: string,
  secret: string,
) {
  const timestamp = readSignaturePart(signatureHeader, "t");
  const signature = readSignaturePart(signatureHeader, "v1");
  if (!timestamp || !signature) return false;

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber)) return false;

  const toleranceInMilliseconds = 5 * 60 * 1000;
  if (Math.abs(Date.now() - timestampNumber) > toleranceInMilliseconds) {
    return false;
  }

  const expectedSignature = await createHmacHex(secret, `${timestamp}.${body}`);
  return constantTimeEqual(signature, expectedSignature);
}

function readSignaturePart(header: string, key: string) {
  return header
    .split(",")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${key}=`))
    ?.slice(key.length + 1);
}

async function createHmacHex(secret: string, value: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
}

async function handleUserCreated(ctx: ActionCtx, data: Record<string, unknown>) {
  const { id, email, first_name, last_name, profile_picture_url } =
    parseUserData(data);

  await ctx.runMutation(webhookFunctions.upsertUser, {
    workosUserId: id,
    email: email.toLowerCase(),
    firstName: first_name,
    lastName: last_name,
    avatarUrl: profile_picture_url,
    role: "customer",
    isActive: true,
    syncedAt: Date.now(),
  });
}

async function handleUserUpdated(ctx: ActionCtx, data: Record<string, unknown>) {
  const { id, email, first_name, last_name, profile_picture_url } =
    parseUserData(data);

  const user = await ctx.runQuery(webhookFunctions.getUserByWorkosId, {
    workosUserId: id,
  });

  if (user) {
    await ctx.runMutation(webhookFunctions.updateUser, {
      userId: user._id,
      email: email.toLowerCase(),
      firstName: first_name,
      lastName: last_name,
      avatarUrl: profile_picture_url,
      updatedAt: Date.now(),
    });
  }
}

async function handleUserDeleted(ctx: ActionCtx, data: Record<string, unknown>) {
  const { id } = parseUserData({
    ...data,
    email: typeof data.email === "string" ? data.email : "deleted@workos.local",
  });

  const user = await ctx.runQuery(webhookFunctions.getUserByWorkosId, {
    workosUserId: id,
  });

  if (user) {
    await ctx.runMutation(webhookFunctions.deactivateUser, {
      userId: user._id,
      updatedAt: Date.now(),
    });
  }
}

async function handleMembershipCreated(
  ctx: ActionCtx,
  data: Record<string, unknown>,
) {
  const membership = parseMembershipData(data);

  const user = await ctx.runQuery(webhookFunctions.getUserByWorkosId, {
    workosUserId: membership.user_id,
  });

  if (!user) return;

  await ctx.runMutation(webhookFunctions.updateUserRole, {
    userId: user._id,
    role: resolveRole(membership),
    workosOrganizationId: membership.organization_id,
    updatedAt: Date.now(),
  });
}

async function handleMembershipDeleted(
  ctx: ActionCtx,
  data: Record<string, unknown>,
) {
  const membership = parseMembershipData(data);

  const user = await ctx.runQuery(webhookFunctions.getUserByWorkosId, {
    workosUserId: membership.user_id,
  });

  if (!user) return;

  const adminOrgId = process.env.WORKOS_ADMIN_ORG_ID;
  const staffOrgId = process.env.WORKOS_STAFF_ORG_ID;

  if (
    membership.organization_id === adminOrgId ||
    membership.organization_id === staffOrgId
  ) {
    await ctx.runMutation(webhookFunctions.updateUserRole, {
      userId: user._id,
      role: "customer",
      workosOrganizationId: undefined,
      updatedAt: Date.now(),
    });
  }
}

const http = httpRouter();

http.route({
  path: "/webhooks/workos",
  method: "POST",
  handler: workosWebhook,
});

export default http;
