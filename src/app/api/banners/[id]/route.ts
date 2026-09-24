import { NextRequest, NextResponse } from "next/server";
import { deleteBanner } from "@/lib/firestore-service";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCurrentUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const docRef = doc(db, "banners", id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ banner: { id: snap.id, ...snap.data() } });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const docRef = doc(db, "banners", id);

    await updateDoc(docRef, {
      ...body,
      updatedAt: new Date().toISOString(),
    });

    const snap = await getDoc(docRef);
    return NextResponse.json({ banner: { id: snap.id, ...snap.data() } });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    await deleteBanner(id);

    return NextResponse.json({ message: "Banner deleted successfully" });
  } catch (error: any) {
    console.error("Delete banner error:", error);
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}
