const router = require("express").Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../Models/usermodels");
const Restaurant = require("../Models/restaurantmodels");
const Menu = require("../Models/menumodels");
const Order = require("../Models/ordermodels");
const { mockUsers, mockRestaurants, mockMenus, mockOrders } = require("../config/mockDB");
const auth = require("../middleware/auth");

// Helper to check if DB is connected
const isDBConnected = () => mongoose.connection.readyState === 1;

// Admin access check middleware
const adminAuth = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
};

// Apply authentication to all admin routes
router.use(auth, adminAuth);

// GET /api/admin/stats - Get dashboard statistics
router.get("/stats", async (req, res) => {
    try {
        if (isDBConnected()) {
            const totalRestaurants = await Restaurant.countDocuments();
            const totalFoodItems = await Menu.countDocuments();
            const totalUsers = await User.countDocuments({ role: "user" });
            const totalOwners = await User.countDocuments({ role: "owner" });
            const totalOrders = await Order.countDocuments();
            const recentOrders = await Order.find().sort({ _id: -1 }).limit(5);

            res.json({
                stats: {
                    restaurants: totalRestaurants,
                    foodItems: totalFoodItems,
                    users: totalUsers,
                    owners: totalOwners,
                    orders: totalOrders
                },
                recentOrders
            });
        } else {
            const totalRestaurants = mockRestaurants.length;
            const totalFoodItems = mockMenus.length;
            const totalUsers = mockUsers.filter(u => u.role === "user").length;
            const totalOwners = mockUsers.filter(u => u.role === "owner").length;
            const totalOrders = mockOrders.length;
            
            // Sort mock orders descending and take top 5
            const recentOrders = [...mockOrders]
                .sort((a, b) => b._id.localeCompare(a._id))
                .slice(0, 5);

            res.json({
                stats: {
                    restaurants: totalRestaurants,
                    foodItems: totalFoodItems,
                    users: totalUsers,
                    owners: totalOwners,
                    orders: totalOrders
                },
                recentOrders
            });
        }
    } catch (error) {
        console.error("Fetch admin stats error:", error);
        res.status(500).json({ message: "Server error fetching statistics" });
    }
});

// GET /api/admin/owners - Fetch all restaurant owners with their associated restaurants
router.get("/owners", async (req, res) => {
    try {
        const { search } = req.query;

        if (isDBConnected()) {
            let userQuery = { role: "owner" };
            if (search) {
                userQuery.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ];
            }

            const owners = await User.find(userQuery).select("-password").lean();
            
            // For each owner, fetch their restaurant
            const ownersWithRestaurants = await Promise.all(
                owners.map(async (owner) => {
                    const restaurant = await Restaurant.findOne({ ownerId: owner._id }).lean();
                    return {
                        ...owner,
                        restaurant: restaurant || null
                    };
                })
            );

            // Filter by restaurant search if specified and not matched by user name/email
            let result = ownersWithRestaurants;
            if (search) {
                // If search query didn't match owners but matches restaurant name/cuisine, we could filter
                // However, since we queried users with search, it already filtered users.
                // Let's also support searching by restaurant name by widening the search.
                const matchedRestaurants = await Restaurant.find({
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { cuisine: { $regex: search, $options: "i" } }
                    ]
                }).lean();
                
                const ownerIdsFromRes = matchedRestaurants.map(r => r.ownerId ? r.ownerId.toString() : null).filter(Boolean);
                
                if (ownerIdsFromRes.length > 0) {
                    const additionalOwners = await User.find({
                        _id: { $in: ownerIdsFromRes },
                        role: "owner"
                    }).select("-password").lean();
                    
                    const additionalOwnersWithRes = await Promise.all(
                        additionalOwners.map(async (owner) => {
                            const restaurant = matchedRestaurants.find(r => r.ownerId && r.ownerId.toString() === owner._id.toString());
                            return { ...owner, restaurant };
                        })
                    );
                    
                    // Combine lists uniquely
                    const existingIds = new Set(result.map(o => o._id.toString()));
                    additionalOwnersWithRes.forEach(o => {
                        if (!existingIds.has(o._id.toString())) {
                            result.push(o);
                        }
                    });
                }
            }

            res.json(result);
        } else {
            // Mock Database
            let owners = mockUsers.filter(u => u.role === "owner").map(u => ({
                id: u.email,
                name: u.name,
                email: u.email,
                role: u.role
            }));

            const ownersWithRestaurants = owners.map(owner => {
                const restaurant = mockRestaurants.find(r => r.ownerId === owner.email);
                return {
                    ...owner,
                    _id: owner.email, // Use email as _id for mock consistency
                    restaurant: restaurant || null
                };
            });

            let result = ownersWithRestaurants;
            if (search) {
                const lowerSearch = search.toLowerCase();
                result = ownersWithRestaurants.filter(o => 
                    o.name.toLowerCase().includes(lowerSearch) ||
                    o.email.toLowerCase().includes(lowerSearch) ||
                    (o.restaurant && o.restaurant.name.toLowerCase().includes(lowerSearch)) ||
                    (o.restaurant && o.restaurant.cuisine.toLowerCase().includes(lowerSearch))
                );
            }

            res.json(result);
        }
    } catch (error) {
        console.error("Fetch owners error:", error);
        res.status(500).json({ message: "Server error fetching restaurant owners" });
    }
});

