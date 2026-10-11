import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

const paypalConfig = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID as string;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET as string;

  return process.env.PAYPAL_MODE === "live"
    ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
    : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
};

const client = () => {
  return new checkoutNodeJssdk.core.PayPalHttpClient(paypalConfig());
};

export default client;
