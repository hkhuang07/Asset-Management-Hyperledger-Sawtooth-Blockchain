from sawtooth_sdk.processor.exceptions import InvalidTransaction

class AssetPayload:
    def __init__(self, payload_data):
        try:
            # Payload format: action,asset_id,name,owner_key
            parts = payload_data.decode('utf-8').split(',')
            self.action = parts[0]

            if self.action == 'CREATE_ASSET':
                if len(parts) != 5:
                    raise InvalidTransaction('Invalid payload serialization (expected action,id,name,owner,value)')
                self.asset_id = parts[1]
                self.name = parts[2]
                self.owner_key = parts[3]
                self.value = parts[4]
            elif self.action == 'TRANSFER_ASSET':
                if len(parts) != 3:
                    raise InvalidTransaction('Invalid payload serialization')
                self.asset_id = parts[1]
                self.new_owner_key = parts[2]
            else:
                raise InvalidTransaction('Invalid action: {}'.format(self.action))
        except Exception as e:
            raise InvalidTransaction('Invalid payload serialization: {}'.format(e))