// POST /api/admin/owners - Add a new restaurant owner (and optionally create their restaurant)
router.post("/owners", async (req, res) => {
    try {
        const { name, email, password, restaurantName, cuisine, address, image } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Owner name, email, and password are required" });
        }

        const emailLower = email.toLowerCase();
        const hashedPassword = await bcrypt.hash(password, 10);

        if (isDBConnected()) {
            // Check if user exists
            const existingUser = await User.findOne({ email: emailLower });
            if (existingUser) {
                return res.status(400).json({ message: "A user with this email already exists" });
            }

            // Create Owner User
            const newOwner = new User({
                name,
                email: emailLower,
                password: hashedPassword,
                role: "owner"
            });
            await newOwner.save();

            let newRestaurant = null;
            if (restaurantName) {
                newRestaurant = new Restaurant({
                    name: restaurantName,
                    cuisine: cuisine || "General",
                    address: address || "",
                    image: image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
                    ownerId: newOwner._id
                });
                await newRestaurant.save();
            }

            res.status(201).json({
                message: "Restaurant owner registered successfully",
                owner: {
                    _id: newOwner._id,
                    name: newOwner.name,
                    email: newOwner.email,
                    role: newOwner.role,
                    restaurant: newRestaurant
                }
            });
        } else {
            // Mock DB
            const existingUser = mockUsers.find(u => u.email === emailLower);
            if (existingUser) {
                return res.status(400).json({ message: "A user with this email already exists (mock db)" });
            }

            const newOwner = {
                name,
                email: emailLower,
                password: hashedPassword,
                role: "owner"
            };
            mockUsers.push(newOwner);

            let newRestaurant = null;
            if (restaurantName) {
                newRestaurant = {
                    _id: "res_" + Date.now(),
                    name: restaurantName,
                    cuisine: cuisine || "General",
                    address: address || "",
                    image: image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
                    ownerId: emailLower
                };
                mockRestaurants.push(newRestaurant);
            }

            res.status(201).json({
                message: "Restaurant owner registered successfully (mock db)",
                owner: {
                    _id: emailLower,
                    name,
                    email: emailLower,
                    role: "owner",
                    restaurant: newRestaurant
                }
            });
        }
    } catch (error) {
        console.error("Create owner error:", error);
        res.status(500).json({ message: "Server error creating restaurant owner" });
    }
});

