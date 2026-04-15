import { getBookingSiteConfig } from "@/lib/site-config";
import { getBookingPriceLabel } from "@/lib/public-site-config";

export async function GET() {
  try {
    const config = await getBookingSiteConfig();
    return Response.json({
      config: {
        ...config,
        priceLabel: getBookingPriceLabel(config),
      },
    });
  } catch (err) {
    console.error("GET /api/site-config/booking error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
