import sys
import argparse
import traceback
from sawtooth_sdk.processor.core import TransactionProcessor

def main():
    print("Pre-initialization check...", flush=True)
    parser = argparse.ArgumentParser(formatter_class=argparse.RawTextHelpFormatter)
    parser.add_argument('-C', '--connect', default='tcp://localhost:4004')
    args = parser.parse_args()

    try:
        from handler import AssetTransactionHandler
        handler = AssetTransactionHandler()
        
        processor = TransactionProcessor(url=args.connect)
        print("Adding handler for family: {}...".format(handler.family_name), flush=True)
        processor.add_handler(handler)
        
        print("Starting Asset TP and connecting to {}...".format(args.connect), flush=True)
        processor.start()
        print("TP is now running and waiting for transactions.", flush=True)
    except Exception as e:
        print("CRITICAL ERROR: {}".format(e), flush=True)
        traceback.print_exc()
        sys.exit(1)
    finally:
        if 'processor' in locals():
            processor.stop()

if __name__ == '__main__':
    main()
