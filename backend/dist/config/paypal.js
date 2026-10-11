import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
const paypalConfig = () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    return process.env.PAYPAL_MODE === "live"
        ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
        : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
};
const client = () => {
    return new checkoutNodeJssdk.core.PayPalHttpClient(paypalConfig());
};
export default client;
//# sourceMappingURL=paypal.js.map