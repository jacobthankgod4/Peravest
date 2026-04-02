const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('phone').trim().notEmpty()
  ],
  authController.register
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  authController.login
);

router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  authController.forgotPassword
);

router.post('/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 })
  ],
  authController.resetPassword
);

router.post('/activate-account',
  [body('token').notEmpty()],
  authController.activateAccount
);

router.get('/validate-reset-token', authController.validateResetToken);

router.get('/me', authenticate, authController.getMe);

module.exports = router;
