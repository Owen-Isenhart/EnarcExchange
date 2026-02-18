const db = require("../config/db");
const { addDays } = require('date-fns');
const futureDate = addDays(new Date(), 30);
const now = new Date();


const getPrices = async (req, res) => {
  try{
    const price_history = await db.query('SELECT * FROM price_history');
    res.status(200).json(price_history.rows);
  }
  catch(err){
    console.error(err.message);
    res.status(500).send("Server Error")
  }
} 

const getPricesByID = async (req, res) => {
    const id = parseInt(req.params.id);
    try{
        const price_history = await db.query('SELECT * FROM price_history WHERE id = $1', [id]) ;
        res.status(200).json(price_history.rows);
    }
    catch(err){
        res.status(500).send("Error Finding Price")
    }
} 


const createPrice = async (req, res) => {
    const {outcomeID, price} = req.body;
    try{
        const price_history = await db.query('INSERT INTO price_history (outcome_id, price) VALUES ($1, $2) RETURNING *', [outcomeID, price]);
        res.status(200).send(`Price added with ID: ${price_history.rows[0].id}`);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Error creating outcome');
    }
}

const updatePrice = async (req, res) => {
    const id = parseInt(req.params.id);
     const {outcomeID, price} = req.body;
    try{
        await db.query('UPDATE price_history SET outcome_id  = $1, price = $2 WHERE id = $3', [outcomeID, price, id]);
        res.status(200).send(`Price modified with ID: ${id}`);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Error updating outcome');
    }
}

const deletePrice = async (req, res) => {
    const id = parseInt(req.params.id);
    try{
        await db.query('DELETE FROM price_history WHERE id = $1', [id]);
        res.status(200).send(`Price with ID: ${id} has been deleted`);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Error deleting price_history')
    }
}

module.exports = {
    getPrices,
    getPricesByID,
    createPrice,
    updatePrice,
    deletePrice

}