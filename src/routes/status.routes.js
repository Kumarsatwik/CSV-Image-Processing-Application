const express = require('express');
const { getRequestStatus } = require('../controllers/status.controller');

const router = express.Router();
// checking requestId for status
router.get('/:requestId', getRequestStatus);

module.exports = router;
