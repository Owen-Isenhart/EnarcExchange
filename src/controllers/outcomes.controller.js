const db = require("../config/db");
const { addDays } = require('date-fns');
const futureDate = addDays(new Date(), 30);
const now = new Date();


const getOutcomes = async (req, res) => {
  try{
    const outcomes = await db.query('SELECT * FROM market_outcomes');
    res.status(200).json(outcomes.rows);
  }
  catch(err){
    console.error(err.message);
    res.status(500).send("Server Error")
  }
} 

const getOutcomesByID = async (req, res) => {
    const id = parseInt(req.params.id);
    try{
        const outcome = await db.query('SELECT * FROM market_outcomes WHERE id = $1', [id]) ;
        res.status(200).json(outcome.rows);
    }
    catch(err){
        res.status(500).send("Error Finding Outcome")
    }
} 

// setting the liquidity parameter to 100 for the time being, it should be calculated using formula
const createOutcome = async (req, res) => {
    const {marketID, description} = req.body;
    try{
        const outcome = await db.query('INSERT INTO market_outcomes (market_id, description) VALUES ($1, $2) RETURNING *', [marketID, description]);
        res.status(200).send(`Outcome added with ID: ${outcome.rows[0].id}`);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Error creating outcome');
    }
}

const updateOutcome = async (req, res) => {
    const id = parseInt(req.params.id);
     const {marketID, description} = req.body;
    try{
        await db.query('UPDATE market_outcomes SET market_id = $1, description = $2 WHERE id = $3', [marketID, description, id]);
        res.status(200).send(`Outcome modified with ID: ${id}`);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Error updating outcome');
    }
}

const deleteOutcome = async (req, res) => {
    const id = parseInt(req.params.id);
    try{
        await db.query('DELETE FROM market_outcomes WHERE id = $1', [id]);
        res.status(200).send(`Outcome with ID: ${id} has been deleted`);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Error deleting outcome')
    }
}

module.exports = {
    getOutcomes,
    getOutcomesByID,
    createOutcome,
    updateOutcome,
    deleteOutcome

}