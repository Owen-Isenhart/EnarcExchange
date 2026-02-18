const {Router} = require('express');
const {getOutcomes,
       getOutcomesByID,
       createOutcome,
       updateOutcome,
       deleteOutcome
       
} = require("../controllers/outcomes.controller")
const router = Router();

router.get('/', getOutcomes);
router.get('/:id', getOutcomesByID);
router.post('/', createOutcome);
router.put('/:id', updateOutcome);
router.delete('/:id', deleteOutcome);

module.exports = router;
