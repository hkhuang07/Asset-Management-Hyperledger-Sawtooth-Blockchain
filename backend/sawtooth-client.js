const crypto = require('crypto');
const { createContext, CryptoFactory } = require('sawtooth-sdk/signing');
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1');
const { Transaction, TransactionHeader, TransactionList, Batch, BatchHeader, BatchList } = require('sawtooth-sdk/protobuf');
const axios = require('axios');

const ASSET_FAMILY = 'asset';
const ASSET_VERSION = '1.0';

const hash = (x) => crypto.createHash('sha512').update(x).digest('hex').toLowerCase();
const ASSET_NAMESPACE = hash(ASSET_FAMILY).substring(0, 6);
const makeAddress = (assetId) => ASSET_NAMESPACE + hash(assetId).substring(0, 64);

class SawtoothClient {
    constructor(restApiUrl) {
        this.restApiUrl = restApiUrl || 'http://localhost:8008';
        this.context = createContext('secp256k1');
    }

    createSigner(privateKeyHex) {
        const privateKey = new Secp256k1PrivateKey(Buffer.from(privateKeyHex, 'hex'));
        return new CryptoFactory(this.context).newSigner(privateKey);
    }

    async sendTransaction(payloadString, privateKeyHex, inputs, outputs) {
        const signer = this.createSigner(privateKeyHex);
        const payloadBytes = Buffer.from(payloadString, 'utf8');

        // Inputs and outputs must be full 70 character addresses in Sawtooth transactions
        const sortedInputs = [...new Set(inputs)].sort();
        const sortedOutputs = [...new Set(outputs)].sort();

        console.log(`[Sawtooth] Sending Batch to Family: ${ASSET_FAMILY}, Namespace: ${ASSET_NAMESPACE}`);

        const transactionHeaderBytes = TransactionHeader.encode({
            familyName: ASSET_FAMILY,
            familyVersion: ASSET_VERSION,
            inputs: sortedInputs,
            outputs: sortedOutputs,
            signerPublicKey: signer.getPublicKey().asHex(),
            batcherPublicKey: signer.getPublicKey().asHex(),
            dependencies: [],
            payloadSha512: hash(payloadBytes),
            nonce: Math.random().toString(36).substring(2)
        }).finish();

        const signature = signer.sign(transactionHeaderBytes);

        const transaction = Transaction.create({
            header: transactionHeaderBytes,
            headerSignature: signature,
            payload: payloadBytes
        });

        const batchHeaderBytes = BatchHeader.encode({
            signerPublicKey: signer.getPublicKey().asHex(),
            transactionIds: [transaction.headerSignature]
        }).finish();

        const batchSignature = signer.sign(batchHeaderBytes);

        const batch = Batch.create({
            header: batchHeaderBytes,
            headerSignature: batchSignature,
            transactions: [transaction]
        });

        const batchListBytes = BatchList.encode({
            batches: [batch]
        }).finish();

        try {
            const response = await axios.post(`${this.restApiUrl}/batches`, batchListBytes, {
                headers: { 'Content-Type': 'application/octet-stream' },
                timeout: 10000 // 10s timeout
            });
            console.log(`[Sawtooth] Batch submitted: ${response.data.link}`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(JSON.stringify(error.response.data.error));
            }
            throw error;
        }
    }

    async createAsset(assetId, name, value, privateKeyHex) {
        // payload format: CREATE_ASSET,asset_id,name,owner_key,value
        const signer = this.createSigner(privateKeyHex);
        const ownerKey = signer.getPublicKey().asHex();
        const payloadString = `CREATE_ASSET,${assetId},${name},${ownerKey},${value}`;
        const address = makeAddress(assetId);
        
        return this.sendTransaction(payloadString, privateKeyHex, [address], [address]);
    }

    async transferAsset(assetId, newOwnerKey, privateKeyHex) {
        // payload format: TRANSFER_ASSET,asset_id,new_owner_key
        const payloadString = `TRANSFER_ASSET,${assetId},${newOwnerKey}`;
        const address = makeAddress(assetId);
        
        return this.sendTransaction(payloadString, privateKeyHex, [address], [address]);
    }

