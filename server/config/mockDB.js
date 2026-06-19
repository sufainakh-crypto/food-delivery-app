const bcrypt = require("bcryptjs");

const mockUsers = [
    {
        name: "Test User",
        email: "user@example.com",
        password: "", // Hashed below
        role: "user"
    },
    {
        name: "Admin User",
        email: "admin@example.com",
        password: "", // Hashed below
        role: "admin"
    },
    {
        name: "Restaurant Owner",
        email: "owner@example.com",
        password: "", // Hashed below
        role: "owner"
    }
];

// Hash the default mock users' passwords on startup
(async () => {
    mockUsers[0].password = await bcrypt.hash("password123", 10);
    mockUsers[1].password = await bcrypt.hash("admin123", 10);
    mockUsers[2].password = await bcrypt.hash("password123", 10);
})();

const mockRestaurants = [
    { 
        _id: "res1", 
        name: "Pizza Palace", 
        cuisine: "Italian / Pizza",
        address: "123 Pizza St",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
        ownerId: "owner@example.com"
    },
    { 
        _id: "res2", 
        name: "Burger Bistro", 
        cuisine: "Burgers & Fries",
        address: "456 Burger Ave",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
        ownerId: null
    },
    { 
        _id: "res3", 
        name: "Sushi Sun", 
        cuisine: "Japanese Sushi",
        address: "789 Sushi Rd",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500",
        ownerId: null
    }
];

const mockMenus = [
    { 
        _id: "menu1", 
        restaurantId: "res1", 
        name: "Margherita Pizza", 
        price: 12.99, 
        image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500",
        description: "Fresh mozzarella, sweet tomatoes, and aromatic basil on our classic thin crust.",
        category: "Pizza",
        availability: true
    },
    { 
        _id: "menu2", 
        restaurantId: "res1", 
        name: "Pepperoni Pizza", 
        price: 14.99, 
        image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500",
        description: "Double pepperoni and double cheese baked to perfection.",
        category: "Pizza",
        availability: true
    },
    { 
        _id: "menu3", 
        restaurantId: "res2", 
        name: "Classic Burger", 
        price: 9.99, 
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
        description: "Juicy beef patty with lettuce, tomato, onions, and house sauce.",
        category: "Burgers",
        availability: true
    },
    { 
        _id: "menu4", 
        restaurantId: "res2", 
        name: "Cheese Fries", 
        price: 4.99, 
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500",
        description: "Crispy golden french fries smothered in melted cheddar cheese.",
        category: "Sides",
        availability: true
    },
    { 
        _id: "menu5", 
        restaurantId: "res3", 
        name: "California Roll", 
        price: 8.99, 
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500",
        description: "Crab salad, cucumber, and fresh avocado rolled in sesame seeds.",
        category: "Sushi",
        availability: true
    },
    { 
        _id: "menu6", 
        restaurantId: "res3", 
        name: "Salmon Nigiri", 
        price: 11.99, 
        image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500",
        description: "Fresh slices of salmon over seasoned vinegared sushi rice.",
        category: "Sushi",
        availability: true
    }
];

const mockOrders = [];

module.exports = {
    mockUsers,
    mockRestaurants,
    mockMenus,
    mockOrders
};
