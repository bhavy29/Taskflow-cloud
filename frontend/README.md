# TaskFlow Cloud Frontend

The frontend for TaskFlow Cloud, a task and workspace management application. It is a single-page React app built with Vite.

## Features

- Register and sign in
- View dashboard task and workspace statistics
- Create and manage tasks
- Browse workspaces and workspace details
- Receive task updates through Socket.IO

## Tech stack

- React 19
- Vite 8
- React Router
- Axios
- Socket.IO Client

## Prerequisites

- Node.js and npm
- The TaskFlow Cloud backend running locally on port `5000`

## Getting started

From the `frontend` directory, install dependencies and start the development server:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

The frontend's API client currently sends requests to `http://localhost:5000/api` and includes credentials for cookie-based authentication. To use a backend at another address, update the API client's `baseURL` in `src/services/api.js`.

The Socket.IO client currently connects to the frontend's own origin (`/`). Configure a development proxy or update `src/services/socket.js` if the backend socket server is hosted at a different origin.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production assets into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Production build

```sh
npm run build
npm run preview
```

The generated static site is written to `dist/`. Configure your web server to serve the built files and route SPA paths (such as `/dashboard` and `/workspaces`) back to `index.html`.