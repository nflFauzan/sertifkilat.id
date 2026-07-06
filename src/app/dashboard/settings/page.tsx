import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pengaturan — SertifKilat.id",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  });

  if (!user) redirect("/auth/login");

  const serializedUser = {
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    image: user.image,
    createdAt: user.createdAt,
    provider: user.accounts.length > 0 ? user.accounts[0].provider : "email",
  };

  return <SettingsClient user={serializedUser} />;
}