// PUT /api/admin/owners/:id - Edit owner details and their associated restaurant details
router.put("/owners/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, restaurantName, cuisine, address, image } = req.body;

        if (isDBConnected()) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid Owner ID format" });
            }

            const owner = await User.findById(id);
            if (!owner || owner.role !== "owner") {
                return res.status(404).json({ message: "Restaurant owner not found" });
            }

            // Update user details
            if (name) owner.name = name;
            if (email) {
                const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
                if (existing) {
                    return res.status(400).json({ message: "Email is already taken by another user" });
                }
                owner.email = email.toLowerCase();
            }
            if (password) {
                owner.password = await bcrypt.hash(password, 10);
            }
            await owner.save();

            // Handle Restaurant updates
            let restaurant = await Restaurant.findOne({ ownerId: id });
            if (restaurant) {
                if (restaurantName) restaurant.name = restaurantName;
                if (cuisine !== undefined) restaurant.cuisine = cuisine;
                if (address !== undefined) restaurant.address = address;
                if (image !== undefined) restaurant.image = image;
                await restaurant.save();
            } else if (restaurantName) {
                // If they didn't have a restaurant, create one
                restaurant = new Restaurant({
                    name: restaurantName,
                    cuisine: cuisine || "General",
                    address: address || "",
                    image: image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
                    ownerId: id
                });
                await restaurant.save();
            }

            res.json({
                message: "Restaurant owner updated successfully",
                owner: {
                    _id: owner._id,
                    name: owner.name,
                    email: owner.email,
                    role: owner.role,
                    restaurant
                }
            });
        } else {
            // Mock DB
            const userIdx = mockUsers.findIndex(u => u.email === id && u.role === "owner");
            if (userIdx === -1) {
                return res.status(404).json({ message: "Restaurant owner not found (mock db)" });
            }

            if (name) mockUsers[userIdx].name = name;
            if (password) {
                mockUsers[userIdx].password = await bcrypt.hash(password, 10);
            }
            // If email is changing, we must be careful since it's the identifier ID
            let finalEmail = id;
            if (email && email.toLowerCase() !== id) {
                const existing = mockUsers.find(u => u.email === email.toLowerCase());
                if (existing) {
                    return res.status(400).json({ message: "Email is already taken (mock db)" });
                }
                mockUsers[userIdx].email = email.toLowerCase();
                finalEmail = email.toLowerCase();
            }

            let restaurant = mockRestaurants.find(r => r.ownerId === id);
            if (restaurant) {
                if (restaurantName) restaurant.name = restaurantName;
                if (cuisine !== undefined) restaurant.cuisine = cuisine;
                if (address !== undefined) restaurant.address = address;
                if (image !== undefined) restaurant.image = image;
                // Update ownerId to finalEmail
                restaurant.ownerId = finalEmail;
            } else if (restaurantName) {
                restaurant = {
                    _id: "res_" + Date.now(),
                    name: restaurantName,
                    cuisine: cuisine || "General",
                    address: address || "",
                    image: image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
                    ownerId: finalEmail
                };
                mockRestaurants.push(restaurant);
            }

            res.json({
                message: "Restaurant owner updated successfully (mock db)",
                owner: {
                    _id: finalEmail,
                    name: mockUsers[userIdx].name,
                    email: finalEmail,
                    role: "owner",
                    restaurant
                }
            });
        }
    } catch (error) {
        console.error("Update owner error:", error);
        res.status(500).json({ message: "Server error updating restaurant owner" });
    }
});

// DELETE /api/admin/owners/:id - Delete owner (and unlink/nullify or delete their restaurant)
router.delete("/owners/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (isDBConnected()) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid Owner ID format" });
            }

            const deletedOwner = await User.findByIdAndDelete(id);
            if (!deletedOwner) {
                return res.status(404).json({ message: "Restaurant owner not found" });
            }

            // Remove association or delete the restaurant. Let's delete the restaurant and its menus
            const restaurant = await Restaurant.findOne({ ownerId: id });
            if (restaurant) {
                await Restaurant.findByIdAndDelete(restaurant._id);
                await Menu.deleteMany({ restaurantId: restaurant._id });
            }

            res.json({ message: "Owner and their associated restaurant/menu deleted successfully" });
        } else {
            // Mock DB
            const userIdx = mockUsers.findIndex(u => u.email === id && u.role === "owner");
            if (userIdx === -1) {
                return res.status(404).json({ message: "Restaurant owner not found (mock db)" });
            }

            mockUsers.splice(userIdx, 1);

            const resIdx = mockRestaurants.findIndex(r => r.ownerId === id);
            if (resIdx !== -1) {
                const resId = mockRestaurants[resIdx]._id;
                // Delete restaurant
                mockRestaurants.splice(resIdx, 1);
                // Delete menus
                for (let i = mockMenus.length - 1; i >= 0; i--) {
                    if (mockMenus[i].restaurantId === resId) {
                        mockMenus.splice(i, 1);
                    }
                }
            }

            res.json({ message: "Owner and their associated restaurant/menu deleted successfully (mock db)" });
        }
    } catch (error) {
        console.error("Delete owner error:", error);
        res.status(500).json({ message: "Server error deleting restaurant owner" });
    }
});

