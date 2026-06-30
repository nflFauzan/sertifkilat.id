import { redirect } from "next/navigation";

// /dashboard/generate is a legacy alias — redirect permanently to /dashboard/generator
export default function GeneratePage() {
  redirect("/dashboard/generator");
}
