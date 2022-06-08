import RestaurantsDAO from "../dao/restaurantsDAO.js";

export default class RestaurantsController
{
    static async apiGetRestaurants(req, res, next)
    {
        const restaurantsPerPage = req.query.restaurantsPerPage ? parseInt(req.query.restaurantsPerPage, 10) : 20;
        const page = req.query.page ? parseInt(req.query.page, 10) : 0;

        let filters = {};
        if(req.query.name)
            filters.name = req.query.name;
        else if(req.query.cuisine)
            filters.cuisine = req.query.cuisine;
        else if(req.query.zipcode)
            filters.zipcode = req.query.zipcode;
        
        const {restaurantsList, totalNumRestaurants} = await RestaurantsDAO.getRestaurants(
            {
                filters,
                page,
                restaurantsPerPage
            });
        
        //building the response body
        let response = {
            restaurants: restaurantsList,
            page: page,
            filters: filters,
            entries_per_page: restaurantsPerPage,
            total_results: totalNumRestaurants
        };

        res.json(response);
    }

    static async apiGetRestaurantById(req, res, next)
    {
        try {
            let id = req.params.id || {};
            let restaurant = await RestaurantsDAO.getRestaurantById(id);
    
            if(!restaurant){
                res.status(404).json({error: "Not found"});
                return
            }
            res.json(restaurant);
        } catch (e) {
            console.error(`Unable to get restaurant by id: ${e}`);
            res.status(500).json({error: e});
        }
    }

    static async apiGetRestaurantCuisines(req, res, next)
    {
        try {
            let cuisiness = await RestaurantsDAO.getCuisines();
            res.json({cuisines: cuisiness});
        } catch (e) {
            console.error(`Unable to get cuisines: ${e}`);
            res.status(500).json({error: e});
        }
    }
}