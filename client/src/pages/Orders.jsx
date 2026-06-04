import React from "react";

function Orders() {
    return (
        <div className="container mt-4">
            <h2 className="fw-bold mb-3">Your Orders</h2>
            <div className="alert alert-info" role="alert">
                <i className="bi bi-info-circle-fill me-2"></i>
                You have no orders yet.
            </div>
        </div>
    );
}

export default Orders;
