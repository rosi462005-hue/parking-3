const express = require('express');
const router = express.Router();

// Listings Database (In-memory)
let listings = [];

router.get('/', (req, res) => {
    // Optionally handle filters like ?radius=2km&location=city
    res.json(listings);
});

router.get('/:id', (req, res) => {
    const listing = listings.find(l => l.id === req.params.id);
    if (listing) {
        res.json(listing);
    } else {
        res.status(404).json({ error: 'Listing not found.' });
    }
});

router.post('/', (req, res) => {
    const { title, location, pricePerHour, ownerId, lat, lng } = req.body;
    const newListing = {
        id: Date.now().toString(),
        title,
        location,
        pricePerHour: parseFloat(pricePerHour),
        available: true,
        ownerId: ownerId || 'anonymous',
        lat: parseFloat(lat) || 18.9750, // Default to Mumbai center
        lng: parseFloat(lng) || 72.8258
    };
    listings.push(newListing);
    res.status(201).json(newListing);
});

module.exports = router;
