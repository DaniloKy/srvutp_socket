Nota: Este repositório é a API e servidor Websocket. Para veres o Jogo/Site em funcionamento (Frontend), acede aqui: [Link para o repo do Site](https://github.com/DaniloKy/srv_main)

# srvutp_socket

Backend service for Survive Utopia (srvutp), built with Cloudflare Workers, Durable Objects, and D1 Database.

## Features

- **WebSocket Server**: Real-time communication handled by Durable Objects (`WebServerV2`).
- **Game Logic**: Management of lobbies (`LobbyV2`) and game state.
- **REST API**: Endpoints for managing players and classes.
- **Data Persistence**:
  - **D1 Database**: Relational data for players, stats, and classes.
  - **KV Storage**: Fast access for perks, skills, inventory, and stash.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Configuration**
    Create a `.env` file in the root directory (copy from `.env.example` if available) and set your secure token:
    ```env
    TOKEN=YourSecureTokenHere
    ```
    *Note: The `.env` file is ignored by git for security.*

3.  **Database Setup**
    Initialize your D1 database using the schema provided in `resources/schema.sql`.
    ```bash
    wrangler d1 execute <DATABASE_NAME> --file=resources/schema.sql
    ```

## Running Locally

Start the local development server:

```bash
npm run dev
```

The server will typically run at `http://localhost:8787`.

## API Endpoints

### WebSocket
- `ws://<host>/ws`: Connect to the game server.

### Classes
- `GET /classes`: List all classes.
- `GET /classes/<id>`: Get class by ID.
- `GET /classes/<name>?name=true`: Get class by name.
- `POST /classes`: Create a new class (Requires Auth).

### Characters (Players)
- `GET /character`: List all players.
- `GET /character/belong_to/<id>`: List players belonging to a user ID.
- `GET /character/<username>?username=true`: Get player by username.
- `POST /character`: Create a new character (Requires Auth).
- `DELETE /character/<id>/<belong_to>`: Delete a character (Requires Auth).

## Scripts

Helper scripts are located in the `scripts/` directory to test API endpoints.

**Note:** These scripts automatically read the `TOKEN` from your local `.env` file via `scripts/config.js`.

Example usage:
```bash
node scripts/getClasses.js
node scripts/createPlayer.js
```

## Project Structure

- `src/`: Source code for the Worker and Durable Objects.
  - `index.ts`: Main entry point and router.
  - `Env.ts`: Environment interface definitions.
  - `LobbyV2.ts`: Lobby management logic.
  - `WebServerV2.ts`: WebSocket server logic.
- `scripts/`: Client-side scripts for testing and administration.
- `resources/`: SQL schemas and other static resources.