    async waitCommit(batchId, maxWaitMs = 60000, pollIntervalMs = 2000) {
        const statusUrl = `${this.restApiUrl}/batch_statuses?id=${batchId}`;
        const deadline = Date.now() + maxWaitMs;
        let attempt = 0;

        console.log(`[Sawtooth] Polling batch ${batchId.substring(0, 16)}... (max ${maxWaitMs / 1000}s)`);

        while (Date.now() < deadline) {
            attempt++;
            try {
                const response = await axios.get(statusUrl, { timeout: 5000 });
                const entry = response.data.data[0];
                const status = entry.status;

                console.log(`[Sawtooth] Attempt ${attempt}: batch status = ${status}`);

                if (status === 'COMMITTED') {
                    console.log(`[Sawtooth] ✅ Batch committed after ${attempt} attempts`);
                    return true;
                }

                if (status === 'INVALID') {
                    const invalidTxns = entry.invalid_transactions;
                    const errMsg = (invalidTxns && invalidTxns[0]) ? invalidTxns[0].message : 'Unknown reason';
                    throw new Error(`Transaction Invalid: ${errMsg}`);
                }

                // status === 'PENDING' or 'UNKNOWN' — keep polling
            } catch (err) {
                // Re-throw only INVALID errors; network/timeout errors keep polling
                if (err.message && err.message.startsWith('Transaction Invalid:')) {
                    throw err;
                }
                console.warn(`[Sawtooth] Attempt ${attempt} error (retrying): ${err.message}`);
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
        }

        throw new Error(`Transaction timed out after ${maxWaitMs / 1000}s — batch ${batchId.substring(0, 16)} still PENDING. The consensus engine may be restarting; please retry.`);
    }

    async sendTestBatches(count, mode, privateKeyHex) {
        const signer = this.createSigner(privateKeyHex);
        const ownerKey = signer.getPublicKey().asHex();
        const batches = [];
        const baseAssetId = Math.random().toString(36).substring(2);

        for (let i = 0; i < count; i++) {
            // Parallel: Each tx targets a unique asset. Sequential: All txs target the SAME asset.
            const assetId = mode === 'parallel' ? `${baseAssetId}-${i}` : baseAssetId;
            const address = makeAddress(assetId);
            const payloadString = `CREATE_ASSET,${assetId},TestAsset${i},${ownerKey},1`;
            const payloadBytes = Buffer.from(payloadString, 'utf8');

            const transactionHeaderBytes = TransactionHeader.encode({
                familyName: ASSET_FAMILY,
                familyVersion: ASSET_VERSION,
                inputs: [ASSET_NAMESPACE, address].sort(),
                outputs: [ASSET_NAMESPACE, address].sort(),
                signerPublicKey: ownerKey,
                batcherPublicKey: ownerKey,
                dependencies: [],
                payloadSha512: hash(payloadBytes),
                nonce: Math.random().toString(36).substring(2)
            }).finish();

            const signature = signer.sign(transactionHeaderBytes);

            const transaction = Transaction.create({
                header: transactionHeaderBytes,
                headerSignature: signature,
                payload: payloadBytes
            });

            const batchHeaderBytes = BatchHeader.encode({
                signerPublicKey: ownerKey,
                transactionIds: [transaction.headerSignature]
            }).finish();

            const batchSignature = signer.sign(batchHeaderBytes);

            const batch = Batch.create({
                header: batchHeaderBytes,
                headerSignature: batchSignature,
                transactions: [transaction]
            });
            
            batches.push(batch);
        }

        const start = Date.now();
        const CHUNK_SIZE = 100;
        let lastBatchId = '';

        try {
            for (let i = 0; i < batches.length; i += CHUNK_SIZE) {
                const chunk = batches.slice(i, i + CHUNK_SIZE);
                const batchListBytes = BatchList.encode({ batches: chunk }).finish();
                
                const response = await axios.post(`${this.restApiUrl}/batches`, batchListBytes, {
                    headers: { 'Content-Type': 'application/octet-stream' },
                    timeout: 10000 // 10s timeout
                });
                
                lastBatchId = response.data.link.split('id=')[1];
                
                // Thêm một chút delay nhỏ giữa các chunk để validator kịp xử lý queue
                if (i + CHUNK_SIZE < batches.length) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            
            return { batchId: lastBatchId, durationMs: Date.now() - start };
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(JSON.stringify(error.response.data.error));
            }
            throw error;
        }
    }

    generateKeys() {
        const privateKey = this.context.newRandomPrivateKey();
        const signer = new CryptoFactory(this.context).newSigner(privateKey);
        return {
            privateKey: privateKey.asHex(),
            publicKey: signer.getPublicKey().asHex()
        };
    }
}

module.exports = SawtoothClient;
