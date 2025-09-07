<<<<<<< HEAD
# Interactive Avatar NextJS Demo

This is a sample project and was bootstrapped using [NextJS](https://nextjs.org/).
=======
# Studio Stream (Next.js)

![Studio Stream UI Screenshot](./public/demo.png)

This is a sample streaming UI built with [Next.js](https://nextjs.org/). It showcases a professional broadcast interface with a dark theme, glass surfaces, gradient accents, and a prominent video viewport.
>>>>>>> 7b27993 (livekit)

## Getting Started FAQ

### Setting up the demo

1. Clone this repo

2. Navigate to the repo folder in your terminal

3. Run `npm install` (assuming you have npm installed. If not, please follow these instructions: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/)

4. Provide your streaming API token in the `.env` file as `STREAMING_API_KEY`. This allows the app to mint short‑lived access tokens for sessions.

5. (Optional) If you would like to use the OpenAI features, enter your OpenAI Api Key in the `.env` file.

6. Run `npm run dev`

<<<<<<< HEAD
=======
### Starting sessions

Make sure you’ve added your token to `.env` and run `npm run dev`. Click “Start Voice Chat” or “Start Text Chat” in the control dock to initiate a session. Use the right‑hand chat panel to review conversation history.

### Preset avatars and default

You can optionally configure a default avatar and a selectable list without changing code:

- `NEXT_PUBLIC_DEFAULT_AVATAR_ID`: preselects an avatar ID for the Start button.
- `NEXT_PUBLIC_PRESET_AVATARS`: JSON array of `{ name, avatar_id }` to show a dropdown, plus a "Custom Avatar ID" option.

Example:

```
NEXT_PUBLIC_DEFAULT_AVATAR_ID=host_a_id
NEXT_PUBLIC_PRESET_AVATARS=[
  {"name":"Studio Host A","avatar_id":"host_a_id"},
  {"name":"Studio Host B","avatar_id":"host_b_id"}
]
```
>>>>>>> 7b27993 (livekit)
