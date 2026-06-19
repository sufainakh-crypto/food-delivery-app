import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Services/api";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/users/login", { email, password });
            const { user, token } = response.data;
            onLogin(user, token);

            // Auto-redirect based on role
            if (user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const fillUserCredentials = () => {
        setEmail("user@example.com");
        setPassword("password123");
    };

    const fillAdminCredentials = () => {
        setEmail("admin@example.com");
        setPassword("admin123");
    };

    return (
        <div className="row justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <div className="col-md-5">
                <div className="card shadow-lg border-0 rounded-4">
                    <div className="card-body p-5">
                        <div className="text-center mb-4">
                            <i className="bi bi-egg-fried text-warning" style={{ fontSize: "3rem" }}></i>
                            <h2 className="fw-bold mt-2 text-dark">Welcome to 5 Star Cafe</h2>
                            <p className="text-muted">Sign in as a customer or administrator</p>
                        </div>

                        {error && (
                            <div className="alert alert-danger d-flex align-items-center rounded-3 mb-4" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                <div>{error}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Email Address</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="bi bi-envelope text-muted"></i>
                                    </span>
                                    <input
                                        type="email"
                                        className="form-control bg-light border-start-0 ps-0"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold text-secondary">Password</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="bi bi-lock text-muted"></i>
                                    </span>
                                    <input
                                        type="password"
                                        className="form-control bg-light border-start-0 ps-0"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 rounded-3 fw-semibold shadow-sm mb-3"
                                style={{ padding: "0.6rem" }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Signing In...
                                    </>
                                ) : (
                                    <><i className="bi bi-box-arrow-in-right me-1"></i> Sign In</>
                                )}
                            </button>
                        </form>

                        {/* Quick fill buttons */}
                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary w-100 rounded-3 fw-medium"
                                    style={{ fontSize: "0.8rem" }}
                                    onClick={fillUserCredentials}
                                >
                                    <i className="bi bi-lightning-fill text-warning me-1"></i>
                                    Quick User Login
                                </button>
                            </div>
                            <div className="col-6">
                                <button
                                    type="button"
                                    className="btn w-100 rounded-3 fw-medium"
                                    style={{ fontSize: "0.8rem", background: "#212529", color: "#ffc107", border: "1px solid #ffc107" }}
                                    onClick={fillAdminCredentials}
                                >
                                    <i className="bi bi-shield-lock-fill me-1"></i>
                                    Quick Admin Login
                                </button>
                            </div>
                        </div>

                        <hr className="text-muted" />

                        <div className="text-center mt-3">
                            <span className="text-muted">Don't have an account? </span>
                            <Link to="/register" className="text-primary fw-bold text-decoration-none">
                                Register Here
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
