import express from "express";
import cors from "cors";
import restaurants from "./api/restaurants.route.js";

const app = express();

app.use(cors());
app.use(express.json()); //for get and post methods

app.use("/api/v1/restaurants", restaurants); //restaurants api path
app.use("*", (req, res) => res.status(404).json({error: "not found"})); //if the user requests a non-existant path

export default app;