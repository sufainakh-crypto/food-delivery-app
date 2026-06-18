import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";

function App() {
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState(() => {
        try {
            const storedCart = localStorage.getItem("cart");
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (e) {
            console.error("Failed parsing cart from localStorage:", e);
            return [];
        }
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const loginUser = (userData, token) => {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);
        setUser(userData);
    };

    const logoutUser = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setCart([]); // Clear cart on logout
    };

    const addToCart = (item) => {
        setCart((prevCart) => {
            const existing = prevCart.find((i) => i._id === item._id);
            if (existing) {
                return prevCart.map((i) =>
                    i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart((prevCart) => prevCart.filter((i) => i._id !== itemId));
    };

    const updateCartQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((i) => (i._id === itemId ? { ...i, quantity } : i))
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <Router>
            <Navbar user={user} onLogout={logoutUser} cartCount={cartCount} />
            <div className="container my-4">
                <Routes>
                    <Route 
                        path="/" 
                        element={<Home addToCart={addToCart} cart={cart} />} 
                    />
                    <Route
                        path="/login"
                        element={user ? <Navigate to="/" /> : <Login onLogin={loginUser} />}
                    />
                    <Route
                        path="/register"
                        element={user ? <Navigate to="/" /> : <Register />}
                    />
                    <Route 
                        path="/cart" 
                        element={
                            <Cart 
                                cart={cart} 
                                updateCartQuantity={updateCartQuantity} 
                                removeFromCart={removeFromCart} 
                                clearCart={clearCart} 
                                user={user} 
                            />
                        } 
                    />
                    <Route 
                        path="/checkout" 
                        element={
                            user ? (
                                <Checkout 
                                    cart={cart}
                                    clearCart={clearCart}
                                    user={user}
                                />
                            ) : (
                                <Navigate to="/login" />
                            )
                        } 
                    />
                    <Route 
                        path="/orders" 
                        element={user ? <Orders user={user} /> : <Navigate to="/login" />} 
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
