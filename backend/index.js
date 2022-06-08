import app from "./server.js";
import mongodb from "mongodb";
import dotenv from "dotenv";
import RestaurantsDAO from "./dao/restaurantsDAO.js";
import ReviewsDAO from "./dao/reviewsDAO.js";

dotenv.config();

const MongoClient = mongodb.MongoClient;

const port = process.env.PORT || 8000;

MongoClient.connect(process.env.RESTREVIEWS_DB_URI,
    {
        maxPoolSize : 50,
        wtimeoutMS: 2500,
        useNewUrlParser: true
    }
    )
    .catch(err => {
        console.log(err.stack);
        process.exit(1);
    })
    .then(async client => {
        try
        {
            await Promise.all([RestaurantsDAO.injectDB(client), ReviewsDAO.injectDB(client)]);
        }
        catch(e)
        {
            console.error(e);
        }
        app.listen(port, () => {
            console.log(`listening on port ${port}`);
        });
    });