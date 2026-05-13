const express = require('express');
const router = express.Router();
const axios = require('axios');
const SawtoothClient = require('../sawtooth-client');

// Use validator REST api
const REST_API_URL = process.env.REST_API_URL || 'http://localhost:8008';
const client = new SawtoothClient(REST_API_URL);

const crypto = require('crypto');
const hash = (x) => crypto.createHash('sha512').update(x).digest('hex').toLowerCase();
const ASSET_NAMESPACE = hash('asset').substring(0, 6);

// Get batch status
router.get('/batch/:id', async (req, res) => {
    try {
        const batchId = req.params.id;
        const statusUrl = `${REST_API_URL}/batch_statuses?id=${batchId}`;
        const response = await axios.get(statusUrl);
        const data = response.data.data[0];
        
        if (!data) {
            console.log(`[BatchStatus] Batch ${batchId.substring(0, 8)}... not found yet (UNKNOWN)`);
            return res.json({ status: 'UNKNOWN' });
        }

        console.log(`[BatchStatus] Batch ${batchId.substring(0, 8)}... status: ${data.status}`);
        res.json({
            status: data.status,
            invalid_transactions: data.invalid_transactions || []
        });
    } catch (error) {
        console.error(`[BatchStatus] Error checking batch ${req.params.id}:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get all assets
router.get('/', async (req, res) => {
    try {
        let apiUrl = `${REST_API_URL}/state?address=${ASSET_NAMESPACE}`;
        if (req.query.node) apiUrl = `${req.query.node}/state?address=${ASSET_NAMESPACE}`;
        
        const response = await axios.get(apiUrl);
        
        // Sawtooth trả về data trong fields .data
        const rawItems = response.data.data || [];
        const assets = rawItems.map(item => {
            try {
                return JSON.parse(Buffer.from(item.data, 'base64').toString('utf8'));
            } catch (e) {
                return null;
            }
        }).filter(item => item !== null);

        res.json(assets);
    } catch (error) {
        // Nếu chưa có data (404 từ validator), trả về mảng rỗng thay vì lỗi 500
        if (error.response && error.response.status === 404) {
            return res.json([]);
        }
        res.status(500).json({ error: error.message });
    }
});

// Create Asset — submit transaction & return PENDING immediately (no blocking poll)
router.post('/', async (req, res) => {
    try {
        const { assetId, name, value, privateKey } = req.body;
        const result = await client.createAsset(assetId, name, value, privateKey);

        // Trích xuất Batch ID từ link URL trả về bởi Sawtooth
        const batchId = result.link.split('id=')[1];
        console.log(`[Assets] Batch submitted: ${batchId.substring(0, 20)}... — returning PENDING immediately`);

        // Trigger socket event ngay lập tức
        req.app.get('io').emit('new_event', { type: 'AssetCreated', data: { assetId, name } });

        // Trả về ngay — không block chờ commit (không dùng waitCommit)
        res.json({
            success: true,
            status: 'PENDING',
            batchId,
            message: 'Transaction submitted to blockchain. Status: PENDING — will commit shortly.'
        });
    } catch (error) {
        console.error('[Assets] Create asset error:', error.message);
        res.status(400).json({ success: false, error: error.message });
    }
});

// Transfer Asset — submit & return PENDING immediately
router.post('/transfer', async (req, res) => {
    try {
        const { assetId, newOwnerKey, privateKey } = req.body;
        const result = await client.transferAsset(assetId, newOwnerKey, privateKey);

        const batchId = result.link.split('id=')[1];
        console.log(`[Assets] Transfer batch submitted: ${batchId.substring(0, 20)}... — returning PENDING immediately`);

        req.app.get('io').emit('new_event', { type: 'AssetTransferred', data: { assetId, newOwnerKey } });
        res.json({
            success: true,
            status: 'PENDING',
            batchId,
            message: 'Transfer submitted to blockchain. Status: PENDING — will commit shortly.'
        });
    } catch (error) {
        console.error('[Assets] Transfer error:', error.message);
        res.status(400).json({ success: false, error: error.message });
    }
});

// Test Parallel vs Sequential
router.post('/test', async (req, res) => {
    try {
        const { count, mode, privateKey } = req.body;
        const result = await client.sendTestBatches(parseInt(count) || 10, mode || 'parallel', privateKey);
        
        // Return immediately, frontend will wait for the batch commit via waitCommit or ZMQ
        res.json({ success: true, result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Generate Keys Helper
router.get('/keys', (req, res) => {
    res.json(client.generateKeys());
});

// Demo: Sign Message
router.post('/sign', (req, res) => {
    try {
        const { message, privateKey } = req.body;
        const signer = client.createSigner(privateKey);
        const signature = signer.sign(Buffer.from(message, 'utf8'));
        res.json({ success: true, signature });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Demo: Verify Signature
router.post('/verify', (req, res) => {
    try {
        const { message, signature, publicKey } = req.body;
        const context = client.context;
        // The sawtooth-sdk verify requires the signature, message bytes, and the public key object
        const pubKeyObj = require('sawtooth-sdk/signing/secp256k1').Secp256k1PublicKey.fromHex(publicKey);
        const isValid = context.verify(signature, Buffer.from(message, 'utf8'), pubKeyObj);
        res.json({ success: true, isValid });
    } catch (error) {
        res.json({ success: true, isValid: false, error: error.message });
    }
});

module.exports = router;
