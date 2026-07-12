import { redirect } from "next/navigation";

// /generator is a legacy route - redirect directly to the authenticated /dashboard/generator
export default function GeneratorRedirectPage() {
  redirect("/dashboard/generator");
}
