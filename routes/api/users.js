const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => res.json('Get Working'));

module.exports = router;
