import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";

function AdminLogin({ onLogin }) {
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

            if (user.role !== "admin") {
                setError("Access denied. Only administrators can access this portal.");
                return;
            }

            onLogin(user, token);
            navigate("/admin/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const fillAdminCredentials = () => {
        setEmail("admin@example.com");
        setPassword("admin123");
    };

    return (
        <div className="row justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <div className="col-md-5">
                <div className="card shadow-lg border-0 rounded-4 bg-dark text-light">
                    <div className="card-body p-5">
                        <div className="text-center mb-4">
                            <i className="bi bi-shield-lock text-warning" style={{ fontSize: "3.5rem" }}></i>
                            <h2 className="fw-bold mt-2 text-warning">Admin Portal</h2>
                            <p className="text-muted-light">Sign in to manage the 5 Star Cafe system</p>
                        </div>

                        {error && (
                            <div className="alert alert-danger d-flex align-items-center rounded-3 mb-4" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                <div>{error}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-warning">Admin Email Address</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-secondary text-light border-0">
                                        <i className="bi bi-envelope-fill"></i>
                                    </span>
                                    <input
                                        type="email"
                                        className="form-control bg-secondary text-light border-0"
                                        placeholder="admin@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold text-warning">Password</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-secondary text-light border-0">
                                        <i className="bi bi-lock-fill"></i>
                                    </span>
                                    <input
                                        type="password"
                                        className="form-control bg-secondary text-light border-0"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-warning w-100 py-2.5 rounded-3 fw-bold shadow-sm mb-3 text-dark"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Authenticating Admin...
                                    </>
                                ) : (
                                    "Secure Sign In"
                                )}
                            </button>
                        </form>

                        <button
                            type="button"
                            className="btn btn-outline-warning w-100 py-2 rounded-3 fw-medium mb-3"
                            onClick={fillAdminCredentials}
                        >
                            <i className="bi bi-lightning-fill me-1"></i>
                            Quick Fill Admin Credentials
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
