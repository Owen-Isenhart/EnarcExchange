const {Router} = require('express');
const {getPrices,
       getPricesByID,
       createPrice,
       updatePrice,
       deletePrice
       
} = require("../controllers/price.controller")
const router = Router();

router.get('/', getPrices);
router.get('/:id', getPricesByID);
router.post('/', createPrice);
router.put('/:id', updatePrice);
router.delete('/:id', deletePrice);

module.exports = router;
