import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import OrderConfirmation from "@/components/confirmation/OrderConfirmation";
import { getBankDetails } from "@/lib/email/bank";
import { createClient } from "@/lib/supabase/server";
import { getOrderForUser } from "./getOrder";

export const metadata: Metadata = { title: "Order Confirmation", robots: { index: false } };

export default async function OrderConfirmationPage({ params }: PageProps<"/order-confirmation/[orderNumber]">) {
  const { orderNumber } = await params;
  const number = decodeURIComponent(orderNumber);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/order-confirmation/${orderNumber}`)}`);

  const order = await getOrderForUser(number, user.id);
  if (!order) notFound();

  return <OrderConfirmation order={order} bank={getBankDetails()} />;
}
