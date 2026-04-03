const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const auth = require('../middleware/auth');

router.post('/', auth, withdrawalController.createWithdrawal);
router.get('/user', auth, withdrawalController.getUserWithdrawals);
router.get('/', auth, withdrawalController.getAllWithdrawals);
router.put('/:id', auth, withdrawalController.updateWithdrawalStatus);

module.exports = router;
