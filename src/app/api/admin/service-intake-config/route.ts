import type { NextRequest } from "next/server";
import {
  getServiceIntakeConfig,
  saveServiceIntakeConfig,
} from "@/lib/service-intake-config";
import { updateServiceIntakeConfigSchema } from "@/lib/validation";

export async function GET() {
  try {
    const config = await getServiceIntakeConfig();
    return Response.json({ config });
  } catch (err) {
    console.error("GET /api/admin/service-intake-config error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateServiceIntakeConfigSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const config = await saveServiceIntakeConfig(parsed.data);
    return Response.json({ config });
  } catch (err) {
    console.error("PATCH /api/admin/service-intake-config error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
