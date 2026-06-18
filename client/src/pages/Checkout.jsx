import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Services/api";

function Checkout({ cart, clearCart, user }) {
    const navigate = useNavigate();

    // Redirect if cart is empty and not on success screen
    useEffect(() => {
        if (cart.length === 0 && step !== "success") {
            navigate("/cart");
        }
    }, [cart, navigate]);

    const [deliveryDetails, setDeliveryDetails] = useState({
        name: user?.name || "",
        phone: "",
        address: ""
    });

    const [paymentMethod, setPaymentMethod] = useState("Card"); // Card, UPI, COD
    const [cardDetails, setCardDetails] = useState({
        cardholderName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: ""
    });
    const [upiId, setUpiId] = useState("");
    
    // Checkout flow states
    const [step, setStep] = useState("input"); // input, processing, success, failure
    const [processingMessage, setProcessingMessage] = useState("");
    const [processingProgress, setProcessingProgress] = useState(0);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    // Calculate totals
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 0 ? 2.99 : 0;
    const tax = subtotal > 0 ? 1.50 : 0;
    const grandTotal = subtotal + deliveryFee + tax;

    // Handle delivery form inputs
    const handleDeliveryChange = (e) => {
        const { name, value } = e.target;
        setDeliveryDetails(prev => ({ ...prev, [name]: value }));
    };

    // Format Card Number (XXXX XXXX XXXX XXXX)
    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 16) value = value.slice(0, 16);
        const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
        setCardDetails(prev => ({ ...prev, cardNumber: formatted }));
    };

    // Format Expiry Date (MM/YY)
    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length > 2) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }
        setCardDetails(prev => ({ ...prev, expiryDate: value }));
    };

    const handleCardDetailsChange = (e) => {
        const { name, value } = e.target;
        setCardDetails(prev => ({ ...prev, [name]: value }));
    };

    // Trigger payment process
    const handleProcessPayment = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        // Basic validation
        if (!deliveryDetails.name.trim() || !deliveryDetails.phone.trim() || !deliveryDetails.address.trim()) {
            setErrorMessage("Please complete all delivery details.");
            return;
        }

        if (paymentMethod === "Card") {
            const cleanCard = cardDetails.cardNumber.replace(/\s+/g, "");
            if (cleanCard.length < 15) {
                setErrorMessage("Please enter a valid credit card number.");
                return;
            }
            if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
                setErrorMessage("Please enter expiry date in MM/YY format.");
                return;
            }
            if (cardDetails.cvv.length < 3) {
                setErrorMessage("Please enter a valid CVV.");
                return;
            }
        } else if (paymentMethod === "UPI") {
            if (!upiId.trim() || !upiId.includes("@")) {
                setErrorMessage("Please enter a valid UPI ID (e.g. user@okaxis).");
                return;
            }
        }

        // Start premium loading simulation
        setStep("processing");
        setProcessingProgress(5);
        setProcessingMessage("Initiating secure connection with gateway...");

        const progressStages = [
            { threshold: 25, message: "Encrypting transaction details (AES-256)..." },
            { threshold: 50, message: "Routing request to 3D-Secure merchant portal..." },
            { threshold: 75, message: "Awaiting authorization from bank network..." },
            { threshold: 95, message: "Validating funds and recording order details..." }
        ];

        // Animate progress bar
        let currentProgress = 5;
        const progressInterval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 8) + 3;
            if (currentProgress > 98) currentProgress = 98;
            setProcessingProgress(currentProgress);

            const stage = progressStages.find(s => currentProgress <= s.threshold);
            if (stage) setProcessingMessage(stage.message);
        }, 120);

        try {
            let paymentTransactionId = "";

            // Call Backend Payment Process Route if not Cash On Delivery
            if (paymentMethod !== "COD") {
                const response = await api.post("/payment/process", {
                    paymentMethod,
                    amount: grandTotal,
                    cardDetails: paymentMethod === "Card" ? {
                        cardNumber: cardDetails.cardNumber,
                        cardholderName: cardDetails.cardholderName,
                        expiryDate: cardDetails.expiryDate,
                        cvv: cardDetails.cvv
                    } : null,
                    upiId: paymentMethod === "UPI" ? upiId : null
                });
                paymentTransactionId = response.data.transactionId;
            } else {
                paymentTransactionId = "COD_" + Math.random().toString(36).substr(2, 9).toUpperCase();
            }

            // Create Order on DB
            const orderResponse = await api.post("/orders", {
                items: cart.map(item => ({
                    itemId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                })),
                totalAmount: grandTotal,
                address: deliveryDetails.address,
                phone: deliveryDetails.phone,
                paymentMethod,
                paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
                transactionId: paymentTransactionId
            });

            clearInterval(progressInterval);
            setProcessingProgress(100);
            setProcessingMessage("Transaction complete! Generating receipt...");

            setTimeout(() => {
                setCreatedOrder(orderResponse.data.order);
                setStep("success");
                clearCart();
            }, 600);

        } catch (err) {
            clearInterval(progressInterval);
            console.error("Payment failed:", err);
            const errMsg = err.response?.data?.message || "Payment Gateway Timeout. Please verify details and try again.";
            setErrorMessage(errMsg);
            setStep("failure");
        }
    };

    if (step === "processing") {
        return (
            <div className="row justify-content-center py-5">
                <div className="col-md-6 text-center">
                    <div className="card border-0 shadow-lg p-5 rounded-4 bg-white text-center">
                        <div className="mb-4 mt-2 position-relative d-inline-block">
                            <div className="spinner-border text-warning" role="status" style={{ width: "6rem", height: "6rem", borderWidth: "0.45rem" }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <div className="position-absolute top-50 start-50 translate-middle">
                                <i className="bi bi-shield-fill-check text-warning" style={{ fontSize: "2.5rem" }}></i>
                            </div>
                        </div>
                        <h3 className="fw-extrabold text-dark mb-2">Processing Your Payment</h3>
                        <p className="text-secondary mb-4 fs-6">{processingMessage}</p>
                        
                        <div className="progress rounded-pill mb-3" style={{ height: "10px" }}>
                            <div 
                                className="progress-bar progress-bar-striped progress-bar-animated bg-warning" 
                                role="progressbar" 
                                style={{ width: `${processingProgress}%`, transition: "width 0.15s ease-out" }}
                                aria-valuenow={processingProgress} 
                                aria-valuemin="0" 
                                aria-valuemax="100"
                            ></div>
                        </div>
                        <small className="text-muted d-flex align-items-center justify-content-center gap-1">
                            <i className="bi bi-lock-fill"></i> Secure 256-bit SSL connection
                        </small>
                    </div>
                </div>
            </div>
        );
    }

    if (step === "failure") {
        return (
            <div className="row justify-content-center py-5">
                <div className="col-md-6 text-center">
                    <div className="card border-0 shadow-lg p-5 rounded-4 bg-white">
                        <div className="mb-4">
                            <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: "5rem" }}></i>
                        </div>
                        <h2 className="fw-extrabold text-dark mb-2">Transaction Failed</h2>
                        <p className="text-muted fs-6">We encountered an issue while processing your payment.</p>
                        
                        <div className="alert alert-danger border-0 rounded-3 my-4 p-3 d-flex align-items-center justify-content-center gap-2">
                            <i className="bi bi-exclamation-octagon-fill fs-5"></i>
                            <span className="fw-medium text-start">{errorMessage}</span>
                        </div>

                        <div className="d-grid gap-2">
                            <button onClick={() => setStep("input")} className="btn btn-warning py-2.5 rounded-3 fw-bold shadow-sm">
                                <i className="bi bi-arrow-clockwise me-1"></i> Try Again / Change Payment Method
                            </button>
                            <Link to="/cart" className="btn btn-outline-secondary py-2.5 rounded-3 fw-medium">
                                <i className="bi bi-cart me-1"></i> Return to Cart
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === "success" && createdOrder) {
        return (
            <div className="row justify-content-center py-5">
                <div className="col-md-7">
                    <div className="card border-0 shadow-lg p-5 rounded-4 bg-white text-center position-relative overflow-hidden">
                        {/* Background receipt highlights */}
                        <div className="position-absolute bg-success opacity-10" style={{ width: "300px", height: "300px", borderRadius: "50%", top: "-100px", right: "-100px" }}></div>
                        <div className="position-absolute bg-warning opacity-10" style={{ width: "200px", height: "200px", borderRadius: "50%", bottom: "-100px", left: "-100px" }}></div>
                        
                        <div className="mb-4">
                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "5.5rem" }}></i>
                        </div>
                        <h2 className="fw-extrabold text-dark mb-1">Order Confirmed!</h2>
                        <p className="text-muted fs-5 mb-4">Thank you for ordering with 5 Star Cafe.</p>

                        <div className="bg-light p-4 rounded-4 text-start border mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                                <h6 className="fw-bold m-0 text-dark">Invoice Details</h6>
                                <span className="badge bg-success px-3 py-1.5 rounded-pill">Paid</span>
                            </div>
                            
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <small className="text-muted d-block uppercase tracking-wider fs-9">ORDER ID</small>
                                    <span className="fw-semibold text-dark" style={{ fontSize: "0.85rem" }}>{createdOrder._id}</span>
                                </div>
                                <div className="col-sm-6">
                                    <small className="text-muted d-block uppercase tracking-wider fs-9">TRANSACTION ID</small>
                                    <span className="fw-semibold text-dark text-break" style={{ fontSize: "0.85rem" }}>{createdOrder.transactionId || "N/A"}</span>
                                </div>
                                <div className="col-sm-6">
                                    <small className="text-muted d-block uppercase tracking-wider fs-9">PAYMENT METHOD</small>
                                    <span className="fw-bold text-secondary text-capitalize">{createdOrder.paymentMethod}</span>
                                </div>
                                <div className="col-sm-6">
                                    <small className="text-muted d-block uppercase tracking-wider fs-9">TOTAL PAID</small>
                                    <span className="fw-extrabold text-warning fs-5">${createdOrder.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="col-12 border-top pt-3">
                                    <small className="text-muted d-block uppercase tracking-wider fs-9">DELIVERING TO</small>
                                    <span className="fw-medium text-dark">{createdOrder.address}</span>
                                </div>
                                <div className="col-sm-6">
                                    <small className="text-muted d-block uppercase tracking-wider fs-9">CONTACT PHONE</small>
                                    <span className="fw-medium text-dark">{createdOrder.phone}</span>
                                </div>
                                <div className="col-sm-6">
                                    <small className="text-muted d-block uppercase tracking-wider fs-9">ESTIMATED ARRIVAL</small>
                                    <span className="fw-bold text-success"><i className="bi bi-truck me-1"></i> 25 - 35 mins</span>
                                </div>
                            </div>
                        </div>

                        <div className="d-grid gap-3 d-sm-flex justify-content-center">
                            <Link to="/orders" className="btn btn-warning px-4 py-2.5 rounded-3 fw-bold shadow-sm flex-fill">
                                <i className="bi bi-clock-history me-1"></i> Track My Orders
                            </Link>
                            <Link to="/" className="btn btn-outline-secondary px-4 py-2.5 rounded-3 fw-medium flex-fill">
                                <i className="bi bi-house-door me-1"></i> Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-3">
            <h2 className="fw-bold mb-4 text-dark d-flex align-items-center">
                <i className="bi bi-shield-lock-fill text-warning me-2"></i> Checkout Securely
            </h2>

            {errorMessage && (
                <div className="alert alert-danger rounded-3 d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{errorMessage}</div>
                </div>
            )}

            <div className="row g-4">
                {/* Form fields */}
                <div className="col-lg-8">
                    <form onSubmit={handleProcessPayment}>
                        
                        {/* Step 1: Delivery Details */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                            <div className="d-flex align-items-center mb-3">
                                <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center me-2.5 fw-bold" style={{ width: "30px", height: "30px" }}>1</div>
                                <h5 className="fw-bold mb-0 text-dark">Delivery Address</h5>
                            </div>
                            
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label text-secondary fw-semibold small">Receiver's Name</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={deliveryDetails.name}
                                        onChange={handleDeliveryChange}
                                        className="form-control rounded-3 py-2 border-light-subtle bg-light-subtle" 
                                        placeholder="Full Name" 
                                        required 
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-secondary fw-semibold small">Contact Number</label>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        value={deliveryDetails.phone}
                                        onChange={handleDeliveryChange}
                                        className="form-control rounded-3 py-2 border-light-subtle bg-light-subtle" 
                                        placeholder="Mobile phone number" 
                                        required 
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label text-secondary fw-semibold small">Delivery Address</label>
                                    <textarea 
                                        name="address" 
                                        rows="3"
                                        value={deliveryDetails.address}
                                        onChange={handleDeliveryChange}
                                        className="form-control rounded-3 py-2 border-light-subtle bg-light-subtle" 
                                        placeholder="Complete home or office street address, building, floor/door number" 
                                        required
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Payment Details */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                            <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                                <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center me-2.5 fw-bold" style={{ width: "30px", height: "30px" }}>2</div>
                                <h5 className="fw-bold mb-0 text-dark">Payment Method</h5>
                            </div>

                            {/* Selectable Payment Tabs */}
                            <div className="row g-2 mb-4">
                                <div className="col-sm-4">
                                    <div 
                                        onClick={() => setPaymentMethod("Card")}
                                        className={`p-3 rounded-4 border text-center cursor-pointer h-100 transition d-flex flex-column align-items-center justify-content-center gap-1 ${
                                            paymentMethod === "Card" 
                                                ? "border-warning bg-warning-subtle text-warning-emphasis shadow-sm" 
                                                : "border-light-subtle text-secondary hover-bg-light"
                                        }`}
                                        style={{ cursor: "pointer", transition: "all 0.2s" }}
                                    >
                                        <i className="bi bi-credit-card-2-front fs-3"></i>
                                        <span className="fw-bold small">Credit / Debit Card</span>
                                    </div>
                                </div>
                                <div className="col-sm-4">
                                    <div 
                                        onClick={() => setPaymentMethod("UPI")}
                                        className={`p-3 rounded-4 border text-center cursor-pointer h-100 transition d-flex flex-column align-items-center justify-content-center gap-1 ${
                                            paymentMethod === "UPI" 
                                                ? "border-warning bg-warning-subtle text-warning-emphasis shadow-sm" 
                                                : "border-light-subtle text-secondary hover-bg-light"
                                        }`}
                                        style={{ cursor: "pointer", transition: "all 0.2s" }}
                                    >
                                        <i className="bi bi-qr-code-scan fs-3"></i>
                                        <span className="fw-bold small">UPI (QR / App)</span>
                                    </div>
                                </div>
                                <div className="col-sm-4">
                                    <div 
                                        onClick={() => setPaymentMethod("COD")}
                                        className={`p-3 rounded-4 border text-center cursor-pointer h-100 transition d-flex flex-column align-items-center justify-content-center gap-1 ${
                                            paymentMethod === "COD" 
                                                ? "border-warning bg-warning-subtle text-warning-emphasis shadow-sm" 
                                                : "border-light-subtle text-secondary hover-bg-light"
                                        }`}
                                        style={{ cursor: "pointer", transition: "all 0.2s" }}
                                    >
                                        <i className="bi bi-cash-coin fs-3"></i>
                                        <span className="fw-bold small">Cash on Delivery</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Details Entry */}
                            {paymentMethod === "Card" && (
                                <div className="row g-3">
                                    {/* Interactive Card Mockup */}
                                    <div className="col-12 d-flex justify-content-center mb-3">
                                        <div 
                                            className="card border-0 p-4 rounded-4 text-white shadow-lg d-flex flex-column justify-content-between"
                                            style={{
                                                width: "350px",
                                                height: "210px",
                                                background: "linear-gradient(135deg, #1f1f1f 0%, #3a3a3a 100%)",
                                                fontFamily: "'Share Tech Mono', monospace"
                                            }}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <i className="bi bi-cpu text-warning fs-3" style={{ opacity: "0.8" }}></i>
                                                <span className="fw-bold tracking-widest text-warning" style={{ fontSize: "1.1rem" }}>5 STAR</span>
                                            </div>
                                            
                                            <div className="my-3 text-center">
                                                <h4 className="m-0 tracking-widest" style={{ letterSpacing: "3px" }}>
                                                    {cardDetails.cardNumber || "•••• •••• •••• ••••"}
                                                </h4>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                <div>
                                                    <small className="d-block text-muted" style={{ fontSize: "0.6rem" }}>CARDHOLDER</small>
                                                    <span className="text-uppercase tracking-wider small">{cardDetails.cardholderName || "YOUR NAME"}</span>
                                                </div>
                                                <div className="d-flex gap-3">
                                                    <div>
                                                        <small className="d-block text-muted" style={{ fontSize: "0.6rem" }}>EXPIRES</small>
                                                        <span className="tracking-wider small">{cardDetails.expiryDate || "MM/YY"}</span>
                                                    </div>
                                                    <div>
                                                        <small className="d-block text-muted" style={{ fontSize: "0.6rem" }}>CVV</small>
                                                        <span className="tracking-wider small">{"•••"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label text-secondary fw-semibold small">Cardholder Name</label>
                                        <input 
                                            type="text" 
                                            name="cardholderName"
                                            value={cardDetails.cardholderName}
                                            onChange={handleCardDetailsChange}
                                            className="form-control rounded-3 py-2 border-light-subtle" 
                                            placeholder="Name as it appears on card" 
                                            required={paymentMethod === "Card"}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label text-secondary fw-semibold small">Card Number</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0 border-light-subtle"><i className="bi bi-credit-card text-muted"></i></span>
                                            <input 
                                                type="text" 
                                                name="cardNumber"
                                                value={cardDetails.cardNumber}
                                                onChange={handleCardNumberChange}
                                                className="form-control rounded-end-3 py-2 border-start-0 border-light-subtle" 
                                                placeholder="4000 1234 5678 9010" 
                                                required={paymentMethod === "Card"}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-secondary fw-semibold small">Expiry Date</label>
                                        <input 
                                            type="text" 
                                            name="expiryDate"
                                            value={cardDetails.expiryDate}
                                            onChange={handleExpiryChange}
                                            className="form-control rounded-3 py-2 border-light-subtle" 
                                            placeholder="MM/YY" 
                                            required={paymentMethod === "Card"}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label text-secondary fw-semibold small">CVV</label>
                                        <input 
                                            type="password" 
                                            name="cvv"
                                            maxLength="4"
                                            value={cardDetails.cvv}
                                            onChange={handleCardDetailsChange}
                                            className="form-control rounded-3 py-2 border-light-subtle" 
                                            placeholder="123" 
                                            required={paymentMethod === "Card"}
                                        />
                                        <div className="form-text text-muted" style={{ fontSize: "0.75rem" }}>
                                            Tip: Input <strong className="text-danger">999</strong> to simulate a card decline.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* UPI Details Entry */}
                            {paymentMethod === "UPI" && (
                                <div className="text-center p-3">
                                    <div className="mb-3 d-flex flex-column align-items-center justify-content-center">
                                        {/* Mock QR Code frame */}
                                        <div className="p-3 bg-light rounded-4 border border-light-subtle mb-2 d-inline-block">
                                            <i className="bi bi-qr-code text-dark" style={{ fontSize: "7rem" }}></i>
                                        </div>
                                        <small className="text-muted d-block">Scan QR with Google Pay, PhonePe, Paytm, or any UPI app to pay</small>
                                        <div className="my-3 text-secondary fw-bold small uppercase d-flex align-items-center justify-content-center gap-2 w-100">
                                            <span className="border-top flex-grow-1"></span>
                                            <span>OR ENTER UPI ID</span>
                                            <span className="border-top flex-grow-1"></span>
                                        </div>
                                    </div>

                                    <div className="col-md-8 mx-auto text-start">
                                        <label className="form-label text-secondary fw-semibold small">UPI ID / VPA</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0 border-light-subtle"><i className="bi bi-person-fill text-muted"></i></span>
                                            <input 
                                                type="text" 
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                className="form-control rounded-end-3 py-2 border-start-0 border-light-subtle" 
                                                placeholder="username@bank" 
                                                required={paymentMethod === "UPI"}
                                            />
                                        </div>
                                        <div className="form-text text-muted" style={{ fontSize: "0.75rem" }}>
                                            Tip: Enter <strong className="text-danger">fail@upi</strong> to simulate a UPI timeout.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cash on Delivery details */}
                            {paymentMethod === "COD" && (
                                <div className="p-4 bg-light rounded-4 border border-light-subtle d-flex align-items-start gap-3">
                                    <div className="bg-warning-subtle text-warning p-2.5 rounded-3">
                                        <i className="bi bi-info-circle-fill fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="fw-bold text-dark mb-1">Cash on Delivery Information</h6>
                                        <p className="text-secondary small mb-0">
                                            You can pay with Cash or Cards directly to our delivery executive when your hot food arrives. 
                                            Please make sure you have the exact amount or a card ready. No online pre-payment is required!
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="mt-4">
                            <button
                                type="submit"
                                className="btn btn-warning w-100 py-3 rounded-4 fw-bold shadow d-flex align-items-center justify-content-center gap-2"
                            >
                                <i className="bi bi-shield-fill-check"></i>
                                {paymentMethod === "COD" ? "Confirm Cash on Delivery Order" : `Pay $${grandTotal.toFixed(2)} & Secure Order`}
                            </button>
                        </div>

                    </form>
                </div>

                {/* Sidebar Order Summary */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white position-sticky" style={{ top: "90px" }}>
                        <h5 className="fw-bold mb-3 text-dark pb-2 border-bottom">Order Details</h5>
                        
                        {/* Items breakdown list */}
                        <div className="mb-4 overflow-auto" style={{ maxHeight: "240px" }}>
                            {cart.map((item) => (
                                <div key={item._id} className="d-flex align-items-center justify-content-between mb-3 last-mb-0">
                                    <div className="d-flex align-items-center">
                                        {item.image && (
                                            <img 
                                                src={item.image} 
                                                alt={item.name} 
                                                className="rounded-3 me-2.5 border"
                                                style={{ width: "45px", height: "45px", objectFit: "cover" }}
                                            />
                                        )}
                                        <div style={{ maxWidth: "150px" }}>
                                            <h6 className="fw-bold mb-0 text-dark text-truncate" style={{ fontSize: "0.85rem" }}>{item.name}</h6>
                                            <small className="text-muted" style={{ fontSize: "0.75rem" }}>Qty: {item.quantity}</small>
                                        </div>
                                    </div>
                                    <span className="fw-bold text-dark" style={{ fontSize: "0.85rem" }}>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        
                        {/* Receipt calculations */}
                        <div className="border-top pt-3">
                            <div className="d-flex justify-content-between mb-2 text-secondary small">
                                <span>Subtotal</span>
                                <span className="fw-medium text-dark">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 text-secondary small">
                                <span>Delivery Charge</span>
                                <span className="fw-medium text-dark">${deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 text-secondary small">
                                <span>Estimated Taxes</span>
                                <span className="fw-medium text-dark">${tax.toFixed(2)}</span>
                            </div>
                            
                            <div className="d-flex justify-content-between pt-3 border-top mb-1">
                                <span className="fw-bold text-dark fs-6">Grand Total</span>
                                <span className="fw-extrabold text-warning fs-5">${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default Checkout;
