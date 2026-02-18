const {Router} = require('express');
const {getTransactions,
       getTransactionsByID,
       createTransaction,
       
} = require("../controllers/transactions.controller")
const router = Router();

router.get('/', getTransactions);
router.get('/:id', getTransactionsByID);
router.post('/', createTransaction);

module.exports = router;
