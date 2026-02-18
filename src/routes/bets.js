const {Router} = require('express');
const {getBets,
       getBetsByID,
       createBet,
       
} = require("../controllers/bets.controller")
const router = Router();

router.get('/', getBets);
router.get('/:id', getBetsByID);
router.post('/', createBet);

module.exports = router;
