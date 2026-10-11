# TaskFlow Cloud Backend

The TaskFlow Cloud backend is an Express API backed by PostgreSQL. It provides authentication, workspace and member management, task management, and dashboard data.

## Requirements

- Node.js
- npm
- PostgreSQL

## Setup

From the `backend` directory:

```bash
npm install
```

Create a `.env` file in this directory with the following values:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow
DB_USER=postgres
DB_PASSWORD=your-database-password
```

The database must be initialized with the application's tables (`users`, `workspaces`, `workspace_members`, and `tasks`) before using the API. The server checks its PostgreSQL connection at startup. Some request handlers ensure the task `priority` and workspace member `role` columns exist; the backend does not create the complete schema.

Start the API:

```bash
npm run dev
```

Or start it without the development watcher:

```bash
npm start
```

The default base URL is `http://localhost:5000`. Set `PORT` to change the listening port.

## API conventions

- All API paths are prefixed with `/api`.
- Endpoints that require authentication read the JWT from the HTTP-only `token` cookie. Send and retain cookies when making requests (for example, use `curl -c cookies.txt` on login and `curl -b cookies.txt` for later calls).
- Send JSON request bodies with `Content-Type: application/json`.
- Successful responses generally include `"success": true`; errors generally include `"success": false` and a `"message"`.
- JWT cookies expire after 24 hours. The cookie is marked `Secure` when `NODE_ENV=production`.
- CORS is configured for `http://localhost:5173` with credentials enabled.

### Common authentication errors

Protected endpoints return `401` with `"Not authenticated"` when no token cookie is present, or `"Invalid token"` when the token cannot be verified.

## Endpoints

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/test` | No | Checks that the API server is running. |

Example response:

```json
{
  "message": "Server is running!"
}
```

### Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Registers a user and sets the authentication cookie. |
| `POST` | `/api/auth/login` | No | Authenticates a user and sets the authentication cookie. |
| `POST` | `/api/auth/logout` | No | Clears the authentication cookie. |
| `GET` | `/api/auth/profile` | Yes | Gets the authenticated user's profile. |

#### `POST /api/auth/register`

Request:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "StrongPass1!"
}
```

Password must be at least 8 characters and contain a lowercase letter, uppercase letter, digit, and one of `!@#$%^&*`.

Success (`201`) includes `user` with `id`, `name`, and `email`. The response also sets the `token` cookie. Missing fields, a duplicate email, or a weak password return `400`.

#### `POST /api/auth/login`

Request:

```json
{
  "email": "ada@example.com",
  "password": "StrongPass1!"
}
```

Success (`200`) includes `user` and a `token` property and sets the `token` cookie. Missing credentials or invalid credentials return `400`.

#### `POST /api/auth/logout`

Clears the `token` cookie and returns `200`:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### `GET /api/auth/profile`

Returns the current user's `id`, `name`, `email`, and `role` in `user`.

### Workspaces

All workspace endpoints require authentication.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/workspaces` | Creates a workspace; its creator is added as an Admin member. |
| `GET` | `/api/workspaces` | Lists workspaces the current user belongs to. |
| `GET` | `/api/workspaces/:id` | Gets a workspace the current user belongs to. |
| `GET` | `/api/workspaces/:id/members` | Lists members of a workspace. |
| `POST` | `/api/workspaces/:id/members` | Adds an existing user to a workspace by email. |
| `GET` | `/api/workspaces/:id/tasks` | Lists tasks in a workspace. |
| `POST` | `/api/workspaces/:id/tasks` | Creates a task in a workspace. |

#### `POST /api/workspaces`

Request:

```json
{
  "name": "Product Team",
  "description": "Planning and delivery"
}
```

`name` is required; `description` is optional. Success returns `201` with the created `workspace`. A duplicate workspace name owned by the same user returns `400`.

#### `GET /api/workspaces`

Returns `count` and a `workspaces` array. Each item includes `id`, `name`, `description`, `owner_id`, and `created_at`.

#### `GET /api/workspaces/:id`

Returns the workspace in `workspace`, including `id`, `name`, `description`, `owner_id`, and `created_at`. Returns `404` if it does not exist or the user is not a member.

#### `GET /api/workspaces/:id/members`

Returns a `members` array. Each member includes `id`, `user_id`, `name`, `email`, and `role`. The requester must belong to the workspace.

#### `POST /api/workspaces/:id/members`

Request:

```json
{
  "email": "teammate@example.com",
  "role": "Member"
}
```

`email` is required; `role` is optional and defaults to `"Member"`. The target account must already exist. The requester must be a workspace member. Returns `201` when added and `200` if the user is already a member.

#### `GET /api/workspaces/:id/tasks`

Returns a `tasks` array for the workspace. Each task includes `id`, `title`, `description`, `status`, `workspace_id`, `deadline`, `priority`, `assigned_to`, and `assigned_to_name`. The requester must belong to the workspace.

#### `POST /api/workspaces/:id/tasks`

Request:

```json
{
  "title": "Prepare release notes",
  "description": "Summarize the completed work",
  "status": "To Do",
  "priority": "Medium",
  "deadline": "2026-11-01",
  "assigned_to": "USER_ID"
}
```

`title` is required. `description`, `status`, `priority`, `deadline`, and `assigned_to` are optional; defaults are `"To Do"` for status and `"Medium"` for priority. If supplied, `assigned_to` must identify a member of the workspace. Only the workspace owner can create tasks using this endpoint. Success returns `201` with the created `task`.

### Tasks

All task endpoints require authentication.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/tasks` | Creates a task. |
| `GET` | `/api/tasks` | Lists tasks assigned to the current user. |
| `GET` | `/api/tasks/workspace/:workspaceId` | Lists tasks for a workspace. |
| `GET` | `/api/tasks/:taskId` | Gets a task by ID. |
| `PUT` | `/api/tasks/:taskId` | Updates a task. |
| `PATCH` | `/api/tasks/:taskId/status` | Changes a task's status. |
| `DELETE` | `/api/tasks/:taskId` | Deletes a task. |

