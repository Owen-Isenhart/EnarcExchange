const db = require("../config/db");
const { addDays } = require('date-fns');
const futureDate = addDays(new Date(), 30);
const now = new Date();


const getTransactions = async (req, res) => {
  try{
    const transactions = await db.query('SELECT * FROM transactions');
    res.status(200).json(transactions.rows);
  }
  catch(err){
    console.error(err.message);
    res.status(500).send("Server Error")
  }
} 

const getTransactionsByID = async (req, res) => {
    const id = parseInt(req.params.id);
    try{
        const transaction = await db.query('SELECT * FROM transactions WHERE user_id = $1', [id]) ;
        res.status(200).json(transaction.rows);
    }
    catch(err){
        res.status(500).send("Error Finding transaction")
    }
} 

const createTransaction = async (req, res) => {
    const {userID, reason, amount} = req.body;
    try{
        const transaction = await db.query('INSERT INTO transactions (user_id, reason, amount) VALUES ($1, $2, $3) RETURNING *', [userID, reason, amount]);
        res.status(200).send(`transaction added with ID: ${transaction.rows[0].id}`);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Error creating transaction');
    }
}



module.exports = {
    getTransactions,
    getTransactionsByID,
    createTransaction,
}