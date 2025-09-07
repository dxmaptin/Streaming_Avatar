"""
LiveKit Agents (Python) - OpenAI Realtime + Beyond Presence avatar

Prereqs:
  pip install "livekit-agents[openai,bey]~=1.2"

Env required (typical):
  LIVEKIT_URL=wss://<your>.livekit.cloud
  LIVEKIT_API_KEY=...
  LIVEKIT_API_SECRET=...
  OPENAI_API_KEY=...
  BEY_API_KEY=...        # per Beyond Presence docs
  BP_AVATAR_ID=b5bebaf9-ae80-4e43-b97f-4506136ed926

Run locally:
  python3 agents_py/openai_martin_bey.py

Then dispatch into a room from the Next.js API route or use Workers Playground.
"""

import os
import asyncio
import json
from livekit.agents import cli, WorkerOptions, voice
from livekit.plugins import openai as openai_plugin
from livekit.plugins import bey
from livekit import rtc


INSTRUCTIONS = os.getenv(
    "AGENT_INSTRUCTIONS",
    "You are a concise, friendly voice assistant.",
)
MODEL = os.getenv("OPENAI_REALTIME_MODEL", "gpt-4o-realtime-preview")
VOICE = os.getenv("OPENAI_VOICE", "martin")
AVATAR_ID = os.getenv("BP_AVATAR_ID", "b5bebaf9-ae80-4e43-b97f-4506136ed926")


async def entry(ctx):
    # Connect the worker to the target room
    await ctx.connect()

    # Define agent behavior
    agent = voice.Agent(
        instructions=INSTRUCTIONS,
    )

    # LLM+STT+TTS via OpenAI Realtime (voice set to martin)
    session = voice.AgentSession(
        llm=openai_plugin.realtime.RealtimeModel(
            model=MODEL,
            voice=VOICE,
            # Reduce sensitivity to interruptions
            turn_detection={
                "type": "server_vad", 
                "threshold": 0.7,  # Higher threshold = less sensitive
                "silence_duration_ms": 800,  # Wait longer before considering silence
                "prefix_padding_ms": 300
            },
            temperature=0.8,
        )
    )

    # Configure Beyond Presence avatar
    avatar = bey.AvatarSession(
        avatar_id=AVATAR_ID,
        # You can customize participant identity/name if needed:
        # avatar_participant_identity="bey-avatar-agent",
        # avatar_participant_name="bey-avatar-agent",
    )

    # Handle text messages from LiveKit data channels
    async def handle_text_message(text_message: str):
        """Convert text message to voice response via OpenAI Realtime"""
        try:
            print(f"📝 Received text message: {text_message}")
            # Use the session to generate a voice response to the text
            await session.generate_reply(instructions=f"Respond to this message: {text_message}")
        except Exception as e:
            print(f"❌ Error handling text message: {e}")

    # Listen for data messages (text chat)
    def on_data_received(data_packet: rtc.DataPacket):
        try:
            # Decode the data packet
            data_str = data_packet.data.decode('utf-8')
            message_data = json.loads(data_str)
            
            if message_data.get('type') == 'user_message':
                text = message_data.get('text', '')
                if text:
                    # Schedule the async text handler
                    asyncio.create_task(handle_text_message(text))
            elif message_data.get('type') == 'repeat_message':
                text = message_data.get('text', '')
                if text:
                    # For repeat messages, just speak the text directly
                    asyncio.create_task(session.generate_reply(instructions=f"Say exactly: {text}"))
                    
        except Exception as e:
            print(f"❌ Error processing data packet: {e}")

    # Set up data packet listener
    ctx.room.on("data_received", on_data_received)

    # Start the Beyond Presence avatar first; it will join the same room
    await avatar.start(session, room=ctx.room)

    # Start the voice agent session
    await session.start(agent=agent, room=ctx.room)

    # Optional: initial greeting
    await session.generate_reply(instructions="Greet the user briefly and mention you can respond to both voice and text messages.")


if __name__ == "__main__":
    # Register an agentName so we can dispatch explicitly
    agent_name = os.getenv("LIVEKIT_AGENT_NAME_BEY", "openai-martin-bey")
    cli.run_app(WorkerOptions(entrypoint_fnc=entry, agent_name=agent_name))

