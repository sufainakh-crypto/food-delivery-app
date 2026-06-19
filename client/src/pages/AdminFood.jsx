import React, { useState, useEffect } from "react";
import api from "../Services/api";

function AdminFood() {
    const [restaurants, setRestaurants] = useState([]);
    const [selectedResId, setSelectedResId] = useState("");
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        image: "",
        description: "",
        category: "",
        availability: true
    });

    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

    // Fetch restaurants list for dropdown on mount
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await api.get("/admin/restaurants");
                setRestaurants(response.data);
                if (response.data.length > 0) {
                    setSelectedResId(response.data[0]._id);
                }
            } catch (err) {
                setError("Failed to fetch restaurants. Please try again.");
                console.error("Fetch restaurants error:", err);
            }
        };

        fetchRestaurants();
    }, []);

    // Fetch menu items when selected restaurant changes
    useEffect(() => {
        if (!selectedResId) return;

        const fetchMenu = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/restaurants/${selectedResId}/menu`);
                setMenuItems(response.data);
            } catch (err) {
                setError("Failed to load menu items.");
                console.error("Fetch menu error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [selectedResId]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const openAddModal = () => {
        setFormData({
            name: "",
            price: "",
            image: "",
            description: "",
            category: "General",
            availability: true
        });
        setFormError("");
        setIsAddModalOpen(true);
    };

    const openEditModal = (item) => {
        setSelectedItem(item);
        setFormData({
            name: item.name,
            price: item.price,
            image: item.image,
            description: item.description || "",
            category: item.category || "General",
            availability: item.availability !== undefined ? item.availability : true
        });
        setFormError("");
        setIsEditModalOpen(true);
    };

    const handleAddFood = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");

        try {
            const dataToSend = {
                ...formData,
                restaurantId: selectedResId
            };
            const response = await api.post("/admin/menu", dataToSend);
            setSuccessMsg(response.data.message || "Menu item created successfully.");
            setIsAddModalOpen(false);
            
            // Refresh menu list
            const updatedResponse = await api.get(`/restaurants/${selectedResId}/menu`);
            setMenuItems(updatedResponse.data);
            
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to create menu item.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditFood = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");

        try {
            const response = await api.put(`/admin/menu/${selectedItem._id}`, formData);
            setSuccessMsg(response.data.message || "Menu item updated successfully.");
            setIsEditModalOpen(false);

            // Refresh menu list
            const updatedResponse = await api.get(`/restaurants/${selectedResId}/menu`);
            setMenuItems(updatedResponse.data);
            
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) {
            setFormError(err.response?.data?.message || "Failed to update menu item.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteFood = async (itemId) => {
        if (!window.confirm("Are you sure you want to delete this food item?")) {
            return;
        }

        try {
            const response = await api.delete(`/admin/menu/${itemId}`);
            setSuccessMsg(response.data.message || "Menu item deleted successfully.");
            
            // Refresh menu list
            const updatedResponse = await api.get(`/restaurants/${selectedResId}/menu`);
            setMenuItems(updatedResponse.data);
            
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete menu item.");
            setTimeout(() => setError(""), 4000);
        }
    };

    return (
        <div className="container-fluid py-2">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="fw-bold text-dark">Menu & Food Management</h1>
                    <p className="text-muted mb-0">Add, edit, or remove menu items for each restaurant</p>
                </div>
                {selectedResId && (
                    <button className="btn btn-warning fw-bold rounded-3 text-dark shadow-sm" onClick={openAddModal}>
                        <i className="bi bi-plus-circle-fill me-1"></i> Add Food Item
                    </button>
                )}
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

            {/* Restaurant Selector */}
            <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                    <div className="row align-items-center">
                        <div className="col-md-3">
                            <h5 className="fw-bold text-dark mb-md-0">
                                <i className="bi bi-shop text-primary me-2"></i>
                                Select Restaurant:
                            </h5>
                        </div>
                        <div className="col-md-9">
                            <select
                                className="form-select bg-light border-0 py-2.5 rounded-3 fw-semibold text-secondary"
                                value={selectedResId}
                                onChange={(e) => setSelectedResId(e.target.value)}
                            >
                                <option value="" disabled>-- Choose a restaurant --</option>
                                {restaurants.map(res => (
                                    <option key={res._id} value={res._id}>
                                        {res.name} ({res.cuisine})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Items Grid */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : !selectedResId ? (
                <div className="text-center py-5 bg-white shadow-sm rounded-4">
                    <i className="bi bi-shop-window text-muted" style={{ fontSize: "3rem" }}></i>
                    <p className="text-muted mt-2 mb-0">Please select a restaurant to view and manage its menu.</p>
                </div>
            ) : menuItems.length === 0 ? (
                <div className="text-center py-5 card border-0 shadow-sm rounded-4 bg-white">
                    <i className="bi bi-card-list text-muted" style={{ fontSize: "3rem" }}></i>
                    <h4 className="mt-3 text-secondary">No food items listed</h4>
                    <p className="text-muted mb-3">Add the first food item to this restaurant's menu.</p>
                    <button className="btn btn-warning fw-bold btn-sm mx-auto rounded-3 text-dark px-3" onClick={openAddModal}>
                        <i className="bi bi-plus-circle me-1"></i> Add Food Item
                    </button>
                </div>
            ) : (
                <div className="row g-4">
                    {menuItems.map(item => (
                        <div key={item._id} className="col-md-6 col-lg-4">
                            <div className="card border-0 shadow-sm rounded-4 h-100 bg-white hover-card overflow-hidden">
                                <img
                                    src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"}
                                    alt={item.name}
                                    style={{ height: "200px", objectFit: "cover", width: "100%" }}
                                />
                                <div className="card-body p-4 d-flex flex-column justify-content-between">
                                    <div>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h5 className="fw-bold mb-0 text-dark">{item.name}</h5>
                                            <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1">
                                                {item.category || "General"}
                                            </span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h4 className="fw-bold text-success mb-0">${Number(item.price).toFixed(2)}</h4>
                                            <span className={`badge ${item.availability !== false ? "bg-success" : "bg-danger"}`}>
                                                {item.availability !== false ? "In Stock" : "Out of Stock"}
                                            </span>
                                        </div>
                                        <p className="text-muted small mb-0 text-truncate-2">
                                            {item.description || "No description provided."}
                                        </p>
                                    </div>

                                    <div className="d-flex gap-2 mt-4">
                                        <button className="btn btn-outline-primary btn-sm flex-fill rounded-3 fw-medium" onClick={() => openEditModal(item)}>
                                            <i className="bi bi-pencil-square me-1"></i> Edit
                                        </button>
                                        <button className="btn btn-outline-danger btn-sm flex-fill rounded-3 fw-medium" onClick={() => handleDeleteFood(item._id)}>
                                            <i className="bi bi-trash3 me-1"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD FOOD ITEM MODAL */}
            {isAddModalOpen && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow-lg">
                            <div className="modal-header border-0 bg-light p-4">
                                <h5 className="modal-title fw-bold text-dark">
                                    <i className="bi bi-plus-circle-fill text-warning me-2"></i>
                                    Add Food Item
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setIsAddModalOpen(false)}></button>
                            </div>
                            <form onSubmit={handleAddFood}>
                                <div className="modal-body p-4">
                                    {formError && (
                                        <div className="alert alert-danger rounded-3" role="alert">
                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                            {formError}
                                        </div>
                                    )}

                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Food Name *</label>
                                            <input type="text" name="name" className="form-control" placeholder="e.g. Garlic Bread" value={formData.name} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Price ($) *</label>
                                            <input type="number" step="0.01" name="price" className="form-control" placeholder="e.g. 5.99" value={formData.price} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Category</label>
                                            <input type="text" name="category" className="form-control" placeholder="e.g. Appetizers" value={formData.category} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Image URL</label>
                                            <input type="text" name="image" className="form-control" placeholder="e.g. https://images.unsplash.com/... " value={formData.image} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Description</label>
                                            <textarea name="description" className="form-control" rows="3" placeholder="Describe the taste, ingredients, or allergens..." value={formData.description} onChange={handleInputChange}></textarea>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-check form-switch mt-2">
                                                <input className="form-check-input" type="checkbox" name="availability" id="availabilitySwitchAdd" checked={formData.availability} onChange={handleInputChange} />
                                                <label className="form-check-label fw-semibold" htmlFor="availabilitySwitchAdd">
                                                    Available (In Stock)
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 bg-light p-3">
                                    <button type="button" className="btn btn-outline-secondary rounded-3" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-warning rounded-3 px-4 text-dark fw-bold" disabled={formLoading}>
                                        {formLoading ? "Adding..." : "Add Item"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT FOOD ITEM MODAL */}
            {isEditModalOpen && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow-lg">
                            <div className="modal-header border-0 bg-light p-4">
                                <h5 className="modal-title fw-bold text-dark">
                                    <i className="bi bi-pencil-square text-primary me-2"></i>
                                    Edit Food Item
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setIsEditModalOpen(false)}></button>
                            </div>
                            <form onSubmit={handleEditFood}>
                                <div className="modal-body p-4">
                                    {formError && (
                                        <div className="alert alert-danger rounded-3" role="alert">
                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                            {formError}
                                        </div>
                                    )}

                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Food Name *</label>
                                            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Price ($) *</label>
                                            <input type="number" step="0.01" name="price" className="form-control" value={formData.price} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Category</label>
                                            <input type="text" name="category" className="form-control" value={formData.category} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Image URL</label>
                                            <input type="text" name="image" className="form-control" value={formData.image} onChange={handleInputChange} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold">Description</label>
                                            <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleInputChange}></textarea>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-check form-switch mt-2">
                                                <input className="form-check-input" type="checkbox" name="availability" id="availabilitySwitchEdit" checked={formData.availability} onChange={handleInputChange} />
                                                <label className="form-check-label fw-semibold" htmlFor="availabilitySwitchEdit">
                                                    Available (In Stock)
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 bg-light p-3">
                                    <button type="button" className="btn btn-outline-secondary rounded-3" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary rounded-3 px-4 fw-medium" disabled={formLoading}>
                                        {formLoading ? "Saving..." : "Save Changes"}
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

export default AdminFood;
