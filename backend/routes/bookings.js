const express = require('express');
const router = express.Router();

// Mock Bookings Database
const bookings = [];

router.get('/', (req, res) => {
    res.json(bookings);
});

router.post('/', (req, res) => {
    const { listingId, renterId, startTime, endTime } = req.body;
    if (!listingId || !renterId || !startTime || !endTime) {
         return res.status(400).json({ error: 'Missing required booking details.' });
    }
    const newBooking = {
        id: Date.now().toString(),
        listingId,
        renterId,
        startTime,
        endTime,
        status: 'confirmed'
    };
    bookings.push(newBooking);
    res.status(201).json(newBooking);
});

module.exports = router;
