import hashlib
from sawtooth_sdk.processor.handler import TransactionHandler
from sawtooth_sdk.processor.exceptions import InvalidTransaction

from payload import AssetPayload
from state import AssetState, ASSET_NAMESPACE

class AssetTransactionHandler(TransactionHandler):

    @property
    def family_name(self):
        return 'asset'

    @property
    def family_versions(self):
        return ['1.0']

    @property
    def namespaces(self):
        return [ASSET_NAMESPACE]

    def apply(self, transaction, context):
        print(">>> TRANSACTION RECEIVED IN TP HANDLER <<<")
        header = transaction.header
        signer = header.signer_public_key
        
        payload = AssetPayload(transaction.payload)
        state = AssetState(context)
        
        if payload.action == 'CREATE_ASSET':
            print("Action: CREATE_ASSET")
            self._create_asset(payload, signer, state)
        elif payload.action == 'TRANSFER_ASSET':
            print("Action: TRANSFER_ASSET")
            self._transfer_asset(payload, signer, state)
        else:
            raise InvalidTransaction('Unhandled action: {}'.format(payload.action))

    def _create_asset(self, payload, signer, state):
        if state.get_asset(payload.asset_id) is not None:
            raise InvalidTransaction('Invalid action: Asset already exists: {}'.format(payload.asset_id))
            
        print("Creating asset: {} for {}".format(payload.asset_id, payload.owner_key))
        
        # Verify signer match
        if signer != payload.owner_key:
             raise InvalidTransaction("Signer {} does not match owner {}".format(signer, payload.owner_key))
             
        asset_data = {
            'asset_id': payload.asset_id,
            'name': payload.name,
            'owner_key': payload.owner_key,
            'value': payload.value
        }
        
        state.set_asset(payload.asset_id, asset_data)
        
        # Add event to ZMQ
        context = state._context
        context.add_event(
            event_type="asset/create",
            attributes=[
                ("asset_id", payload.asset_id),
                ("owner_key", payload.owner_key)
            ],
            data=payload.name.encode('utf-8')
        )

    def _transfer_asset(self, payload, signer, state):
        asset = state.get_asset(payload.asset_id)
        if asset is None:
            raise InvalidTransaction('Asset not found: {}'.format(payload.asset_id))
            
        print("Transfering asset: {} from {} to {}".format(payload.asset_id, asset['owner_key'], payload.new_owner_key))
            
        # Security: Only owner can transfer
        if asset['owner_key'] != signer:
            raise InvalidTransaction('Invalid Signature: Only the owner can transfer this asset.')
            
        asset['owner_key'] = payload.new_owner_key
        state.set_asset(payload.asset_id, asset)
        
        context = state._context
        context.add_event(
            event_type="asset/transfer",
            attributes=[
                ("asset_id", payload.asset_id),
                ("from_key", signer),
                ("to_key", payload.new_owner_key)
            ],
            data=b""
        )
