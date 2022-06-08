import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

let restaurants //this variable is a reference to the restaurants collection in our database

export default class RestaurantsDAO
{ 
    //this method runs as soon as mongodb connexion is established
    static async injectDB(conn)
    {
        if(restaurants)
            return
        try
        {
            restaurants = await conn.db(process.env.RESTREVIEWS_NS).collection("restaurants")
        }
        catch(e)
        {
            console.error(`Unable to establish a collection handle in RestaurantsDAO: ${e}`)
        }
    }

    static async getRestaurants(
    {
        filters = null,
        page = 0,
        restaurantsPerPage = 20,
    } = {})
    {
        let query
        if(filters)
        {
            if("name" in filters)
                query = {$text: {$search: filters["name"]}}
            else if("cuisine" in filters)
                query = {"cuisine": {$eq: filters["cuisine"]}}
            else if("zipcode" in filters)
                query = {"address.zipcode": {$eq: filters["zipcode"]}}
        }

        let cursor
        try
        {
            cursor = await restaurants.find(query)
        }
        catch(e)
        {
            console.error(`Unable to issue find command: ${e}`)
            //in case of query failure, return an empty list
            return {restaurantsList: [], totalNumRestaurants: 0}
        }

        //the cursor contains all query results, but we're only interested in a few 
        //depending on page and restaurantsPerPage
        const displayCursor = cursor.limit(restaurantsPerPage).skip(restaurantsPerPage*page)

        try
        {
            const restaurantsList = await displayCursor.toArray()
            const totalNumRestaurants = await restaurants.countDocuments(query)

            return {restaurantsList, totalNumRestaurants}
        }
        catch(e)
        {
            console.error(`Unable to convert cursor to array OR unable to get document's count: ${e}`)
            return {restaurantsList: [], totalNumRestaurants: 0}
        }
    }

    static async getRestaurantById(id){
        try {
            const pipeline = [
                {
                    $match: {
                        _id: new ObjectId(id),
                    },
                },
                      {
                          $lookup: {
                              from: "reviews",
                              let: {
                                  id: "$_id",
                              },
                              pipeline: [
                                  {
                                      $match: {
                                          $expr: {
                                              $eq: ["$restaurant_id", "$$id"],
                                          },
                                      },
                                  },
                                  {
                                      $sort: {
                                          date: -1,
                                      },
                                  },
                              ],
                              as: "reviews",
                          },
                      },
                      {
                          $addFields: {
                              reviews: "$reviews",
                          },
                      },
                  ];

            return await restaurants.aggregate(pipeline).next();

        } catch (e) {
            console.error(`Unable to get reviews by restaurant Id: ${e}`);
            throw e;
        }
    }

    static async getCuisines(){
        try {
            return await restaurants.distinct("cuisine");
        } catch (e) {
            console.error(`Unable to get cuisines: ${e}`);
            return [];
        }
    }
}