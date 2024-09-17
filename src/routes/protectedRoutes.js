const express = require('express');
const verifyToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/protected', verifyToken, (req, res) => {
  res.send(`Hola ${req.user.name}, tienes acceso!`);
});

module.exports = router;