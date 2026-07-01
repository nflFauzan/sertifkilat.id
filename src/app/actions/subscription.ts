"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Plan } from "@prisma/client";

export async function upgradeUserPlanAction(plan: Plan) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { plan },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/templates");
    revalidatePath("/dashboard/generator");
    return { success: true };
  } catch (error) {
    console.error("Error upgrading plan:", error);
    const err = error as { message?: string };
    return { error: err.message || "Gagal melakukan upgrade paket" };
  }
}
