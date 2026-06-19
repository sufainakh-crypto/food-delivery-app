import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../Services/api";

function AdminDashboard() {
    const [stats, setStats] = useState({
        restaurants: 0,
        foodItems: 0,
        users: 0,
        owners: 0,
        orders: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get("/admin/stats");
                setStats(response.data.stats);
                setRecentOrders(response.data.recentOrders);
            } catch (err) {
                setError("Failed to fetch dashboard data. Please try again.");
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="text-center my-5 py-5">
                <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                    <span className="visually-hidden">Loading Dashboard...</span>
                </div>
                <h4 className="mt-3 text-secondary">Loading statistics & recent activities...</h4>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger my-4 rounded-3 d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-octagon-fill me-2 fs-4"></i>
                <div>{error}</div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-2">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="fw-bold text-dark">Admin Control Panel</h1>
                    <p className="text-muted mb-0">Overview of restaurants, items, and system activity</p>
                </div>
                <div className="btn-group shadow-sm">
                    <Link to="/admin/owners" className="btn btn-primary fw-medium">
                        <i className="bi bi-people-fill me-1"></i> Manage Owners
                    </Link>
                    <Link to="/admin/food" className="btn btn-warning fw-medium text-dark">
                        <i className="bi bi-egg-fried me-1"></i> Manage Menus
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="row g-4 mb-5">
                {/* Restaurants */}
                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white hover-card">
                        <div className="d-flex align-items-center">
                            <div className="rounded-4 bg-primary bg-opacity-10 p-3 text-primary me-3">
                                <i className="bi bi-shop fs-1"></i>
                            </div>
                            <div>
                                <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: "0.75rem" }}>Restaurants</h6>
                                <h2 className="fw-bold mb-0 text-dark">{stats.restaurants}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Food Items */}
                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white hover-card">
                        <div className="d-flex align-items-center">
                            <div className="rounded-4 bg-warning bg-opacity-10 p-3 text-warning me-3">
                                <i className="bi bi-egg-fried fs-1"></i>
                            </div>
                            <div>
                                <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: "0.75rem" }}>Food Items</h6>
                                <h2 className="fw-bold mb-0 text-dark">{stats.foodItems}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Owners */}
                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white hover-card">
                        <div className="d-flex align-items-center">
                            <div className="rounded-4 bg-success bg-opacity-10 p-3 text-success me-3">
                                <i className="bi bi-person-badge fs-1"></i>
                            </div>
                            <div>
                                <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: "0.75rem" }}>Owners</h6>
                                <h2 className="fw-bold mb-0 text-dark">{stats.owners}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders */}
                <div className="col-md-6 col-lg-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white hover-card">
                        <div className="d-flex align-items-center">
                            <div className="rounded-4 bg-danger bg-opacity-10 p-3 text-danger me-3">
                                <i className="bi bi-cart-check fs-1"></i>
                            </div>
                            <div>
                                <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: "0.75rem" }}>Total Orders</h6>
                                <h2 className="fw-bold mb-0 text-dark">{stats.orders}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                        <h4 className="fw-bold text-dark mb-4">
                            <i className="bi bi-clock-history me-2 text-primary"></i>
                            Recent Orders
                        </h4>
                        
                        {recentOrders.length === 0 ? (
                            <div className="text-center py-4">
                                <i className="bi bi-inbox text-muted" style={{ fontSize: "2rem" }}></i>
                                <p className="text-muted mt-2">No orders placed in the system yet.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Payment Method</th>
                                            <th>Total Amount</th>
                                            <th>Payment Status</th>
                                            <th>Delivery Address</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order) => {
                                            let badgeColor = "bg-warning text-dark";
                                            if (order.status === "Confirmed") badgeColor = "bg-success";
                                            else if (order.status === "Cancelled") badgeColor = "bg-danger";

                                            let payBadgeColor = "bg-warning text-dark";
                                            if (order.paymentStatus === "Completed" || order.paymentStatus === "Paid") payBadgeColor = "bg-success text-white";
                                            else if (order.paymentStatus === "Failed") payBadgeColor = "bg-danger text-white";

                                            return (
                                                <tr key={order._id}>
                                                    <td className="fw-semibold text-secondary">
                                                        <small>{order._id}</small>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-secondary">{order.paymentMethod}</span>
                                                    </td>
                                                    <td className="fw-bold text-dark">
                                                        ${Number(order.totalAmount).toFixed(2)}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${payBadgeColor}`}>
                                                            {order.paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted text-truncate" style={{ maxWidth: "200px" }}>
                                                        {order.address}
                                                    </td>
                                                    <td>
                                                        <span className={`badge rounded-pill ${badgeColor}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
