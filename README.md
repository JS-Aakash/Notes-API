# 📝 Terminal Notes App - REST, GraphQL, Socket.IO

A multi-user Notes application built for the terminal that demonstrates **GraphQL**, **REST API**, and **Socket.IO** working together seamlessly.

## 🎯 What Makes This Special

This isn't just another CRUD app. It demonstrates:

- **GraphQL*: Nested queries, input types, real-time filtering
- **REST API**: Traditional HTTP endpoints for comparison
- **Socket.IO**: Real-time multi-user synchronization
- **Unified Architecture**: Both GraphQL and REST trigger the same real-time events
- **JWT Authentication**: Single token works across all three protocols
- **Terminal-First**: No browser required - pure CLI experience

---

## 🚀 Starting the Server

### Development Mode (with auto-reload)

```bash
cd server
npm run dev
```

### Production Mode

```bash
cd server
npm start
```

**Expected Server Output:**
```
✅ MongoDB connected
🚀 Server running on http://localhost:4000
📊 GraphQL endpoint: http://localhost:4000/graphql
🔌 Socket.IO ready for connections
📝 REST API available at http://localhost:4000/api
```

**Server is ready when you see all 5 checkmarks/emojis!**

---

## 📖 CLI Commands Reference

### Authentication Commands

| Command | Description | Example |
|---------|-------------|---------|
| `notes register <username> <email> <password>` | Register new user | `notes register alice alice@example.com pass123` |
| `notes login <username> <password>` | Login to account | `notes login alice pass123` |
| `notes logout` | Logout and clear token | `notes logout` |
| `notes me` | Show current user info | `notes me` |

### Note Management Commands (GraphQL)

| Command | Description | Example |
|---------|-------------|---------|
| `notes create-note <title> <content> [tags...]` | Create note | `notes create-note "My Note" "Content here" work urgent` |
| `notes list-notes` | List all notes | `notes list-notes` |
| `notes list-notes --tag <tag>` | Filter by tag | `notes list-notes --tag work` |
| `notes list-notes --owner <userId>` | Filter by owner | `notes list-notes --owner 507f1f77bcf86cd799439011` |
| `notes get-note <id>` | Get specific note | `notes get-note 507f1f77bcf86cd799439011` |
| `notes update-note <id> [options]` | Update note | `notes update-note 507f... --title "New Title"` |
| `notes delete-note <id>` | Delete note | `notes delete-note 507f1f77bcf86cd799439011` |
| `notes clean-tags` | Clean up invalid tags | `notes clean-tags` |

### Note Management Commands (REST)

| Command | Description | Example |
|---------|-------------|---------|
| `notes create-note-rest <title> <content> [tags...]` | Create via REST | `notes create-note-rest "REST Note" "Content" api demo` |

### Real-time Commands

| Command | Description | Example |
|---------|-------------|---------|
| `notes subscribe` | Listen to real-time events | `notes subscribe` |

---

## 🎬 Complete Workflow Examples

### Example: First Time User - Complete Setup

```bash
# Terminal 1 - Start the server
cd notes-app/server
npm start

# Wait for "Server running" message

# Terminal 2 - Register and create your first note
cd notes-app/client

# Register a new account
notes register alice alice@example.com SecurePass123

# Expected Output:
# ✔ Registered as alice
# Token saved. You're now logged in.

# Check your profile
notes me

# Expected Output:
# 👤 Your Profile:
# ──────────────────────────────────────────────────
# Username: alice
# Email: alice@example.com
# ID: 6912470a461b83deda98ed1f
# Joined: 11/11/2025
# ──────────────────────────────────────────────────

# Create your first note
notes create-note "My First Note" "This is my first note using GraphQL!" personal welcome

# Expected Output:
# ✔ Note created!
# 
# 📝 My First Note
# ID: 6912470a461b83deda98ed20

# View all notes
notes list-notes

# Expected Output:
# 📚 Found 1 note(s):
# 
# ────────────────────────────────────────────────────────────
# 1. My First Note
#    ID: 6912470a461b83deda98ed20
#    This is my first note using GraphQL!
#    🏷️  personal, welcome
#    👤 by alice (alice@example.com)
#    📅 11/11/2025, 2:30:45 PM
# ────────────────────────────────────────────────────────────
```
---

### Example: GraphQL's Nested Query Power

The real power of GraphQL shows when fetching related data:

```bash
# This single command fetches notes WITH owner details in ONE query
notes list-notes

# Behind the scenes, GraphQL executes:
# query {
#   notes {
#     id
#     title
#     content
#     tags
#     owner {           ← Nested query!
#       id
#       username
#       email
#     }
#   }
# }
```

---

## 🏗️ Architecture Overview

### How It All Works Together

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Terminal)                   │
├─────────────────────────────────────────────────────────┤
│  REST API Client    │  GraphQL Client  │  Socket.IO     │
│  (register/login)   │  (CRUD ops)      │  (realtime)    │
└──────────┬──────────┴────────┬─────────┴────────┬───────┘
           │                   │                  │
           │ HTTP POST/GET     │ POST /graphql    │ WebSocket
           │                   │                  │
┌──────────▼───────────────────▼──────────────────▼───────┐
│                    SERVER (Node.js)                     │
├─────────────────────────────────────────────────────────┤
│  Express REST API  │  Apollo GraphQL  │  Socket.IO      │
│  /api/register     │  /graphql        │  io.emit()      │
│  /api/login        │  Resolvers       │  Authentication │
│  /api/notes        │  Type Defs       │  Events         │
├─────────────────────────────────────────────────────────┤
│                    JWT Middleware                       │
│              (Shared across all protocols)              │
├─────────────────────────────────────────────────────────┤
│                   Mongoose Models                       │
│                 User Model | Note Model                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
                   ┌─────────────┐
                   │   MongoDB   │
                   │   Database  │
                   └─────────────┘
```

## 📚 API Reference

### REST Endpoints

```
POST   /api/register          Register new user
POST   /api/login             Login user
POST   /api/notes             Create note
GET    /api/notes             List all notes
GET    /api/notes/:id         Get specific note
PUT    /api/notes/:id         Update note
DELETE /api/notes/:id         Delete note
```

### GraphQL Schema

```graphql
type Query {
  me: User
  notes(tag: String, owner: ID): [Note!]!
  note(id: ID!): Note
}

type Mutation {
  createNote(input: CreateNoteInput!): Note!
  updateNote(id: ID!, input: UpdateNoteInput!): Note!
  deleteNote(id: ID!): Boolean!
}
```

### Socket.IO Events

```javascript
noteAdded     - When any note is created
noteUpdated   - When any note is updated
noteDeleted   - When any note is deleted
```

---

## 🤝 Contributing

Found a bug? Want to add features? Contributions welcome!

## 📄 License

MIT License - feel free to use this for learning and production!

---
