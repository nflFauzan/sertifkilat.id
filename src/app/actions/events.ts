"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { eventSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EventType } from "@prisma/client";

export async function createEventAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string || undefined,
    type: formData.get("type") as string,
    date: formData.get("date") as string,
    location: formData.get("location") as string || undefined,
  };

  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.event.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      type: parsed.data.type as EventType,
      date: new Date(parsed.data.date),
      location: parsed.data.location,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard/events");
  return { success: true };
}

export async function updateEventAction(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  // Verify ownership
  const event = await prisma.event.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!event) return { error: "Event tidak ditemukan" };

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string || undefined,
    type: formData.get("type") as string,
    date: formData.get("date") as string,
    location: formData.get("location") as string || undefined,
  };

  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.event.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      type: parsed.data.type as EventType,
      date: new Date(parsed.data.date),
      location: parsed.data.location,
    },
  });

  revalidatePath("/dashboard/events");
  return { success: true };
}

export async function deleteEventAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const event = await prisma.event.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!event) return { error: "Event tidak ditemukan" };

  await prisma.event.delete({ where: { id } });

  revalidatePath("/dashboard/events");
  return { success: true };
}
