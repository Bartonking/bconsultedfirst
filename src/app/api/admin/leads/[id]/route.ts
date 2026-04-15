import type { NextRequest } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import type { Lead } from "@/lib/types";

const patchSchema = z.object({
  archivedAt: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/leads/[id]">
) {
  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const db = getDb();
    const docRef = db.collection(COLLECTIONS.leads).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const current = doc.data() as Lead;
    const updatePayload: Record<string, unknown> = {};
    const responsePatch: Partial<Lead> = {};

    if (parsed.data.archivedAt !== undefined) {
      if (parsed.data.archivedAt === null || parsed.data.archivedAt === "") {
        updatePayload.archivedAt = FieldValue.delete();
        responsePatch.archivedAt = undefined;
      } else {
        updatePayload.archivedAt = parsed.data.archivedAt;
        responsePatch.archivedAt = parsed.data.archivedAt;
      }
    }

    if (Object.keys(updatePayload).length > 0) {
      await docRef.update(updatePayload);
    }

    return Response.json({ lead: { ...current, ...responsePatch } });
  } catch (err) {
    console.error("PATCH /api/admin/leads/[id] error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/admin/leads/[id]">
) {
  try {
    const { id } = await ctx.params;
    const db = getDb();
    const docRef = db.collection(COLLECTIONS.leads).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const current = doc.data() as Lead;
    if (!current.archivedAt) {
      return Response.json(
        { error: "Lead must be archived before it can be deleted" },
        { status: 409 }
      );
    }

    await docRef.delete();
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/admin/leads/[id] error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
