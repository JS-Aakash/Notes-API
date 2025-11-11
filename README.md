# 📝 Terminal Notes App - Complete Guide

A production-ready, multi-user Notes application built for the terminal that demonstrates **GraphQL**, **REST API**, and **Socket.IO** working together seamlessly.

## 🎯 What Makes This Special

This isn't just another CRUD app. It demonstrates:

- **GraphQL's Power**: Nested queries, input types, real-time filtering
- **REST API**: Traditional HTTP endpoints for comparison
- **Socket.IO**: Real-time multi-user synchronization
- **Unified Architecture**: Both GraphQL and REST trigger the same real-time events
- **JWT Authentication**: Single token works across all three protocols
- **Terminal-First**: No browser required - pure CLI experience

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Starting the Server](#starting-the-server)
5. [CLI Commands Reference](#cli-commands-reference)
6. [Complete Workflow Examples](#complete-workflow-examples)
7. [Advanced Examples](#advanced-examples)
8. [Architecture Overview](#architecture-overview)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before you begin, ensure you have:

- **Node.js** 16.x or higher (`node --version`)
- **npm** 7.x or higher (`npm --version`)
- **MongoDB** 4.4 or higher (running locally or remote connection)

### Installing MongoDB (if needed)

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Windows:**
Download installer from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

---

## 📥 Installation

### Step 1: Project Setup

```bash
# Create project structure
mkdir notes-app
cd notes-app
mkdir server client

# Clone or create the files from the artifact
```

### Step 2: Server Installation

```bash
cd server
npm install

# Verify installation
npm list --depth=0
```

**Expected output:**
```
notes-server@1.0.0
├── @apollo/server@4.9.5
├── bcryptjs@2.4.3
├── body-parser@1.20.2
├── cors@2.8.5
├── dotenv@16.3.1
├── express@4.18.2
├── graphql@16.8.1
├── graphql-tag@2.12.6
├── jsonwebtoken@9.0.2
├── mongoose@8.0.0
└── socket.io@4.7.2
```

### Step 3: Client Installation

```bash
cd ../client
npm install

# Make the CLI globally available
npm link

# Verify installation
notes --version
```

**Expected output:**
```
1.0.0
```

---

## ⚙️ Configuration

### Server Configuration

Create `server/.env`:

```bash
PORT=4000
MONGODB_URI=mongodb://localhost:27017/notes-app
JWT_SECRET=super-secret-key-change-in-production-minimum-32-characters
NODE_ENV=development
```

**Important Notes:**
- Change `JWT_SECRET` in production! Use a secure random string
- For MongoDB Atlas: `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/notes-app`
- For custom port: Change `PORT=4000` to your preferred port

### Verify MongoDB Connection

```bash
# Test MongoDB is running
mongo --eval "db.version()"

# Or with mongosh (newer versions)
mongosh --eval "db.version()"
```

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

### Example 1: First Time User - Complete Setup

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

### Example 2: Creating Multiple Notes with Different Tags

```bash
# Create a work note
notes create-note "Project Meeting Notes" "Discussed Q4 roadmap and deliverables" work meeting urgent

# Create a personal note
notes create-note "Grocery List" "Milk, eggs, bread, coffee" personal shopping

# Create a learning note
notes create-note "GraphQL Tips" "Always use input types for mutations" tech graphql learning

# Create a note using REST API (shows REST + GraphQL equivalence)
notes create-note-rest "REST API Note" "Created via REST endpoint" api rest demo

# List all notes
notes list-notes

# Expected Output:
# 📚 Found 4 note(s):
# 
# ────────────────────────────────────────────────────────────
# 1. Project Meeting Notes
#    ID: 6912470a461b83deda98ed21
#    Discussed Q4 roadmap and deliverables
#    🏷️  work, meeting, urgent
#    👤 by alice (alice@example.com)
#    📅 11/11/2025, 2:35:12 PM
# ────────────────────────────────────────────────────────────
# 2. Grocery List
#    ID: 6912470a461b83deda98ed22
#    Milk, eggs, bread, coffee
#    🏷️  personal, shopping
#    👤 by alice (alice@example.com)
#    📅 11/11/2025, 2:35:45 PM
# ────────────────────────────────────────────────────────────
# 3. GraphQL Tips
#    ID: 6912470a461b83deda98ed23
#    Always use input types for mutations
#    🏷️  tech, graphql, learning
#    👤 by alice (alice@example.com)
#    📅 11/11/2025, 2:36:20 PM
# ────────────────────────────────────────────────────────────
# 4. REST API Note
#    ID: 6912470a461b83deda98ed24
#    Created via REST endpoint
#    🏷️  api, rest, demo
#    👤 by alice (alice@example.com)
#    📅 11/11/2025, 2:36:55 PM
# ────────────────────────────────────────────────────────────
```

### Example 3: Filtering Notes by Tag

```bash
# Show only work-related notes
notes list-notes --tag work

# Expected Output:
# 📚 Found 1 note(s):
# 
# ────────────────────────────────────────────────────────────
# 1. Project Meeting Notes
#    ID: 6912470a461b83deda98ed21
#    Discussed Q4 roadmap and deliverables
#    🏷️  work, meeting, urgent
#    👤 by alice (alice@example.com)
#    📅 11/11/2025, 2:35:12 PM
# ────────────────────────────────────────────────────────────

# Show only personal notes
notes list-notes --tag personal

# Show only GraphQL-related notes
notes list-notes --tag graphql
```

### Example 4: Viewing and Updating a Specific Note

```bash
# Get a specific note (use actual ID from list-notes)
notes get-note 6912470a461b83deda98ed21

# Expected Output:
# 📝 Project Meeting Notes
# ────────────────────────────────────────────────────────────
# Discussed Q4 roadmap and deliverables
# ────────────────────────────────────────────────────────────
# 🏷️  Tags: work, meeting, urgent
# 👤 Owner: alice (alice@example.com)
# 📅 Created: 11/11/2025, 2:35:12 PM
# 🔄 Updated: 11/11/2025, 2:35:12 PM
# 🆔 ID: 6912470a461b83deda98ed21

# Update the note title
notes update-note 6912470a461b83deda98ed21 --title "Q4 Project Meeting Notes"

# Expected Output:
# ✔ Note updated!
# 
# 📝 Q4 Project Meeting Notes
# Updated: 11/11/2025, 2:40:30 PM

# Update content
notes update-note 6912470a461b83deda98ed21 -c "Discussed Q4 roadmap, deliverables, and team assignments"

# Update tags
notes update-note 6912470a461b83deda98ed21 --tags work meeting urgent q4

# Update multiple fields at once
notes update-note 6912470a461b83deda98ed21 --title "Final Q4 Meeting" -c "Complete notes" --tags work done
```

### Example 5: Real-time Collaboration (Multi-Terminal)

This is where the magic happens! 🎩✨

**Terminal 1 - Alice subscribes to real-time events:**
```bash
notes login alice pass123
notes subscribe

# Expected Output:
# 🔌 Connecting to realtime events...
# Press Ctrl+C to stop
# 
# ✓ Connected! Listening for events...
```

**Terminal 2 - Bob creates and modifies notes:**
```bash
# Register Bob
notes register bob bob@example.com BobPass456

# Bob creates a note (Alice will see this in real-time!)
notes create-note "Team Update" "New feature deployed successfully" team deployment

# Alice's Terminal 1 will instantly show:
# 🆕 NEW NOTE
#    Team Update
#    by bob
#    team, deployment

# Bob updates the note
notes update-note <note-id> --title "Team Update - Success!"

# Alice's Terminal 1 will show:
# ✏️  UPDATED NOTE
#    Team Update - Success!
#    by bob

# Bob deletes a note
notes delete-note <note-id>

# Alice's Terminal 1 will show:
# 🗑️  DELETED NOTE
#    ID: 6912470a461b83deda98ed25
#    by bob
```

**Terminal 3 - Charlie also subscribes:**
```bash
notes register charlie charlie@example.com CharliePass789
notes subscribe

# Now both Alice and Charlie see all changes in real-time!
```

### Example 6: Deleting Notes

```bash
# List notes to get ID
notes list-notes

# Delete a specific note
notes delete-note 6912470a461b83deda98ed22

# Expected Output:
# ✔ Note deleted!

# Try to get the deleted note (will fail)
notes get-note 6912470a461b83deda98ed22

# Expected Output:
# ✖ Note not found
```

### Example 7: Session Management

```bash
# Check who's logged in
notes me

# Logout
notes logout

# Expected Output:
# ✓ Logged out successfully

# Try to list notes (will fail - not authenticated)
notes list-notes

# Expected Output:
# ✖ Not authenticated

# Login again
notes login alice pass123

# Now it works
notes list-notes
```

---

## 🔥 Advanced Examples

### Example 8: GraphQL's Nested Query Power

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

# Compare this to REST where you'd need:
# 1. GET /api/notes (get all notes)
# 2. For each note, GET /api/users/:id (get owner details)
# GraphQL does it in ONE request!
```

### Example 9: Testing GraphQL vs REST Performance

```bash
# Create 10 notes via GraphQL
for i in {1..10}; do
  notes create-note "GraphQL Note $i" "Content $i" test batch$i
done

# Create 10 notes via REST
for i in {11..20}; do
  notes create-note-rest "REST Note $i" "Content $i" test batch$i
done

# Both show up in real-time for subscribers!
# Both are queryable via GraphQL
notes list-notes --tag test
```

### Example 10: Multi-User Scenario

```bash
# Terminal 1 - Alice
notes register alice alice@example.com pass123
notes create-note "Alice's Note" "Private thoughts" personal

# Terminal 2 - Bob
notes register bob bob@example.com pass456
notes create-note "Bob's Note" "Work stuff" work

# Terminal 3 - Alice subscribes
notes login alice pass123
notes subscribe

# Terminal 4 - Bob subscribes
notes login bob pass456
notes subscribe

# Terminal 5 - Charlie creates notes
notes register charlie charlie@example.com pass789
notes create-note "Public Announcement" "Everyone can see this!" public

# BOTH Alice and Bob see Charlie's note appear in real-time!
```

### Example 11: Filtering by Owner

First, get user IDs:

```bash
# Alice gets her ID
notes me
# Note the ID: 6912470a461b83deda98ed1f

# Bob gets his ID
notes me
# Note the ID: 6912470a461b83deda98ed2a

# Alice can see only Bob's notes
notes list-notes --owner 6912470a461b83deda98ed2a

# Or see her own notes
notes list-notes --owner 6912470a461b83deda98ed1f
```

---

## 🏗️ Architecture Overview

### How It All Works Together

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Terminal)                    │
├─────────────────────────────────────────────────────────┤
│  REST API Client    │  GraphQL Client  │  Socket.IO     │
│  (register/login)   │  (CRUD ops)      │  (realtime)    │
└──────────┬──────────┴────────┬─────────┴────────┬───────┘
           │                   │                  │
           │ HTTP POST/GET     │ POST /graphql    │ WebSocket
           │                   │                  │
┌──────────▼───────────────────▼──────────────────▼───────┐
│                    SERVER (Node.js)                      │
├──────────────────────────────────────────────────────────┤
│  Express REST API  │  Apollo GraphQL  │  Socket.IO      │
│  /api/register     │  /graphql        │  io.emit()      │
│  /api/login        │  Resolvers       │  Authentication │
│  /api/notes        │  Type Defs       │  Events         │
├──────────────────────────────────────────────────────────┤
│                    JWT Middleware                        │
│              (Shared across all protocols)               │
├──────────────────────────────────────────────────────────┤
│                   Mongoose Models                        │
│                 User Model | Note Model                  │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
                   ┌─────────────┐
                   │   MongoDB   │
                   │   Database  │
                   └─────────────┘
```

### Request Flow Examples

**Creating a Note via GraphQL:**
1. CLI sends JWT + GraphQL mutation to `/graphql`
2. Apollo extracts JWT, verifies, adds user to context
3. Resolver creates note in MongoDB
4. Resolver emits Socket.IO `noteAdded` event
5. All subscribed clients receive event in real-time
6. CLI displays success message

**Creating a Note via REST:**
1. CLI sends JWT + JSON to `/api/notes`
2. Express middleware verifies JWT
3. Route handler creates note in MongoDB
4. Route handler emits Socket.IO `noteAdded` event
5. All subscribed clients receive event (same as GraphQL!)
6. CLI displays success message

**Key Insight:** Both GraphQL and REST trigger the SAME real-time events!

---

## 🔍 Troubleshooting

### Problem: Notes showing "🏷️ true" as tags

**Solution:**
```bash
# This happened from the old command syntax bug
# Clean up all your notes with invalid tags
notes clean-tags

# Expected Output:
# ✔ Cleaned 2 note(s) with invalid tags
# Run "notes list-notes" to see the results

# Verify they're fixed
notes list-notes
```

### Problem: Filter not working - shows all notes instead of filtered

**Solution:**
```bash
# Make sure you're using the correct syntax with --tag
notes list-notes --tag personal

# NOT: notes list-notes -t personal (old broken syntax)

# If you have no notes with that tag:
# 📭 No notes found

# Create a note with the tag first
notes create-note "Test" "Content" personal
notes list-notes --tag personal
```

### Problem: "MongoDB connection error"

**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list | grep mongodb  # macOS

# Start MongoDB if not running
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### Problem: "Not authenticated"

**Solution:**
```bash
# Check if you're logged in
notes me

# If not, login
notes login yourusername yourpassword

# Token is stored in: client/.notes-config.json
```

### Problem: "Command not found: notes"

**Solution:**
```bash
cd client
npm link

# Or run directly with
node cli.js register alice alice@example.com pass123
```

### Problem: "Invalid Date" showing in output

**Solution:** This is now fixed! Dates from MongoDB are timestamps that need `parseInt()`. The updated code handles this correctly.

### Problem: "Cannot connect to server"

**Solution:**
```bash
# Check server is running
curl http://localhost:4000/api/notes
# Should return: {"error":"Not authenticated"}

# Check correct port in .env
cat server/.env | grep PORT

# Server logs show startup messages
cd server && npm start
```

### Problem: Socket.IO not receiving events

**Solution:**
```bash
# Make sure you're authenticated
notes me

# Check server logs for "User connected"
# Try subscribing again
notes subscribe
```

### Problem: "User already exists"

**Solution:**
```bash
# Use a different username or email
notes register alice2 alice2@example.com pass123

# Or login with existing account
notes login alice pass123
```

---

## 🎓 Learning Exercises

Try these to master the system:

1. **Exercise 1: GraphQL vs REST**
   - Create 5 notes via GraphQL
   - Create 5 notes via REST
   - Notice both trigger the same real-time events!

2. **Exercise 2: Nested Queries**
   - Run `notes list-notes`
   - Observe how owner data is fetched in one query
   - This is GraphQL's superpower!

3. **Exercise 3: Real-time Sync**
   - Open 3 terminals, all subscribed
   - Create/update/delete notes from a 4th terminal
   - Watch all 3 terminals update instantly

4. **Exercise 4: Filtering**
   - Create notes with various tags
   - Practice filtering: `--tag work`, `--tag personal`
   - Try filtering by owner ID

5. **Exercise 5: Multi-User**
   - Register 3 different users
   - Each creates notes
   - Practice viewing others' notes
   - Delete only your own notes

---

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
// Events emitted by server:
noteAdded     - When any note is created
noteUpdated   - When any note is updated
noteDeleted   - When any note is deleted
```

---

## 🎉 Success Checklist

✅ MongoDB installed and running  
✅ Server dependencies installed  
✅ Client dependencies installed  
✅ `.env` file configured  
✅ Server starts without errors  
✅ Can register a user  
✅ Can login  
✅ Can create notes  
✅ Can list notes  
✅ Can subscribe to real-time events  
✅ Real-time events appear when creating notes  

---

## 🤝 Contributing

Found a bug? Want to add features? Contributions welcome!

## 📄 License

MIT License - feel free to use this for learning and production!

---

**Built with ❤️ to demonstrate GraphQL, REST, and Socket.IO working in harmony**