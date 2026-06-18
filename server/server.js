const express = require("express");
const connectDB = require("./config/DB");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Initialize database connection (with mock data fallback if offline)
connectDB();

app.use("/api/users", require("./routes/userroutes"));
app.use("/api/restaurants", require("./routes/restaurantroutes"));
app.use("/api/orders", require("./routes/orderroutes"));
app.use("/api/payment", require("./routes/paymentroutes"));

app.get("/", (req, res) => {
    res.send("Food Delivery API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
    console.log(`Server running on ${PORT}`)
);