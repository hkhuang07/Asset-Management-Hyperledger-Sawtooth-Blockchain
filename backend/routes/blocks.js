const express = require('express');
const router = express.Router();
const axios = require('axios');

const REST_API_URL = process.env.REST_API_URL || 'http://localhost:8008';

// Get Blocks
router.get('/', async (req, res) => {
    try {
        let apiUrl = `${REST_API_URL}/blocks`;
        if (req.query.node) apiUrl = `${req.query.node}/blocks`;
        
        const response = await axios.get(apiUrl);
        res.json(response.data.data || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get block info
router.get('/:blockId', async (req, res) => {
    try {
        let apiUrl = `${REST_API_URL}/blocks/${req.params.blockId}`;
        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
