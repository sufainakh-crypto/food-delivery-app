import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, onLogout, cartCount }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3">
            <div className="container">
                <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to={user && user.role === "admin" ? "/admin/dashboard" : "/"}>
                    <i className="bi bi-egg-fried text-warning me-2"></i>
                    5 Star Cafe
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {/* Regular user nav links */}
                        {(!user || user.role !== "admin") && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/">
                                    <i className="bi bi-house-door me-1"></i> Home
                                </Link>
                            </li>
                        )}
                        {user && user.role !== "admin" && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/orders">
                                        <i className="bi bi-clock-history me-1"></i> Orders
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link position-relative pe-3" to="/cart">
                                        <i className="bi bi-cart3 me-1"></i> Cart
                                        {cartCount > 0 && (
                                            <span className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.65rem", padding: "0.25em 0.5em" }}>
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            </>
                        )}
                        {/* Admin nav links */}
                        {user && user.role === "admin" && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/admin/dashboard">
                                        <i className="bi bi-speedometer2 me-1"></i> Dashboard
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/admin/owners">
                                        <i className="bi bi-people-fill me-1"></i> Owners
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/admin/food">
                                        <i className="bi bi-egg-fried me-1"></i> Menus
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                    <div className="d-flex align-items-center">
                        {user ? (
                            <>
                                <span className="text-light me-3 fw-medium">
                                    {user.role === "admin" ? (
                                        <i className="bi bi-shield-lock-fill text-warning me-1"></i>
                                    ) : (
                                        <i className="bi bi-person-circle text-warning me-1"></i>
                                    )}
                                    Hi, {user.name}
                                </span>
                                <button className="btn btn-outline-warning btn-sm rounded-3 fw-medium" onClick={handleLogout}>
                                    <i className="bi bi-box-arrow-right me-1"></i>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link className="btn btn-outline-light btn-sm me-2 px-3 rounded-3 fw-medium" to="/login">
                                    Login
                                </Link>
                                <Link className="btn btn-warning btn-sm px-3 rounded-3 fw-bold me-2" to="/register">
                                    Register
                                </Link>
                                <Link
                                    className="btn btn-sm px-3 rounded-3 fw-semibold d-flex align-items-center"
                                    to="/admin/login"
                                    style={{ background: "#212529", color: "#ffc107", border: "1px solid #ffc107" }}
                                    title="Admin Portal"
                                >
                                    <i className="bi bi-shield-lock-fill me-1"></i> Admin
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
