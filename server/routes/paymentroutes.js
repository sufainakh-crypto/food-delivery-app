const router = require("express").Router();
const auth = require("../middleware/auth");
const stripe = require("stripe");

// POST /api/payment/process - Process a payment
router.post("/process", auth, async (req, res) => {
    try {
        const { paymentMethod, amount, cardDetails, upiId } = req.body;

        if (!paymentMethod) {
            return res.status(400).json({ success: false, message: "Payment method is required" });
        }
        if (!amount) {
            return res.status(400).json({ success: false, message: "Amount is required" });
        }

        // Simulate network delay for verification (1.5 seconds)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // 1. Stripe Fallback Logic (if a real secret is provided)
        const stripeSecret = process.env.STRIPE_SECRET;
        if (stripeSecret && stripeSecret !== "your_secret_key" && stripeSecret.startsWith("sk_")) {
            try {
                const stripeClient = stripe(stripeSecret);
                // Create a PaymentIntent with Stripe
                const paymentIntent = await stripeClient.paymentIntents.create({
                    amount: Math.round(amount * 100), // amount in cents
                    currency: "usd",
                    payment_method_types: ["card"],
                    metadata: { userId: req.user.id }
                });
                return res.json({
                    success: true,
                    message: "Stripe payment intent created successfully",
                    transactionId: paymentIntent.id,
                    stripeClientSecret: paymentIntent.client_secret
                });
            } catch (stripeError) {
                console.error("Stripe Error (falling back to simulation):", stripeError.message);
                // Fall back gracefully to simulation
            }
        }

        // 2. Payment Simulation Logic
        if (paymentMethod === "Card") {
            const { cardNumber, cardholderName, expiryDate, cvv } = cardDetails || {};

            if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
                return res.status(400).json({
                    success: false,
                    message: "All card details are required for credit/debit card payments"
                });
            }

            // Clean card number of spaces
            const cleanCardNumber = cardNumber.replace(/\s+/g, "");
            if (cleanCardNumber.length < 15 || cleanCardNumber.length > 16) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid card number length. Must be 15 or 16 digits."
                });
            }

            // Expiry Date validation check (basic format MM/YY)
            if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid expiry date format. Please use MM/YY."
                });
            }

            // CVV simulation testing trigger: if CVV is '999', trigger a simulated bank decline error
            if (cvv === "999") {
                return res.status(402).json({
                    success: false,
                    message: "Transaction declined by the issuing bank. Insufficient funds or invalid card status."
                });
            }

            if (cvv.length < 3 || cvv.length > 4) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid CVV length. Must be 3 or 4 digits."
                });
            }

            const transactionId = "txn_" + Math.random().toString(36).substr(2, 9).toUpperCase();
            return res.json({
                success: true,
                message: "Simulated credit card transaction successful",
                transactionId
            });

        } else if (paymentMethod === "UPI") {
            if (!upiId) {
                return res.status(400).json({
                    success: false,
                    message: "UPI ID is required for UPI payments"
                });
            }

            if (!upiId.includes("@")) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid UPI ID. Format should be username@bankname"
                });
            }

            // CVV/VPA simulation testing trigger: if UPI ID is 'fail@upi', trigger simulated error
            if (upiId.toLowerCase() === "fail@upi") {
                return res.status(402).json({
                    success: false,
                    message: "UPI Transaction timed out. No response received from customer's UPI app."
                });
            }

            const transactionId = "upi_" + Math.random().toString(36).substr(2, 9).toUpperCase();
            return res.json({
                success: true,
                message: "Simulated UPI transaction successful",
                transactionId
            });

        } else {
            return res.status(400).json({
                success: false,
                message: "Unsupported payment method for backend processing"
            });
        }

    } catch (error) {
        console.error("Payment processing error:", error);
        res.status(500).json({ success: false, message: "Internal server error during payment processing" });
    }
});

module.exports = router;
