import React from "react";

function Cart() {
    return (
        <div className="container mt-4">
            <h2 className="fw-bold mb-3">Shopping Cart</h2>
            <div className="alert alert-info" role="alert">
                <i className="bi bi-info-circle-fill me-2"></i>
                Your shopping cart is currently empty.
            </div>
        </div>
    );
}

export default Cart;
