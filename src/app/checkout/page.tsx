import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CheckoutForm, { type CheckoutPrefill } from "@/components/checkout/CheckoutForm";
import { getShippingMethods } from "@/lib/data/catalog";
import { createClient } from "@/lib/supabase/server";
import { toLocalPhone } from "@/lib/validators/checkout";

export const metadata: Metadata = { title: "Checkout" };

type ProfileRow = { full_name: string | null; email: string | null; phone: string | null };
type AddressRow = {
  recipient: string;
  phone: string;
  street: string;
  unit: string | null;
  state: string;
  lga: string;
  landmark: string | null;
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // The proxy already redirects signed-out visitors; this is a safety net.
  if (!user) redirect("/login?next=/checkout");

  const [shippingMethods, profileRes, addressRes] = await Promise.all([
    getShippingMethods(),
    supabase.from("profiles").select("full_name, email, phone").eq("id", user.id).maybeSingle<ProfileRow>(),
    supabase
      .from("addresses")
      .select("recipient, phone, street, unit, state, lga, landmark")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle<AddressRow>(),
  ]);

  const profile = profileRes.data;
  const address = addressRes.data;
  const fullName = (address?.recipient || profile?.full_name || "").trim();
  const [firstName = "", ...rest] = fullName.split(/\s+/).filter(Boolean);

  const prefill: CheckoutPrefill = {
    firstName,
    lastName: rest.join(" "),
    email: profile?.email || user.email || "",
    phone: toLocalPhone(address?.phone || profile?.phone),
    street: address?.street ?? "",
    unit: address?.unit ?? "",
    state: address?.state ?? "Lagos",
    lga: address?.lga ?? "",
    landmark: address?.landmark ?? "",
    hasDefaultAddress: Boolean(address),
  };

  return <CheckoutForm shippingMethods={shippingMethods} prefill={prefill} />;
}
