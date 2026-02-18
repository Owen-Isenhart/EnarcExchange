const {Router} = require('express');
const {getUsers,
       getUsersByID,
      
       
} = require("../controllers/users.controller")
const router = Router();

router.get('/', getUsers);
router.get('/:id', getUsersByID);

module.exports = router;
