<h1 align="center">🃏 Devs Playing Poker</h1>
<h4 align="center">The fastest way for your dev team to effort tickets.</h4>
<br>

![Production Deployment](https://github.com/lvl-mattwells/DevsPlayingPoker/workflows/Production%20Deployment/badge.svg)

## Purpose

Our teams at Levvel/Endava grew frustrated with existing efforting platforms. All we wanted was a simple, fast way to effort tickets and reduce meeting time. With the introduction of the Innovation Project Competition within Endava, we four developers banded together to set out to build a better efforting/ponting system for our teams to use. Thus, DevsPlayingPoker was born.

## Tech

### Backend

The backend is built using [Deno](https://deno.land) (with TypeScript of course) and uses MongoDb for data persistence. We chose Deno because it's first class WebScoket support, top-level async/await support, and simply because most of us hadn't ever used it before.

### Frontend

The frontend is built using [SolidJS](https://solidjs.com) and styled using [DaisyUI](https://daisyui.com/), [TailwindCSS](https://tailwindcss.com/), and [Sass](https://sass-lang.com/). We chose to go with SolidJS because of it's claims for incredible speed/performance, familiar JSX syntax, and again because none of us had used it before.

### Deployment

PRs are deployed as preview builds to [Deno Deploy](https://deno.com/deploy) and production builds are deployed to [fly.io](https://fly.io).

We originally had production deployments also going to Deno Deploy, but we noticed some sync issues within the rooms for some users. We discovered that Deno Deploy's edge deployment strategy was causing issues with how we track WebSocket connections for users in the rooms. To solve this issue, we decided to move to fly.io where we could control which regions our app was deployed to. We've limited deployments to a single region to ensure that all WebSocket connections are tracked on the same server allowing for much more stable updates to all users in the rooms.

## Getting Started

### Backend

1. Install Deno: https://deno.land/manual/getting_started/installation
2. `cd` into the `server/` folder.
3. Create a `.env` file in the `server/` directory with the contents: `export DB_URL=[mongo url here]`
   - I recommend running a [MongoDb Docker container](https://hub.docker.com/_/mongo) locally and using that for development.
4. Run the app using: `deno task run`
5. You should be up and running!

### Frontend

1. Install Node (v16) if you haven't already: https://nodejs.org/en/
2. `cd` into the `web/` directory
3. Run `npm install`
4. Run `npm start`
5. You should be good to go!

### Nuance

- We're using Vite to proxy requests to your locally running BE. You can see this in `web/vite.config.ts`.
- You probably want to install the Deno extension (assuming you're using VSCode): https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno
  - This will help for BE development, but will clash with the FE code. To scope the Deno extension to just the `server/` folder, open VSCode settings and add `./server` to the `Deno: Enable Paths` setting.
