import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Services/api";

function Orders({ user }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get("/orders");
            setOrders(res.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Failed to load orders history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const handleCancelOrder = async (orderId) => {
        setActionLoading(orderId);
        try {
            await api.put(`/orders/${orderId}`, { status: "Cancelled" });
            // Refresh order list
            const res = await api.get("/orders");
            setOrders(res.data);
        } catch (err) {
            console.error("Error cancelling order:", err);
            alert("Failed to cancel order: " + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="text-center my-5 py-5">
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading Orders...</span>
                </div>
                <p className="mt-2 text-muted">Retrieving your order history...</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="fw-bold mb-4 text-dark d-flex align-items-center">
                <i className="bi bi-clock-history text-warning me-2"></i> Your Orders
            </h2>

            {error && (
                <div className="alert alert-danger rounded-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            )}

            {orders.length === 0 ? (
                <div className="row justify-content-center py-5">
                    <div className="col-md-7 text-center">
                        <div className="p-5 bg-white rounded-4 shadow-sm border">
                            <i className="bi bi-box2 text-muted" style={{ fontSize: "4rem" }}></i>
                            <h4 className="fw-bold text-dark mt-3 mb-2">No Orders Yet</h4>
                            <p className="text-muted mb-4 col-md-10 mx-auto">You haven't placed any orders yet. Go back to our restaurants page and place your first food order!</p>
                            <Link to="/" className="btn btn-warning px-4 py-2.5 rounded-pill fw-bold shadow-sm">
                                <i className="bi bi-arrow-left me-1"></i> Order Now
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="row g-4">
                    {orders.map((order) => (
                        <div className="col-12" key={order._id}>
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                                {/* Card Header */}
                                <div className="card-header bg-light border-bottom p-4 d-md-flex justify-content-between align-items-center">
                                    <div className="mb-2 mb-md-0">
                                        <span className="text-muted uppercase" style={{ fontSize: "0.75rem", letterSpacing: "1px" }}>ORDER ID: {order._id}</span>
                                        <h6 className="fw-bold text-secondary mb-0 mt-0.5">
                                            Placed on: <span className="text-dark fw-medium">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Just Now"}</span>
                                        </h6>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <h5 className="fw-extrabold text-dark m-0">${order.totalAmount.toFixed(2)}</h5>
                                        <span className={`badge px-3 py-2 rounded-pill fs-7 ${
                                            order.status === "Pending" ? "bg-warning-subtle text-warning-emphasis border border-warning-subtle" :
                                            order.status === "Cancelled" ? "bg-danger-subtle text-danger-emphasis border border-danger-subtle" :
                                            "bg-success-subtle text-success-emphasis border border-success-subtle"
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Card Body - Items List */}
                                <div className="card-body p-4">
                                    <div className="list-group list-group-flush">
                                        {order.items.map((item, idx) => (
                                            <div className="list-group-item px-0 py-3 border-bottom last-border-0 d-flex justify-content-between align-items-center" key={idx}>
                                                <div className="d-flex align-items-center">
                                                    {item.image && (
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.name} 
                                                            className="rounded me-3" 
                                                            style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                                        />
                                                    )}
                                                    <div>
                                                        <h6 className="fw-bold mb-0 text-dark">{item.name}</h6>
                                                        <small className="text-muted">${item.price.toFixed(2)} x {item.quantity}</small>
                                                    </div>
                                                </div>
                                                <h6 className="fw-bold text-dark m-0">${(item.price * item.quantity).toFixed(2)}</h6>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Delivery & Payment Meta */}
                                    <div className="bg-light p-3 rounded-3 mt-3 border d-flex flex-wrap gap-4 text-start justify-content-between">
                                        <div style={{ flex: "1 1 250px" }}>
                                            <span className="text-muted d-block fw-bold text-uppercase mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Delivery Address</span>
                                            <span className="text-dark small fw-medium">{order.address || "Not Provided"}</span>
                                            {order.phone && (
                                                <div className="text-secondary small mt-1">
                                                    <i className="bi bi-telephone me-1"></i> {order.phone}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: "1 1 150px" }}>
                                            <span className="text-muted d-block fw-bold text-uppercase mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Payment Method</span>
                                            <span className="text-secondary small fw-bold text-capitalize">
                                                {order.paymentMethod === "Card" ? (
                                                    <><i className="bi bi-credit-card me-1 text-primary"></i> Credit/Debit Card</>
                                                ) : order.paymentMethod === "UPI" ? (
                                                    <><i className="bi bi-qr-code-scan me-1 text-info"></i> UPI Payment</>
                                                ) : order.paymentMethod === "COD" ? (
                                                    <><i className="bi bi-cash-coin me-1 text-success"></i> Cash on Delivery</>
                                                ) : (
                                                    order.paymentMethod || "Unknown"
                                                )}
                                            </span>
                                        </div>
                                        <div style={{ flex: "1 1 150px" }}>
                                            <span className="text-muted d-block fw-bold text-uppercase mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.5px" }}>Payment Status</span>
                                            <span className={`badge py-1 px-2.5 rounded-pill ${
                                                order.paymentStatus === "Paid" ? "bg-success-subtle text-success-emphasis border border-success-subtle" : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                                            }`} style={{ fontSize: "0.75rem" }}>
                                                {order.paymentStatus || "Pending"}
                                            </span>
                                            {order.transactionId && (
                                                <div className="text-muted small mt-1 font-monospace" style={{ fontSize: "0.7rem" }}>
                                                    TXN: {order.transactionId}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    {order.status === "Pending" && (
                                        <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                                            <button
                                                disabled={actionLoading === order._id}
                                                onClick={() => handleCancelOrder(order._id)}
                                                className="btn btn-outline-danger px-4 rounded-3 fw-semibold d-flex align-items-center btn-sm"
                                            >
                                                {actionLoading === order._id ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Cancelling...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-x-circle me-1.5"></i> Cancel Order
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Orders;