// GET /api/admin/restaurants - Fetch all restaurants for food management dropdown
router.get("/restaurants", async (req, res) => {
    try {
        if (isDBConnected()) {
            const restaurants = await Restaurant.find().sort({ name: 1 });
            res.json(restaurants);
        } else {
            const restaurants = [...mockRestaurants].sort((a, b) => a.name.localeCompare(b.name));
            res.json(restaurants);
        }
    } catch (error) {
        console.error("Fetch restaurants error:", error);
        res.status(500).json({ message: "Server error fetching restaurants list" });
    }
});

// POST /api/admin/menu - Create a new menu item
router.post("/menu", async (req, res) => {
    try {
        const { restaurantId, name, price, image, description, category, availability } = req.body;

        if (!restaurantId || !name || price === undefined) {
            return res.status(400).json({ message: "Restaurant ID, name, and price are required" });
        }

        if (isDBConnected()) {
            if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
                return res.status(400).json({ message: "Invalid Restaurant ID format" });
            }

            const newMenuItem = new Menu({
                restaurantId,
                name,
                price: Number(price),
                image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
                description: description || "",
                category: category || "General",
                availability: availability !== undefined ? availability : true
            });
            await newMenuItem.save();

            res.status(201).json({
                message: "Menu item created successfully on MongoDB",
                menuItem: newMenuItem
            });
        } else {
            // Mock DB
            const newMenuItem = {
                _id: "menu_" + Date.now(),
                restaurantId,
                name,
                price: Number(price),
                image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
                description: description || "",
                category: category || "General",
                availability: availability !== undefined ? availability : true
            };
            mockMenus.push(newMenuItem);

            res.status(201).json({
                message: "Menu item created successfully on Mock Database",
                menuItem: newMenuItem
            });
        }
    } catch (error) {
        console.error("Create menu item error:", error);
        res.status(500).json({ message: "Server error creating menu item" });
    }
});

// PUT /api/admin/menu/:id - Edit an existing menu item
router.put("/menu/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, image, description, category, availability } = req.body;

        if (isDBConnected()) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid Menu Item ID format" });
            }

            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (price !== undefined) updateData.price = Number(price);
            if (image !== undefined) updateData.image = image;
            if (description !== undefined) updateData.description = description;
            if (category !== undefined) updateData.category = category;
            if (availability !== undefined) updateData.availability = availability;

            const updatedMenuItem = await Menu.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true }
            );

            if (!updatedMenuItem) {
                return res.status(404).json({ message: "Menu item not found" });
            }

            res.json({
                message: "Menu item updated successfully on MongoDB",
                menuItem: updatedMenuItem
            });
        } else {
            // Mock DB
            const itemIdx = mockMenus.findIndex(m => m._id === id);
            if (itemIdx === -1) {
                return res.status(404).json({ message: "Menu item not found (mock db)" });
            }

            if (name !== undefined) mockMenus[itemIdx].name = name;
            if (price !== undefined) mockMenus[itemIdx].price = Number(price);
            if (image !== undefined) mockMenus[itemIdx].image = image;
            if (description !== undefined) mockMenus[itemIdx].description = description;
            if (category !== undefined) mockMenus[itemIdx].category = category;
            if (availability !== undefined) mockMenus[itemIdx].availability = availability;

            res.json({
                message: "Menu item updated successfully on Mock Database",
                menuItem: mockMenus[itemIdx]
            });
        }
    } catch (error) {
        console.error("Update menu item error:", error);
        res.status(500).json({ message: "Server error updating menu item" });
    }
});

// DELETE /api/admin/menu/:id - Delete a menu item
router.delete("/menu/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (isDBConnected()) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "Invalid Menu Item ID format" });
            }

            const deletedItem = await Menu.findByIdAndDelete(id);
            if (!deletedItem) {
                return res.status(404).json({ message: "Menu item not found" });
            }

            res.json({ message: "Menu item deleted successfully from MongoDB" });
        } else {
            // Mock DB
            const itemIdx = mockMenus.findIndex(m => m._id === id);
            if (itemIdx === -1) {
                return res.status(404).json({ message: "Menu item not found (mock db)" });
            }

            mockMenus.splice(itemIdx, 1);
            res.json({ message: "Menu item deleted successfully from Mock Database" });
        }
    } catch (error) {
        console.error("Delete menu item error:", error);
        res.status(500).json({ message: "Server error deleting menu item" });
    }
});

module.exports = router;
