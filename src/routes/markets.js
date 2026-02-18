const {Router} = require('express');
const {getMarkets,
       getMarketsByID,
       createMarket,
       updateMarket,
       deleteMarket
       
} = require("../controllers/markets.controller")
const router = Router();

router.get('/', getMarkets);
router.get('/:id', getMarketsByID);
router.post('/', createMarket);
router.put('/:id', updateMarket);
router.delete('/:id', deleteMarket);

module.exports = router;
