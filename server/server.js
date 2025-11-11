import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { connectDB, User, Note } from './db.js';
import { typeDefs, resolvers } from './schema.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// JWT verification middleware
const verifyToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// REST API Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = new User({ username, email, password });
    await user.save();
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// REST endpoint for creating notes (demonstrates REST + realtime)
app.post('/api/notes', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const user = verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    
    const { title, content, tags } = req.body;
    const note = new Note({
      title,
      content,
      tags: tags || [],
      owner: user.id
    });
    await note.save();
    await note.populate('owner');
    
    // Emit realtime event
    io.emit('noteAdded', {
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags,
      owner: { id: note.owner.id, username: note.owner.username },
      createdAt: note.createdAt
    });
    
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notes', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const user = verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    
    const notes = await Note.find().populate('owner');
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notes/:id', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const user = verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    
    const note = await Note.findById(req.params.id).populate('owner');
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const user = verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    if (note.owner.toString() !== user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    Object.assign(note, req.body);
    await note.save();
    await note.populate('owner');
    
    io.emit('noteUpdated', {
      id: note.id,
      title: note.title,
      content: note.content,
      tags: note.tags,
      owner: { id: note.owner.id, username: note.owner.username },
      updatedAt: note.updatedAt
    });
    
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const user = verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    if (note.owner.toString() !== user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await note.deleteOne();
    
    io.emit('noteDeleted', { id: req.params.id, deletedBy: user.username });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apollo GraphQL Server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
});

await apolloServer.start();

app.use('/graphql', expressMiddleware(apolloServer, {
  context: async ({ req }) => {
    const token = req.headers.authorization;
    const user = verifyToken(token);
    return { user, io };
  }
}));

// Socket.IO authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const user = verifyToken(token);
  if (user) {
    socket.user = user;
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.user.username}`);
  
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.user.username}`);
  });
});

// Start server
await connectDB(process.env.MONGODB_URI);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  console.log(`🔌 Socket.IO ready for connections`);
  console.log(`📝 REST API available at http://localhost:${PORT}/api`);
});