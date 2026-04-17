import type { NextRequest } from "next/server";
import {
  getBookingSiteConfig,
  saveBookingSiteConfig,
} from "@/lib/site-config";
import { getBookingPriceLabel } from "@/lib/public-site-config";
import { captureRouteException } from "@/lib/sentry/server";
import { updateBookingSiteConfigSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const config = await getBookingSiteConfig();
    return Response.json({
      config: {
        ...config,
        priceLabel: getBookingPriceLabel(config),
      },
    });
  } catch (err) {
    await captureRouteException(err, {
      surface: "api",
      route: "/api/admin/site-config/booking",
      request,
      statusCode: 500,
    });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateBookingSiteConfigSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const config = await saveBookingSiteConfig(parsed.data);
    return Response.json({
      config: {
        ...config,
        priceLabel: getBookingPriceLabel(config),
      },
    });
  } catch (err) {
    await captureRouteException(err, {
      surface: "api",
      route: "/api/admin/site-config/booking",
      request,
      statusCode: 500,
    });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
