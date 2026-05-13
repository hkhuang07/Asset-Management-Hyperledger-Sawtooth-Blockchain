import hashlib
import time
from sawtooth_sdk.messaging.stream import Stream
from sawtooth_sdk.protobuf.transaction_pb2 import TransactionHeader, Transaction
from sawtooth_sdk.protobuf.batch_pb2 import BatchHeader, Batch, BatchList
from sawtooth_signing import create_context
import requests

def test_submission():
    print("--- STARTING BLOCKCHAIN DIAGNOSTIC ---")
    
    # 1. Setup Signing
    context = create_context('secp256k1')
    private_key = context.new_random_private_key()
    signer = context.new_signer(private_key)
    public_key = signer.get_public_key().as_hex()

    # 2. Build Transaction
    payload = "DIAGNOSTIC_TEST,test_id,123".encode()
    payload_hash = hashlib.sha512(payload).hexdigest()
    
    header = TransactionHeader(
        family_name='asset',
        family_version='1.0',
        inputs=['92a8fd'],
        outputs=['92a8fd'],
        signer_public_key=public_key,
        batcher_public_key=public_key,
        dependencies=[],
        payload_sha512=payload_hash,
        nonce=str(time.time())
    ).SerializeToString()

    signature = signer.sign(header)
    transaction = Transaction(
        header=header,
        header_signature=signature,
        payload=payload
    )

    # 3. Build Batch
    batch_header = BatchHeader(
        signer_public_key=public_key,
        transaction_ids=[transaction.header_signature],
    ).SerializeToString()

    batch_signature = signer.sign(batch_header)
    batch = Batch(
        header=batch_header,
        header_signature=batch_signature,
        transactions=[transaction]
    )

    batch_list = BatchList(batches=[batch]).SerializeToString()

    # 4. Submit to REST API
    try:
        print("Submitting experimental batch to REST API...")
        resp = requests.post(
            'http://sawtooth-rest-api:8008/batches',
            data=batch_list,
            headers={'Content-Type': 'application/octet-stream'}
        )
        print(f"Response: {resp.status_code} - {resp.json()}")
        
        link = resp.json()['link']
        
        # 5. Wait for commit
        print("Waiting for commit (max 10s)...")
        for _ in range(10):
            status_resp = requests.get(link)
            status = status_resp.json()['data'][0]['status']
            print(f"Current Status: {status}")
            if status == 'COMMITTED':
                print("✅ RESULT: BLOCKCHAIN CORE IS WORKING PERFECTLY!")
                return True
            time.sleep(1)
            
        print("❌ RESULT: BLOCKCHAIN CORE IS STALLED (PENDING).")
        return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == '__main__':
    test_submission()
