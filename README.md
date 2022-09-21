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
The frontend is built using [SolidJS](https://solidjs.com) and styled by hand using [Sass](https://sass-lang.com/). We chose to go with SolidJS because of it's claims for incredible speed/performance, familiar JSX syntax, and again because none of us had used it before.

### Deployment
PRs are deployed as preview builds to [Deno Deploy](https://deno.com/deploy) and production builds are deployed to [fly.io](https://fly.io).

We originally had production deployments also going to Deno Deploy, but we noticed some sync issues within the rooms for some users. We discovered that Deno Deploy's edge deployment strategy was causing issues with how we track WebSocket connections for users in the rooms. To solve this issue, we decided to move to fly.io where we could control which regions our app was deployed to. We've limited deployments to a single region to ensure that all WebSocket connections are tracked on the same server allowing for much more stable updates to all users in the rooms.
