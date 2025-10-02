import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/session";
import ACPageClient from "./components/ACPageClient";

export default async function ACMembership() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/login?redirect=/membership/ac");
  }

  return <ACPageClient />;
}
