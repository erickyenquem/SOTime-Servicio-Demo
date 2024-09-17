const express = require('express');
const { verifyUserEmail } = require('../controllers/userController');
const router = express.Router();

router.post('/user', verifyUserEmail);

module.exports = router;