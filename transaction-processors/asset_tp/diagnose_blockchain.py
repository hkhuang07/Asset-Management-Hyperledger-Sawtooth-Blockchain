import hashlib
import time
import json
import urllib.request
import urllib.error
from sawtooth_sdk.messaging.stream import Stream
from sawtooth_sdk.protobuf.transaction_pb2 import TransactionHeader, Transaction
from sawtooth_sdk.protobuf.batch_pb2 import BatchHeader, Batch, BatchList
from sawtooth_signing import create_context
from sawtooth_signing import CryptoFactory

def test_submission():
    print("--- STARTING BLOCKCHAIN DIAGNOSTIC (CORE VERSION) ---")
    
    # 1. Setup Signing
    context = create_context('secp256k1')
    private_key = context.new_random_private_key()
    signer = CryptoFactory(context).new_signer(private_key)
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

    # 4. Submit to REST API (Using SAWTOOTH-CORE instead of rest-api)
    url = 'http://sawtooth-core:8008/batches'
    try:
        print(f"Submitting experimental batch to {url}...")
        req = urllib.request.Request(url, data=batch_list, headers={'Content-Type': 'application/octet-stream'})
        with urllib.request.urlopen(req) as response:
            resp_body = response.read().decode()
            resp_json = json.loads(resp_body)
            print(f"Response Code: {response.getcode()}")
            
            link = resp_json['link']
        
        # 5. Wait for commit
        print("Waiting for commit (max 30s)...")
        for i in range(30):
            try:
                # Resolve link relative to sawtooth-core if it's just a path
                full_link = link
                if not link.startswith('http'):
                    full_link = f"http://sawtooth-core:8008{link}"
                
                with urllib.request.urlopen(full_link) as status_response:
                    content = status_response.read().decode()
                    status_json = json.loads(content)
                    status = status_json['data'][0]['status']
                    print(f"[{i+1}/30] Current Status: {status}")
                    if status == 'COMMITTED':
                        print("\n[OK] RESULT: BLOCKCHAIN CORE IS WORKING PERFECTLY!")
                        return True
            except Exception as e:
                # print(f"DEBUG: {e}")
                pass
            time.sleep(1)
            
        print("\n[FAILED] RESULT: BLOCKCHAIN CORE IS STALLED (PENDING).")
        return False
    except urllib.error.URLError as e:
        print(f"ERROR connecting to REST API: {e}")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == '__main__':
    test_submission()
