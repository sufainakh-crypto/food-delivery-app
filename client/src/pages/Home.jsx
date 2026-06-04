import { useEffect, useState } from "react";
import api from "../Services/api";

function Home() {
    const [restaurants, setRestaurants] =
        useState([]);

    useEffect(() => {
        api.get("/restaurants")
            .then(res => setRestaurants(res.data));
    }, []);

    return (
        <div>
            <h1>Restaurants</h1>

            {restaurants.map(r => (
                <div key={r._id}>
                    <h3>{r.name}</h3>
                    <p>{r.cuisine}</p>
                </div>
            ))}
        </div>
    );
}

export default Home;