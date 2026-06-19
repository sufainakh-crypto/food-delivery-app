import React, { useState, useEffect } from "react";
import api from "../Services/api";

function AdminOwners() {
    const [owners, setOwners] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        restaurantName: "",
        cuisine: "",
        address: "",
        image: ""
    });

    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    const fetchOwners = async (searchQuery = "") => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/owners?search=${searchQuery}`);
            setOwners(response.data);
        } catch (err) {
            setError("Failed to fetch owners list.");
            console.error("Fetch owners error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOwners();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchOwners(search);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            restaurantName: "",
            cuisine: "",
            address: "",
            image: ""
        });
        setFormError("");
        setIsAddModalOpen(true);
    };

    const openEditModal = (owner) => {
        setSelectedOwner(owner);
        setFormData({
            name: owner.name,
            email: owner.email,
            password: "", // Leave blank if not editing password
            restaurantName: owner.restaurant?.name || "",
            cuisine: owner.restaurant?.cuisine || "",
            address: owner.restaurant?.address || "",
            image: owner.restaurant?.image || ""
        });
        setFormError("");
        setIsEditModalOpen(true);
    };

    const handleAddOwner = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");

        try {
            const response = await api.post("/admin/owners", formData);
            setSuccessMsg(response.data.message || "Owner added successfully.");
            setIsAddModalOpen(false);
            fetchOwners(search);
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to create owner.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditOwner = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");

        try {
            const response = await api.put(`/admin/owners/${selectedOwner._id}`, formData);
            setSuccessMsg(response.data.message || "Owner updated successfully.");
            setIsEditModalOpen(false);
            fetchOwners(search);
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to update owner.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteOwner = async (ownerId) => {
        if (!window.confirm("Are you sure you want to delete this owner? This will permanently delete their account and associated restaurant!")) {
            return;
        }

        try {
            const response = await api.delete(`/admin/owners/${ownerId}`);
            setSuccessMsg(response.data.message || "Owner deleted successfully.");
            fetchOwners(search);
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete owner.");
            setTimeout(() => setError(""), 4000);
        }
    };

    return (
        <div className="container-fluid py-2">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="fw-bold text-dark">Restaurant Owner Management</h1>
                    <p className="text-muted mb-0">Register, edit, or delete system owners and their restaurants</p>
                </div>
                <button className="btn btn-primary fw-medium rounded-3" onClick={openAddModal}>
                    <i className="bi bi-person-plus-fill me-1"></i> Register New Owner
                </button>
            </div>

            {/* Notifications */}
            {successMsg && (
                <div className="alert alert-success alert-dismissible fade show rounded-3 mb-4" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {successMsg}
                    <button type="button" className="btn-close" onClick={() => setSuccessMsg("")}></button>
                </div>
            )}

            {error && (
                <div className="alert alert-danger alert-dismissible fade show rounded-3 mb-4" role="alert">
                    <i className="bi bi-exclamation-octagon-fill me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError("")}></button>
                </div>
            )}

            {/* Search and Filters */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-3">
                    <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
                        <div className="col-md-9 col-lg-10">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-light border-start-0 ps-0"
                                    placeholder="Search by owner name, email, or restaurant name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3 col-lg-2">
                            <button type="submit" className="btn btn-primary w-100 fw-semibold">
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Owners Grid/Table */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : owners.length === 0 ? (
                <div className="text-center py-5 card border-0 shadow-sm rounded-4 bg-white">
                    <i className="bi bi-person-slash text-muted" style={{ fontSize: "3rem" }}></i>
                    <h4 className="mt-3 text-secondary">No owners found</h4>
                    <p className="text-muted">Register a new restaurant owner to get started.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {owners.map(owner => (
                        <div key={owner._id} className="col-md-6 col-lg-4">
                            <div className="card border-0 shadow-sm rounded-4 h-100 bg-white hover-card">
                                <div className="card-body p-4 d-flex flex-column justify-content-between">
                                    <div>
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-circle bg-primary bg-opacity-10 p-2.5 text-primary me-2">
                                                    <i className="bi bi-person-badge-fill fs-4"></i>
                                                </div>
                                                <div>
                                                    <h5 className="fw-bold mb-0 text-dark">{owner.name}</h5>
                                                    <small className="text-muted">{owner.email}</small>
                                                </div>
                                            </div>
                                            <span className="badge bg-success-subtle text-success border border-success border-opacity-10 px-2.5 py-1">Owner</span>
                                        </div>

                                        <hr className="text-muted my-3" />

                                        {owner.restaurant ? (
                                            <div>
                                                <h6 className="fw-bold text-secondary text-uppercase mb-2" style={{ fontSize: "0.7rem" }}>Associated Restaurant</h6>
                                                <div className="d-flex align-items-center">
                                                    <img
                                                        src={owner.restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100"}
                                                        alt={owner.restaurant.name}
                                                        className="rounded-3 me-2"
                                                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                                    />
                                                    <div>
                                                        <h6 className="fw-bold mb-0 text-dark">{owner.restaurant.name}</h6>
                                                        <small className="text-muted">{owner.restaurant.cuisine}</small>
                                                    </div>
                                                </div>
                                                <p className="text-muted small mt-2 mb-0">
                                                    <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                                                    {owner.restaurant.address || "No address provided"}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="alert alert-warning py-2 small mb-0 rounded-3">
                                                <i className="bi bi-exclamation-triangle me-1"></i> No restaurant assigned.
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-flex gap-2 mt-4">
                                        <button className="btn btn-outline-primary btn-sm flex-fill rounded-3 fw-medium" onClick={() => openEditModal(owner)}>
                                            <i className="bi bi-pencil-square me-1"></i> Edit
                                        </button>
                                        <button className="btn btn-outline-danger btn-sm flex-fill rounded-3 fw-medium" onClick={() => handleDeleteOwner(owner._id)}>
                                            <i className="bi bi-trash3 me-1"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD OWNER MODAL */}
            {isAddModalOpen && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 rounded-4 shadow-lg">
                            <div className="modal-header border-0 bg-light p-4">
                                <h5 className="modal-title fw-bold text-dark">
                                    <i className="bi bi-person-plus-fill text-primary me-2"></i>
                                    Register New Owner
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setIsAddModalOpen(false)}></button>
                            </div>
                            <form onSubmit={handleAddOwner}>
                                <div className="modal-body p-4">
                                    {formError && (
                                        <div className="alert alert-danger rounded-3" role="alert">
                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                            {formError}
                                        </div>
                                    )}

                                    <h6 className="fw-bold text-primary mb-3">Owner Account Details</h6>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Owner Name *</label>
                                            <input type="text" name="name" className="form-control" placeholder="e.g. John Doe" value={formData.name} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Email Address *</label>
                                            <input type="email" name="email" className="form-control" placeholder="e.g. john@example.com" value={formData.email} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Password *</label>
                                            <input type="password" name="password" className="form-control" placeholder="Enter secure password" value={formData.password} onChange={handleInputChange} required />
                                        </div>
                                    </div>

                                    <h6 className="fw-bold text-primary mb-3">Associated Restaurant Details (Optional)</h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Restaurant Name</label>
                                            <input type="text" name="restaurantName" className="form-control" placeholder="e.g. Tacos Loco" value={formData.restaurantName} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Cuisine Type</label>
                                            <input type="text" name="cuisine" className="form-control" placeholder="e.g. Mexican / Street Food" value={formData.cuisine} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Address</label>
                                            <input type="text" name="address" className="form-control" placeholder="e.g. 789 Spicy Rd" value={formData.address} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Image URL</label>
                                            <input type="text" name="image" className="form-control" placeholder="e.g. https://example.com/image.jpg" value={formData.image} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 bg-light p-3">
                                    <button type="button" className="btn btn-outline-secondary rounded-3" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary rounded-3 px-4" disabled={formLoading}>
                                        {formLoading ? "Saving..." : "Create Owner & Restaurant"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT OWNER MODAL */}
            {isEditModalOpen && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 rounded-4 shadow-lg">
                            <div className="modal-header border-0 bg-light p-4">
                                <h5 className="modal-title fw-bold text-dark">
                                    <i className="bi bi-pencil-square text-primary me-2"></i>
                                    Edit Owner & Restaurant details
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setIsEditModalOpen(false)}></button>
                            </div>
                            <form onSubmit={handleEditOwner}>
                                <div className="modal-body p-4">
                                    {formError && (
                                        <div className="alert alert-danger rounded-3" role="alert">
                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                            {formError}
                                        </div>
                                    )}

                                    <h6 className="fw-bold text-primary mb-3">Owner Account Details</h6>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Owner Name *</label>
                                            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Email Address *</label>
                                            <input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Password (Leave blank to keep current password)</label>
                                            <input type="password" name="password" className="form-control" placeholder="Enter new password" value={formData.password} onChange={handleInputChange} />
                                        </div>
                                    </div>

                                    <h6 className="fw-bold text-primary mb-3">Restaurant Details</h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Restaurant Name</label>
                                            <input type="text" name="restaurantName" className="form-control" value={formData.restaurantName} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Cuisine Type</label>
                                            <input type="text" name="cuisine" className="form-control" value={formData.cuisine} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Address</label>
                                            <input type="text" name="address" className="form-control" value={formData.address} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Image URL</label>
                                            <input type="text" name="image" className="form-control" value={formData.image} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 bg-light p-3">
                                    <button type="button" className="btn btn-outline-secondary rounded-3" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary rounded-3 px-4" disabled={formLoading}>
                                        {formLoading ? "Saving..." : "Update Owner & Restaurant"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminOwners;
