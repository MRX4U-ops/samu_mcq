const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

// --- USER ROUTES ---
router.post('/ticket', supportController.createTicket);
router.get('/my-tickets', supportController.getMyTickets);
router.get('/ticket/:id', supportController.getTicketById);

// --- ADMIN ROUTES ---
router.get('/admin/all', supportController.getAdminTickets);
router.patch('/admin/status/:id', supportController.adminUpdateStatus);

// --- CHAT ROUTES ---
router.get('/messages/:ticketId', supportController.getMessages);
router.post('/messages', supportController.postMessage);

module.exports = router;
