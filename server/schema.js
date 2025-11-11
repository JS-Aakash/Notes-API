import gql from 'graphql-tag';
import { User, Note } from './db.js';

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    createdAt: String!
  }

  type Note {
    id: ID!
    title: String!
    content: String!
    tags: [String!]!
    owner: User!
    createdAt: String!
    updatedAt: String!
  }

  input CreateNoteInput {
    title: String!
    content: String!
    tags: [String!]
  }

  input UpdateNoteInput {
    title: String
    content: String
    tags: [String!]
  }

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
`;

export const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error('Not authenticated');
      return User.findById(user.id);
    },
    notes: async (_, { tag, owner }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      
      const filter = {};
      if (tag) filter.tags = tag;
      if (owner) filter.owner = owner;
      
      return Note.find(filter).populate('owner');
    },
    note: async (_, { id }, { user }) => {
      if (!user) throw new Error('Not authenticated');
      const note = await Note.findById(id).populate('owner');
      if (!note) throw new Error('Note not found');
      return note;
    }
  },
  Mutation: {
    createNote: async (_, { input }, { user, io }) => {
      if (!user) throw new Error('Not authenticated');
      
      const note = new Note({
        ...input,
        tags: input.tags || [],
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
      
      return note;
    },
    updateNote: async (_, { id, input }, { user, io }) => {
      if (!user) throw new Error('Not authenticated');
      
      const note = await Note.findById(id);
      if (!note) throw new Error('Note not found');
      if (note.owner.toString() !== user.id) {
        throw new Error('Not authorized');
      }
      
      Object.assign(note, input);
      await note.save();
      await note.populate('owner');
      
      // Emit realtime event
      io.emit('noteUpdated', {
        id: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        owner: { id: note.owner.id, username: note.owner.username },
        updatedAt: note.updatedAt
      });
      
      return note;
    },
    deleteNote: async (_, { id }, { user, io }) => {
      if (!user) throw new Error('Not authenticated');
      
      const note = await Note.findById(id);
      if (!note) throw new Error('Note not found');
      if (note.owner.toString() !== user.id) {
        throw new Error('Not authorized');
      }
      
      await note.deleteOne();
      
      // Emit realtime event
      io.emit('noteDeleted', { id, deletedBy: user.username });
      
      return true;
    }
  }
};