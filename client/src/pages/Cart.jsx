import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Services/api";

function Cart({ cart, updateCartQuantity, removeFromCart, clearCart, user }) {
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 0 ? 2.99 : 0;
    const tax = subtotal > 0 ? 1.50 : 0;
    const grandTotal = subtotal + deliveryFee + tax;

    const handleCheckout = () => {
        if (!user) {
            navigate("/login");
            return;
        }
        navigate("/checkout");
    };

    if (bookingSuccess) {
        return (
            <div className="row justify-content-center py-5">
                <div className="col-md-6 text-center">
                    <div className="card border-0 shadow-lg p-5 rounded-4 bg-white">
                        <div className="mb-4">
                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "5rem" }}></i>
                        </div>
                        <h2 className="fw-extrabold text-dark mb-2">Order Confirmed!</h2>
                        <p className="text-muted fs-5">Thank you for ordering with 5 Star Cafe.</p>
                        
                        {createdOrder && (
                            <div className="bg-light p-4 rounded-3 text-start my-4 border">
                                <h6 className="fw-bold mb-2">Order Details:</h6>
                                <p className="mb-1 text-secondary" style={{ fontSize: "0.9rem" }}>
                                    <strong className="text-dark">Order ID:</strong> {createdOrder._id}
                                </p>
                                <p className="mb-1 text-secondary" style={{ fontSize: "0.9rem" }}>
                                    <strong className="text-dark">Total Amount:</strong> ${createdOrder.totalAmount.toFixed(2)}
                                </p>
                                <p className="mb-0 text-secondary" style={{ fontSize: "0.9rem" }}>
                                    <strong className="text-dark">Status:</strong> <span className="badge bg-warning text-dark">{createdOrder.status}</span>
                                </p>
                            </div>
                        )}

                        <div className="d-grid gap-2">
                            <Link to="/orders" className="btn btn-warning py-2.5 rounded-3 fw-bold shadow-sm">
                                <i className="bi bi-clock-history me-1"></i> View My Orders
                            </Link>
                            <Link to="/" className="btn btn-outline-secondary py-2.5 rounded-3 fw-medium">
                                <i className="bi bi-house-door me-1"></i> Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="row justify-content-center py-5">
                <div className="col-md-7 text-center">
                    <div className="p-5 bg-white rounded-4 shadow-sm border">
                        <i className="bi bi-cart-x text-muted" style={{ fontSize: "4rem" }}></i>
                        <h4 className="fw-bold text-dark mt-3 mb-2">Your Cart is Empty</h4>
                        <p className="text-muted mb-4 col-md-10 mx-auto">Looks like you haven't added anything to your cart yet. Head back to the menu and choose from our mouth-watering options!</p>
                        <Link to="/" className="btn btn-warning px-4 py-2.5 rounded-pill fw-bold shadow-sm">
                            <i className="bi bi-arrow-left me-1"></i> Browse Restaurants
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="fw-bold mb-4 text-dark d-flex align-items-center">
                <i className="bi bi-cart3 text-warning me-2"></i> Shopping Cart
            </h2>

            {error && (
                <div className="alert alert-danger rounded-3 d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error}</div>
                </div>
            )}

            <div className="row g-4">
                {/* Cart Items List */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        {cart.map((item) => (
                            <div key={item._id} className="row align-items-center py-3 border-bottom last-border-0">
                                {/* Product Image */}
                                <div className="col-3 col-md-2">
                                    <img
                                        src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150"}
                                        alt={item.name}
                                        className="img-fluid rounded-3"
                                        style={{ height: "70px", width: "70px", objectFit: "cover" }}
                                    />
                                </div>
                                {/* Product Title & Price */}
                                <div className="col-5 col-md-4">
                                    <h6 className="fw-bold mb-1 text-dark">{item.name}</h6>
                                    <span className="text-muted" style={{ fontSize: "0.9rem" }}>${item.price.toFixed(2)} each</span>
                                </div>
                                {/* Quantity Controller */}
                                <div className="col-4 col-md-3 d-flex align-items-center justify-content-center">
                                    <div className="input-group input-group-sm rounded border overflow-hidden" style={{ maxWidth: "100px" }}>
                                        <button 
                                            className="btn btn-light border-0" 
                                            type="button"
                                            onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                                        >
                                            <i className="bi bi-dash"></i>
                                        </button>
                                        <span className="form-control text-center border-0 bg-white fw-bold d-flex align-items-center justify-content-center p-0" style={{ minWidth: "30px" }}>
                                            {item.quantity}
                                        </span>
                                        <button 
                                            className="btn btn-light border-0" 
                                            type="button"
                                            onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                                        >
                                            <i className="bi bi-plus"></i>
                                        </button>
                                    </div>
                                </div>
                                {/* Item Subtotal & Delete Button */}
                                <div className="col-12 col-md-3 d-flex align-items-center justify-content-between mt-3 mt-md-0">
                                    <h6 className="fw-extrabold text-dark m-0">${(item.price * item.quantity).toFixed(2)}</h6>
                                    <button 
                                        className="btn btn-outline-danger btn-sm border-0 rounded-circle"
                                        onClick={() => removeFromCart(item._id)}
                                        title="Remove item"
                                    >
                                        <i className="bi bi-trash-fill fs-5"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <h5 className="fw-bold mb-4 text-dark pb-2 border-bottom">Order Summary</h5>
                        
                        <div className="d-flex justify-content-between mb-2.5 text-secondary">
                            <span>Subtotal</span>
                            <span className="fw-medium text-dark">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2.5 text-secondary">
                            <span>Delivery Fee</span>
                            <span className="fw-medium text-dark">${deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-3 text-secondary">
                            <span>Estimated Tax</span>
                            <span className="fw-medium text-dark">${tax.toFixed(2)}</span>
                        </div>
                        
                        <div className="d-flex justify-content-between pt-3 border-top mb-4">
                            <span className="fw-bold text-dark fs-5">Total</span>
                            <span className="fw-extrabold text-warning fs-4">${grandTotal.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="btn btn-warning w-100 py-3 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                        >
                            {user ? (
                                <>
                                    <i className="bi bi-shield-lock-fill me-1.5"></i> Proceed to Checkout
                                </>
                            ) : (
                                "Sign In to Place Order"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;
