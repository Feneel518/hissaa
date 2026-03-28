import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn(
    "[Razorpay] Missing credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
  );
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

export interface CreatePaymentLinkParams {
  amount: number; // in paise (INR × 100)
  currency?: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  callbackUrl?: string;
  referenceId?: string;
}

export async function createRazorpayPaymentLink({
  amount,
  currency = "INR",
  description,
  customerName,
  customerEmail,
  callbackUrl,
  referenceId,
}: CreatePaymentLinkParams): Promise<{
  id: string;
  short_url: string;
  status: string;
}> {
  const payload: any = {
    amount,
    currency,
    description,
    accept_partial: false,
    reference_id: referenceId,
    notify: {
      sms: false,
      email: !!customerEmail,
    },
    reminder_enable: false,
    callback_method: "get",
  };

  if (callbackUrl) {
    payload.callback_url = callbackUrl;
  }

  if (customerName || customerEmail) {
    payload.customer = {
      name: customerName,
      email: customerEmail,
    };
  }

  // @ts-ignore — Razorpay types are incomplete for paymentLink
  const link = await razorpay.paymentLink.create(payload);
  return link as { id: string; short_url: string; status: string };
}
