const db = require("../config/db");
const { addDays } = require('date-fns');
const futureDate = addDays(new Date(), 30);
const now = new Date();


const getBets = async (req, res) => {
  try{
    const bets = await db.query('SELECT * FROM bets');
    res.status(200).json(bets.rows);
  }
  catch(err){
    console.error(err.message);
    res.status(500).send("Server Error")
  }
} 

const getBetsByID = async (req, res) => {
    const id = parseInt(req.params.id);
    try{
        const bet = await db.query('SELECT * FROM bets WHERE id = $1', [id]) ;
        res.status(200).json(bet.rows);
    }
    catch(err){
        res.status(500).send("Error Finding bet")
    }
} 

const createBet = async (req, res) => {
    const {userID, outcomeID, amount} = req.body;
    try{
        const bet = await db.query('INSERT INTO bets (user_id, outcome_id, amount) VALUES ($1, $2, $3) RETURNING *', [userID, outcomeID, amount]);
        res.status(200).send(`bet added with ID: ${bet.rows[0].id}`);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Error creating bet');
    }
}



module.exports = {
    getBets,
    getBetsByID,
    createBet,
}