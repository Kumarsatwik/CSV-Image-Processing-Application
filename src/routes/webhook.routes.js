const express = require('express');
const { handleWebhook } = require('../controllers/webhook.controller');

const router = express.Router();

// Receive webhook callbacks
// for demo purpose we are recieving webhook calls in the same server

router.post('/', handleWebhook);

module.exports = router;
