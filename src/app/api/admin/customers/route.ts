import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getAllCustomers, findUserById } from "@/lib/firestore-users";
import { getOrders } from "@/lib/firestore-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const customers = await getAllCustomers();
    const allOrders = await getOrders();

    const parsed = await Promise.all(
      customers
        .filter((c) => c.role === "CUSTOMER")
        .map(async (c) => {
          const userOrders = allOrders.filter((o) => o.userId === c.id || o.customerEmail === c.email);
          const totalSpend = userOrders
            .filter((o) => o.paymentStatus === "PAID" || o.orderStatus === "DELIVERED")
            .reduce((sum, o) => sum + o.total, 0);

          const fullUser = await findUserById(c.id);
          const defaultAddress = fullUser?.addresses?.find((a) => a.isDefault) || fullUser?.addresses?.[0] || null;

          return {
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            totalOrders: userOrders.length,
            totalSpend,
            defaultAddress,
            joinedDate: c.createdAt || new Date().toISOString(),
          };
        })
    );

    return NextResponse.json({ customers: parsed });
  } catch (error: any) {
    console.error("Admin customers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
