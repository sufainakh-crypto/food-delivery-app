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
            onLogin(response.data.user, response.data.token);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const fillMockCredentials = () => {
        setEmail("user@example.com");
        setPassword("password123");
    };

    return (
        <div className="row justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <div className="col-md-5">
                <div className="card shadow-lg border-0 rounded-4">
                    <div className="card-body p-5">
                        <div className="text-center mb-4">
                            <i className="bi bi-person-circle text-primary" style={{ fontSize: "3rem" }}></i>
                            <h2 className="fw-bold mt-2 text-dark">Welcome Back</h2>
                            <p className="text-muted">Sign in to order your favorite food</p>
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
                                className="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold shadow-sm mb-3"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Signing In...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                        <button
                            type="button"
                            className="btn btn-outline-secondary w-100 py-2 rounded-3 fw-medium mb-4"
                            onClick={fillMockCredentials}
                        >
                            <i className="bi bi-lightning-fill text-warning me-1"></i>
                            Quick Fill Mock Credentials
                        </button>

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
