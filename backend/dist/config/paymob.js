export const createPaymobIntention = async ({ amount, orderId, items, billingData, }) => {
    const secretKey = process.env.PAYMOB_SECRET_KEY;
    const publicKey = process.env.PAYMOB_PUBLIC_KEY;
    const integrationId = process.env.PAYMOB_INTEGRATION_ID;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    // === DEBUG LOGS — verify env values at runtime ===
    console.log("=== PAYMOB CONFIG CHECK ===");
    console.log("Secret Key Present:", !!secretKey);
    console.log("Public Key Present:", !!publicKey);
    console.log("Integration ID:", integrationId, "| Type:", typeof integrationId, "| As Number:", Number(integrationId));
    console.log("Amount (EGP):", amount, "→ Amount (cents):", Math.round(amount * 100));
    console.log("Order ID:", orderId);
    console.log("===========================");
    if (!secretKey || !publicKey || !integrationId) {
        throw new Error("Paymob credentials (PAYMOB_SECRET_KEY, PAYMOB_PUBLIC_KEY, PAYMOB_INTEGRATION_ID) are not configured");
    }
    const amountInCents = Math.round(amount * 100);
    const payload = {
        amount: amountInCents,
        currency: "EGP",
        // Must be an array of Numbers matching your integration ID(s)
        payment_methods: [Number(integrationId)],
        // special_reference must be a string (Paymob uses it to find your order on webhooks/redirect)
        special_reference: orderId.toString(),
        // items array — Paymob requires amount in cents per item too
        items: (items || []).map((item) => ({
            name: item.name || "Product",
            amount: Math.round(item.amount * 100),
            description: item.description || item.name || "Product",
            quantity: item.quantity || 1,
        })),
        // billing_data — all fields are required by Paymob; "NA" is accepted for optional ones
        billing_data: {
            first_name: billingData.firstName || "Test",
            last_name: billingData.lastName || "User",
            phone_number: billingData.phone || "01000000000",
            email: billingData.email || "test@example.com",
            apartment: "NA",
            floor: "NA",
            street: billingData.address || "Main Street",
            building: "NA",
            shipping_method: "PKG",
            postal_code: billingData.postalCode || "11371",
            city: billingData.city || "Cairo",
            country: billingData.country || "EGY",
            state: billingData.state || "Cairo",
        },
        // customer block (Unified Checkout shows name/email on checkout page)
        customer: {
            first_name: billingData.firstName || "Test",
            last_name: billingData.lastName || "User",
            email: billingData.email || "test@example.com",
        },
        // extras — carried through to webhooks for internal reference
        extras: {
            order_id: orderId,
        },
        // redirection after payment
        redirection_url: `${frontendUrl}/checkout/success?orderId=${orderId}`,
    };
    console.log("=== PAYMOB PAYLOAD ===");
    console.log(JSON.stringify(payload, null, 2));
    console.log("======================");
    const response = await fetch("https://accept.paymob.com/v1/intention/", {
        method: "POST",
        headers: {
            Authorization: `Token ${secretKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || !data.client_secret) {
        // Log detailed error so we can see exactly which field Paymob rejected
        console.error("=== PAYMOB ERROR ===");
        console.error("Status:", response.status);
        console.error("Error Body:", JSON.stringify(data, null, 2));
        console.error("====================");
        throw new Error(data?.message ||
            data?.detail ||
            (typeof data === "object" ? JSON.stringify(data) : null) ||
            "Failed to initiate Paymob payment session");
    }
    const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${data.client_secret}`;
    return {
        clientSecret: data.client_secret,
        checkoutUrl,
        intentionOrderId: data.intention_order_id,
    };
};
//# sourceMappingURL=paymob.js.map