import hashlib
import json

ASSET_NAMESPACE = hashlib.sha512('asset'.encode('utf-8')).hexdigest()[0:6]

def _make_address(asset_id):
    return ASSET_NAMESPACE + hashlib.sha512(asset_id.encode('utf-8')).hexdigest()[:64]

class AssetState:
    def __init__(self, context):
        self._context = context

    def get_asset(self, asset_id):
        address = _make_address(asset_id)
        state_entries = self._context.get_state([address])
        if state_entries:
            return json.loads(state_entries[0].data.decode('utf-8'))
        return None

    def set_asset(self, asset_id, asset_data):
        address = _make_address(asset_id)
        encoded_data = json.dumps(asset_data).encode('utf-8') 
        import pprint
        print("Setting State => ", address, " : ", asset_data)
        addresses = self._context.set_state({
            address: encoded_data
        })
        return addresses
