const db = require("../config/db");



const getUsers = async (req, res) => {
  try{
    const users = await db.query('SELECT * FROM users');
    res.status(200).json(users.rows);
  }
  catch(err){
    console.error(err.message);
    res.status(500).send("Server Error")
  }
} 

const getUsersByID = async (req, res) => {
    const id = parseInt(req.params.id);
    try{
        const user = await db.query('SELECT * FROM users WHERE id = $1', [id]) ;
        res.status(200).json(user.rows);
    }
    catch(err){
        res.status(500).send("Error Finding user")
    }
} 


module.exports = {
    getUsers,
    getUsersByID,
    
}