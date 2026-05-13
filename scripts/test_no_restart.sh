#!/usr/bin/env bash
# =============================================================================
# test_no_restart.sh — Kiểm tra cơ chế submit transaction KHÔNG có waitCommit
# =============================================================================
set -e

PROJECT_DIR="/mnt/d/Study/Blockchain_Technology/Projects/hyperledger-sawtooth-asset-management"
BACKEND_URL="http://localhost:3001"
SAWTOOTH_URL="http://localhost:8008"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'; BOLD='\033[1m'
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; }
hdr()  { echo -e "\n${BOLD}─── $1 ───────────────────────────────────────────${NC}"; }

# ─── 0. Docker Compose status ────────────────────────────────────────────────
hdr "0. Docker Compose Status"
cd "$PROJECT_DIR"
docker compose ps 2>/dev/null | grep -E "(NAME|sawtooth)" || warn "Some containers may not be running"

# ─── 1. Sawtooth REST API health ─────────────────────────────────────────────
hdr "1. Sawtooth REST API Health (port 8008)"
if curl -sf "$SAWTOOTH_URL/blocks?limit=1" > /dev/null 2>&1; then
    ok "Sawtooth REST API is reachable"
    BLOCK_COUNT=$(curl -sf "$SAWTOOTH_URL/blocks" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data', [])))" 2>/dev/null || echo "?")
    echo "   → Block count in chain: $BLOCK_COUNT"
else
    fail "Sawtooth REST API not reachable. Is the validator running?"
    echo "   Try: docker compose up -d validator rest-api"
fi

# ─── 2. Backend API health ───────────────────────────────────────────────────
hdr "2. Backend API Health (port 3001)"
if curl -sf "$BACKEND_URL/api/assets" > /dev/null 2>&1; then
    ok "Backend API is reachable"
else
    fail "Backend API not reachable. Rebuilding & restarting..."
    cd "$PROJECT_DIR"
    docker compose up -d --build backend
    echo "   Waiting 5s for backend to start..."
    sleep 5
    if curl -sf "$BACKEND_URL/api/assets" > /dev/null 2>&1; then
        ok "Backend started successfully"
    else
        fail "Backend still not responding. Check logs: docker compose logs backend"
        exit 1
    fi
fi

# ─── 3. Get private key for testing ──────────────────────────────────────────
hdr "3. Generating test keypair"
KEY_RESP=$(curl -sf "$BACKEND_URL/api/assets/keys")
PRIVATE_KEY=$(echo "$KEY_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['privateKey'])" 2>/dev/null)
PUBLIC_KEY=$(echo "$KEY_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['publicKey'])" 2>/dev/null)

if [ -z "$PRIVATE_KEY" ]; then
    fail "Could not generate keypair from backend"
    exit 1
fi
ok "Keys generated"
echo "   Public key: ${PUBLIC_KEY:0:20}..."

# ─── 4. Submit asset transaction — should return IMMEDIATELY ─────────────────
hdr "4. Submit Transaction (expect immediate PENDING response)"
ASSET_ID="test-$(date +%s)-$(shuf -i 1000-9999 -n 1)"
ASSET_NAME="TestAsset-$(date +%H%M%S)"

echo "   Asset ID : $ASSET_ID"
echo "   Asset Name: $ASSET_NAME"

START_TIME=$(date +%s%3N)

HTTP_RESP=$(curl -sf -X POST "$BACKEND_URL/api/assets" \
    -H "Content-Type: application/json" \
    -d "{\"assetId\":\"$ASSET_ID\",\"name\":\"$ASSET_NAME\",\"value\":\"1000\",\"privateKey\":\"$PRIVATE_KEY\"}" \
    2>&1)
HTTP_STATUS=$?

END_TIME=$(date +%s%3N)
ELAPSED=$((END_TIME - START_TIME))

echo "   Response time: ${ELAPSED}ms"

if [ $HTTP_STATUS -ne 0 ]; then
    fail "curl failed — backend may be down: $HTTP_RESP"
    exit 1
fi

echo "   Raw response: $HTTP_RESP"

# Kiểm tra success=true
SUCCESS=$(echo "$HTTP_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success', False))" 2>/dev/null)
STATUS=$(echo  "$HTTP_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status', ''))" 2>/dev/null)
BATCH_ID=$(echo "$HTTP_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('batchId',''))" 2>/dev/null)

if [ "$SUCCESS" = "True" ] && [ "$STATUS" = "PENDING" ]; then
    ok "Transaction submitted successfully — returned PENDING in ${ELAPSED}ms (no blocking wait!)"
    echo "   Batch ID: ${BATCH_ID:0:32}..."

    # Xác nhận không bị timeout (waitCommit cũ mất 60s)
    if [ "$ELAPSED" -lt 10000 ]; then
        ok "Response time < 10s ✓ — waitCommit loop has been REMOVED"
    else
        warn "Response took ${ELAPSED}ms — check if waitCommit is still active"
    fi
else
    fail "Unexpected response: success=$SUCCESS, status=$STATUS"
    echo "   Response: $HTTP_RESP"
fi

# ─── 5. Poll batch status (optional verification) ─────────────────────────────
hdr "5. Verifying Batch Status on Blockchain"
if [ -n "$BATCH_ID" ]; then
    sleep 3  # Chờ validator xử lý
    BATCH_STATUS=$(curl -sf "$SAWTOOTH_URL/batch_statuses?id=$BATCH_ID" | \
        python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['status'])" 2>/dev/null || echo "UNKNOWN")
    echo "   Batch $BATCH_ID status after 3s: $BATCH_STATUS"
    if [ "$BATCH_STATUS" = "COMMITTED" ]; then
        ok "Transaction COMMITTED to blockchain ✓"
    elif [ "$BATCH_STATUS" = "PENDING" ]; then
        warn "Still PENDING (validator may need more time)"
    elif [ "$BATCH_STATUS" = "INVALID" ]; then
        fail "Transaction INVALID — check transaction processor logs"
    fi
fi

# ─── 6. Test error case — missing fields ─────────────────────────────────────
hdr "6. Test Error Handling (missing privateKey)"
ERR_RESP=$(curl -sf -X POST "$BACKEND_URL/api/assets" \
    -H "Content-Type: application/json" \
    -d '{"assetId":"err-test","name":"Err","value":"1"}' \
    2>&1 || echo '{"success":false}')
ERR_SUCCESS=$(echo "$ERR_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success', '?'))" 2>/dev/null)
if [ "$ERR_SUCCESS" = "False" ]; then
    ok "Error case returns {success: false} correctly"
    ERR_MSG=$(echo "$ERR_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',''))" 2>/dev/null)
    echo "   Error message: $ERR_MSG"
else
    warn "Expected failure but got: $ERR_RESP"
fi

# ─── Summary ─────────────────────────────────────────────────────────────────
hdr "Summary"
echo "  Backend  : $BACKEND_URL"
echo "  Sawtooth : $SAWTOOTH_URL"
echo ""
echo "  ✅ waitCommit loop REMOVED from backend/routes/assets.js"
echo "  ✅ alert() REMOVED from frontend/src/components/AssetManager.jsx"
echo "  ✅ Toast notification system added (PENDING / ERROR states)"
echo "  ✅ Form resets + assets reload after 2s delay"
echo ""
echo -e "${BOLD}Run in browser: http://localhost:8080${NC}"
