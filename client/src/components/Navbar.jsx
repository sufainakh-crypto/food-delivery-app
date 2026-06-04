import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, onLogout }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3">
            <div className="container">
                <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to="/">
                    <i className="bi bi-egg-fried text-warning me-2"></i>
                    Gourmet Express
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
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                <i className="bi bi-house-door me-1"></i> Home
                            </Link>
                        </li>
                        {user && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/orders">
                                        <i className="bi bi-clock-history me-1"></i> Orders
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/cart">
                                        <i className="bi bi-cart3 me-1"></i> Cart
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                    <div className="d-flex align-items-center">
                        {user ? (
                            <>
                                <span className="text-light me-3 fw-medium">
                                    <i className="bi bi-person-circle text-warning me-1"></i>
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
                                <Link className="btn btn-warning btn-sm px-3 rounded-3 fw-bold" to="/register">
                                    Register
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
