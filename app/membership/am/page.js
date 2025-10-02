import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/session";
import AMPageClient from "./components/AMPageClient";

export default async function AMMembership() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/login?redirect=/membership/am");
  }

  return <AMPageClient />;
}