#### `POST /api/tasks`

Request:

```json
{
  "title": "Write tests",
  "description": "Cover the API",
  "status": "To Do",
  "workspace_id": "WORKSPACE_ID",
  "deadline": "2026-11-01",
  "assigned_to": "USER_ID",
  "priority": "High"
}
```

`title` is required. The other fields are optional at the handler level; defaults are `"To Do"` for status, `"Medium"` for priority, and `null` for description, deadline, and assignee. Returns `201` with the created `task`.

#### `GET /api/tasks`

Returns a `tasks` array containing tasks assigned to the current user, ordered newest first.

#### `GET /api/tasks/workspace/:workspaceId`

Returns a `tasks` array for the specified workspace. The requester must be a workspace member.

#### `GET /api/tasks/:taskId`

Returns the task in `task`, or `404` with `"Task not found"`.

#### `PUT /api/tasks/:taskId`

Request body fields:

```json
{
  "title": "Write integration tests",
  "description": "Cover the API",
  "status": "In Progress",
  "deadline": "2026-11-01",
  "assigned_to": "USER_ID",
  "priority": "High"
}
```

The handler updates these fields from the request body and returns the updated task in `task`. Members can update only tasks assigned to them. Returns `404` if the task does not exist.

#### `PATCH /api/tasks/:taskId/status`

Request:

```json
{
  "status": "In Progress"
}
```

Allowed statuses are `"To Do"`, `"In Progress"`, and `"Done"`. Members can update the status only for tasks assigned to them. Returns the updated task in `task`; invalid status returns `400` and an unknown task returns `404`.

#### `DELETE /api/tasks/:taskId`

Deletes the task and returns the deleted record in `task`. Returns `404` if the task does not exist.

### Dashboard

All dashboard endpoints require authentication.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Gets task and workspace counts for the current user. |
| `GET` | `/api/dashboard/tasks` | Lists the current user's tasks not marked Done. |
| `GET` | `/api/dashboard/projects` | Lists up to five workspaces the current user belongs to. |

#### `GET /api/dashboard/stats`

Returns:

```json
{
  "success": true,
  "stats": {
    "totalTasks": 4,
    "completedTasks": 1,
    "pendingTasks": 3,
    "workspaces": 2
  }
}
```

The task counts are based on tasks assigned to the current user; completed tasks have status `"Done"`.

#### `GET /api/dashboard/tasks`

Returns a `tasks` array of tasks assigned to the current user whose status is not `"Done"`. Each item includes `id`, `title`, `description`, `status`, `deadline`, and `created_at`.

#### `GET /api/dashboard/projects`

Returns a `projects` array of up to five workspaces the current user belongs to, ordered newest first. Each item includes `id`, `name`, `description`, and `created_at`.

## Task status updates

Task create/update/delete and status-update handlers emit a Socket.IO `task:update` event when the server's Socket.IO instance is available. The event payload is:

```json
{
  "event": "created",
  "task": {}
}
```

The `event` value is `created`, `updated`, `deleted`, or `status-updated`.
