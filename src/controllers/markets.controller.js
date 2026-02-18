const db = require("../config/db");
const { addDays } = require('date-fns');
const futureDate = addDays(new Date(), 30);
const now = new Date();


const getMarkets = async (req, res) => {
  try{
    const markets = await db.query('SELECT * FROM markets');
    res.status(200).json(markets.rows);
  }
  catch(err){
    console.error(err.message);
    res.status(500).send("Server Error")
  }
} 

const getMarketsByID = async (req, res) => {
    const id = parseInt(req.params.id);
    try{
        const market = await db.query('SELECT * FROM markets WHERE id = $1', [id]) ;
        res.status(200).json(market.rows);
    }
    catch(err){
        res.status(500).send("Error Finding Market")
    }
} 

// setting the liquidity parameter to 100 for the time being, it should be calculated using formula
const createMarket = async (req, res) => {
    const {name, description} = req.body;
    try{
        const market = await db.query('INSERT INTO markets (name, description, start_time, end_time, status, liquidity_parameter) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [name, description, now, futureDate, "open", 100]);
        res.status(200).send(`Market added with ID: ${market.rows[0].id}`);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Error creating market');
    }
}

const updateMarket = async (req, res) => {
    const id = parseInt(req.params.id);
    const {name, description} = req.body;
    try{
        await db.query('UPDATE markets SET name = $1, description = $2 WHERE id = $3', [name, description, id]);
        res.status(200).send(`Market modified with ID: ${id}`);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Error updating market');
    }
}

const deleteMarket = async (req, res) => {
    const id = parseInt(req.params.id);
    try{
        await db.query('DELETE FROM markets WHERE id = $1', [id]);
        res.status(200).send(`Market with ID: ${id} has been deleted`);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Error deleting market')
    }
}

module.exports = {
    getMarkets,
    getMarketsByID,
    createMarket,
    updateMarket,
    deleteMarket

}