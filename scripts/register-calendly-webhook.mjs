#!/usr/bin/env node
/**
 * Register (or list/delete) a Calendly webhook subscription for this site.
 *
 * Usage:
 *   CALENDLY_TOKEN=<personal access token> \
 *   WEBHOOK_URL=https://www.bconsultedfirst.com/api/webhooks/calendly \
 *   node scripts/register-calendly-webhook.mjs create
 *
 *   node scripts/register-calendly-webhook.mjs list
 *   node scripts/register-calendly-webhook.mjs delete <subscription-uuid>
 *
 * Calendly's API requires callers to supply their own signing key. If
 * SIGNING_KEY is not provided, `create` generates a random 32-byte hex key.
 * The chosen key is printed; copy it into your prod env as
 * CALENDLY_WEBHOOK_SIGNING_KEY and redeploy.
 */

import { randomBytes } from "crypto";

const API = "https://api.calendly.com";
const TOKEN = process.env.CALENDLY_TOKEN;
const WEBHOOK_URL =
  process.env.WEBHOOK_URL ||
  "https://www.bconsultedfirst.com/api/webhooks/calendly";
const EVENTS = ["invitee.created", "invitee.canceled"];
const SCOPE = process.env.CALENDLY_SCOPE || "user"; // "user" or "organization"
const SIGNING_KEY = process.env.SIGNING_KEY || randomBytes(32).toString("hex");

if (!TOKEN) {
  console.error("Missing CALENDLY_TOKEN env var.");
  console.error(
    "Generate one at Calendly → Integrations → API and webhooks → Personal access tokens."
  );
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!res.ok) {
    console.error(`\n${init.method || "GET"} ${path} → ${res.status}`);
    console.error(json);
    process.exit(1);
  }
  return json;
}

async function getMe() {
  const me = await api("/users/me");
  return {
    userUri: me.resource.uri,
    orgUri: me.resource.current_organization,
    name: me.resource.name,
    email: me.resource.email,
  };
}

async function create() {
  const { userUri, orgUri, name, email } = await getMe();
  console.log(`Calendly account: ${name} <${email}>`);
  console.log(`  user:         ${userUri}`);
  console.log(`  organization: ${orgUri}`);
  console.log(`  webhook URL:  ${WEBHOOK_URL}`);
  console.log(`  scope:        ${SCOPE}`);
  console.log(`  events:       ${EVENTS.join(", ")}\n`);

  const body = {
    url: WEBHOOK_URL,
    events: EVENTS,
    organization: orgUri,
    scope: SCOPE,
    signing_key: SIGNING_KEY,
  };
  if (SCOPE === "user") body.user = userUri;

  const res = await api("/webhook_subscriptions", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const r = res.resource || res;
  console.log("✅ Subscription created.");
  console.log(`   uri:         ${r.uri}`);
  console.log(`   state:       ${r.state}`);
  console.log(`   signing_key: ${SIGNING_KEY}\n`);
  console.log(
    "👉 Copy the signing_key into your prod env as CALENDLY_WEBHOOK_SIGNING_KEY and redeploy."
  );
}

async function list() {
  const { userUri, orgUri } = await getMe();
  const qs = new URLSearchParams({
    organization: orgUri,
    scope: SCOPE,
  });
  if (SCOPE === "user") qs.set("user", userUri);

  const res = await api(`/webhook_subscriptions?${qs.toString()}`);
  const subs = res.collection || [];
  if (subs.length === 0) {
    console.log("No webhook subscriptions found for this scope.");
    return;
  }
  for (const s of subs) {
    console.log(`${s.uri}`);
    console.log(`  url:    ${s.callback_url}`);
    console.log(`  state:  ${s.state}`);
    console.log(`  events: ${s.events.join(", ")}`);
    console.log(`  scope:  ${s.scope}\n`);
  }
}

async function del(uuid) {
  if (!uuid) {
    console.error("Usage: node scripts/register-calendly-webhook.mjs delete <uuid>");
    process.exit(1);
  }
  await api(`/webhook_subscriptions/${uuid}`, { method: "DELETE" });
  console.log(`✅ Deleted ${uuid}`);
}

const [, , cmd, arg] = process.argv;
switch (cmd) {
  case "create":
    await create();
    break;
  case "list":
    await list();
    break;
  case "delete":
    await del(arg);
    break;
  default:
    console.error("Usage:");
    console.error("  node scripts/register-calendly-webhook.mjs create");
    console.error("  node scripts/register-calendly-webhook.mjs list");
    console.error("  node scripts/register-calendly-webhook.mjs delete <uuid>");
    process.exit(1);
}
