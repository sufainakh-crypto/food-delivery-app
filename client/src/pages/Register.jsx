import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../Services/api";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        setLoading(true);

        try {
            await api.post("/users/register", { name, email, password });
            setSuccess("Registration successful! Redirecting to login...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <div className="col-md-5">
                <div className="card shadow-lg border-0 rounded-4">
                    <div className="card-body p-5">
                        <div className="text-center mb-4">
                            <i className="bi bi-person-plus-fill text-success" style={{ fontSize: "3rem" }}></i>
                            <h2 className="fw-bold mt-2 text-dark">Create Account</h2>
                            <p className="text-muted">Join us to order delicious food today</p>
                        </div>

                        {error && (
                            <div className="alert alert-danger d-flex align-items-center rounded-3 mb-4" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                <div>{error}</div>
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success d-flex align-items-center rounded-3 mb-4" role="alert">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                <div>{success}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Full Name</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="bi bi-person text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-start-0 ps-0"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

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

                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Password</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="bi bi-lock text-muted"></i>
                                    </span>
                                    <input
                                        type="password"
                                        className="form-control bg-light border-start-0 ps-0"
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold text-secondary">Confirm Password</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="bi bi-shield-lock text-muted"></i>
                                    </span>
                                    <input
                                        type="password"
                                        className="form-control bg-light border-start-0 ps-0"
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-success w-100 py-2.5 rounded-3 fw-semibold shadow-sm mb-3"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Registering...
                                    </>
                                ) : (
                                    "Sign Up"
                                )}
                            </button>
                        </form>

                        <hr className="text-muted" />

                        <div className="text-center mt-3">
                            <span className="text-muted">Already have an account? </span>
                            <Link to="/login" className="text-success fw-bold text-decoration-none">
                                Login Here
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
