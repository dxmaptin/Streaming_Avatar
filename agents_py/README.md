# Python Worker: OpenAI Realtime + Beyond Presence Avatar

## Install

- Create venv and install the plugins

```
python3 -m venv .venv
source .venv/bin/activate
pip install "livekit-agents[openai,bey]~=1.2"
```

## Env

- Required:
  - `LIVEKIT_URL` (e.g., `wss://<project>.livekit.cloud`)
  - `LIVEKIT_API_KEY`
  - `LIVEKIT_API_SECRET`
  - `OPENAI_API_KEY`
  - `BEY_API_KEY`
- Optional:
  - `BP_AVATAR_ID` (defaults to `b5bebaf9-ae80-4e43-b97f-4506136ed926`)
  - `OPENAI_VOICE` (defaults to `martin`)
  - `OPENAI_REALTIME_MODEL` (defaults to `gpt-4o-realtime-preview`)
  - `LIVEKIT_AGENT_NAME_BEY` (defaults to `openai-martin-bey`)

## Run

```
python3 agents_py/openai_martin_bey.py
```

Then dispatch it into a room from the Next.js endpoint:

```
curl -sS -X POST http://localhost:3000/api/livekit/agent/dispatch \
  -H 'Content-Type: application/json' \
  -d '{"roomName":"demo","agentName":"openai-martin-bey"}' | jq
```

The avatar participant (default identity `bey-avatar-agent`) publishes video to the room.

