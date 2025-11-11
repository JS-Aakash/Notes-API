#!/usr/bin/env node

import { Command } from 'commander';
import axios from 'axios';
import { io } from 'socket.io-client';
import chalk from 'chalk';
import ora from 'ora';
import { SERVER_URL, saveToken, getToken, clearToken } from './config.js';

const program = new Command();

const api = axios.create({
  baseURL: SERVER_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// GraphQL helper
async function graphql(query, variables = {}) {
  try {
    const response = await api.post('/graphql', { query, variables });
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data;
  } catch (error) {
    throw error.response?.data?.errors?.[0] || error;
  }
}

program
  .name('notes')
  .description('Terminal-first Notes App with GraphQL, REST & Socket.IO')
  .version('1.0.0');

program
  .command('register')
  .description('Register a new user')
  .argument('', 'Username')
  .argument('', 'Email')
  .argument('', 'Password')
  .action(async (username, email, password) => {
    const spinner = ora('Registering...').start();
    try {
      const { data } = await api.post('/api/register', { username, email, password });
      saveToken(data.token);
      spinner.succeed(chalk.green(`✓ Registered as ${chalk.bold(data.user.username)}`));
      console.log(chalk.gray(`Token saved. You're now logged in.`));
    } catch (error) {
      spinner.fail(chalk.red(error.response?.data?.error || error.message));
    }
  });

program
  .command('login')
  .description('Login to your account')
  .argument('', 'Username')
  .argument('', 'Password')
  .action(async (username, password) => {
    const spinner = ora('Logging in...').start();
    try {
      const { data } = await api.post('/api/login', { username, password });
      saveToken(data.token);
      spinner.succeed(chalk.green(`✓ Logged in as ${chalk.bold(data.user.username)}`));
    } catch (error) {
      spinner.fail(chalk.red(error.response?.data?.error || error.message));
    }
  });

program
  .command('logout')
  .description('Logout from your account')
  .action(() => {
    clearToken();
    console.log(chalk.green('✓ Logged out successfully'));
  });

program
  .command('me')
  .description('Show current user info (GraphQL)')
  .action(async () => {
    const spinner = ora('Fetching user info...').start();
    try {
      const data = await graphql(`
        query {
          me {
            id
            username
            email
            createdAt
          }
        }
      `);
      spinner.stop();
      console.log(chalk.cyan.bold('\n👤 Your Profile:'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(`${chalk.bold('Username:')} ${data.me.username}`);
      console.log(`${chalk.bold('Email:')} ${data.me.email}`);
      console.log(`${chalk.bold('ID:')} ${data.me.id}`);
      console.log(`${chalk.bold('Joined:')} ${new Date(data.me.createdAt).toLocaleDateString()}`);
      console.log(chalk.gray('─'.repeat(50)));
    } catch (error) {
      spinner.fail(chalk.red(error.message));
    }
  });

program
  .command('create-note')
  .description('Create a new note (GraphQL)')
  .argument('', 'Note title')
  .argument('', 'Note content')
  .argument('[tags...]', 'Tags for the note (optional)')
  .action(async (title, content, tags) => {
    const spinner = ora('Creating note...').start();
    try {
      const data = await graphql(`
        mutation CreateNote($input: CreateNoteInput!) {
          createNote(input: $input) {
            id
            title
            content
            tags
            createdAt
            owner {
              username
            }
          }
        }
      `, {
        input: { title, content, tags: tags || [] }
      });
      spinner.succeed(chalk.green('✓ Note created!'));
      console.log(chalk.cyan(`\n📝 ${chalk.bold(data.createNote.title)}`));
      console.log(chalk.gray(`ID: ${data.createNote.id}`));
      if (data.createNote.tags.length > 0) {
        console.log(chalk.gray(`Tags: ${data.createNote.tags.join(', ')}`));
      }
    } catch (error) {
      spinner.fail(chalk.red(error.message));
    }
  });

program
  .command('create-note-rest')
  .description('Create a new note (REST)')
  .argument('', 'Note title')
  .argument('', 'Note content')
  .argument('[tags...]', 'Tags for the note (optional)')
  .action(async (title, content, tags) => {
    const spinner = ora('Creating note via REST...').start();
    try {
      const { data } = await api.post('/api/notes', {
        title,
        content,
        tags: tags || []
      });
      spinner.succeed(chalk.green('✓ Note created via REST!'));
      console.log(chalk.cyan(`\n📝 ${chalk.bold(data.title)}`));
      console.log(chalk.gray(`ID: ${data.id}`));
    } catch (error) {
      spinner.fail(chalk.red(error.response?.data?.error || error.message));
    }
  });

program
  .command('list-notes')
  .description('List all notes (GraphQL)')
  .option('--tag ', 'Filter by tag')
  .option('--owner ', 'Filter by owner ID')
  .action(async (options) => {
    const spinner = ora('Fetching notes...').start();
    try {
      const data = await graphql(`
        query GetNotes($tag: String, $owner: ID) {
          notes(tag: $tag, owner: $owner) {
            id
            title
            content
            tags
            createdAt
            owner {
              id
              username
              email
            }
          }
        }
      `, { tag: options.tag, owner: options.owner });
      
      spinner.stop();
      
      if (data.notes.length === 0) {
        console.log(chalk.yellow('\n📭 No notes found'));
        return;
      }
      
      console.log(chalk.cyan.bold(`\n📚 Found ${data.notes.length} note(s):\n`));
      data.notes.forEach((note, i) => {
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.cyan.bold(`${i + 1}. ${note.title}`));
        console.log(chalk.gray(`   ID: ${note.id}`));
        console.log(chalk.white(`   ${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}`));
        if (note.tags.length > 0) {
          console.log(chalk.magenta(`   🏷️  ${note.tags.join(', ')}`));
        }
        console.log(chalk.gray(`   👤 by ${note.owner.username} (${note.owner.email})`));
        console.log(chalk.gray(`   📅 ${new Date(parseInt(note.createdAt)).toLocaleString()}`));
      });
      console.log(chalk.gray('─'.repeat(60)));
    } catch (error) {
      spinner.fail(chalk.red(error.message));
    }
  });

program
  .command('get-note')
  .description('Get a specific note by ID (GraphQL)')
  .argument('', 'Note ID')
  .action(async (id) => {
    const spinner = ora('Fetching note...').start();
    try {
      const data = await graphql(`
        query GetNote($id: ID!) {
          note(id: $id) {
            id
            title
            content
            tags
            createdAt
            updatedAt
            owner {
              id
              username
              email
            }
          }
        }
      `, { id });
      
      spinner.stop();
      const note = data.note;
      console.log(chalk.cyan.bold(`\n📝 ${note.title}`));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.white(note.content));
      console.log(chalk.gray('─'.repeat(60)));
      if (note.tags.length > 0) {
        console.log(chalk.magenta(`🏷️  Tags: ${note.tags.join(', ')}`));
      }
      console.log(chalk.gray(`👤 Owner: ${note.owner.username} (${note.owner.email})`));
      console.log(chalk.gray(`📅 Created: ${new Date(parseInt(note.createdAt)).toLocaleString()}`));
      console.log(chalk.gray(`🔄 Updated: ${new Date(parseInt(note.updatedAt)).toLocaleString()}`));
      console.log(chalk.gray(`🆔 ID: ${note.id}`));
    } catch (error) {
      spinner.fail(chalk.red(error.message));
    }
  });

program
  .command('update-note')
  .description('Update a note (GraphQL)')
  .argument('', 'Note ID')
  .option('-t, --title ', 'New title')
  .option('-c, --content ', 'New content')
  .option('--tags ', 'New tags')
  .action(async (id, options) => {
    const spinner = ora('Updating note...').start();
    try {
      const input = {};
      if (options.title) input.title = options.title;
      if (options.content) input.content = options.content;
      if (options.tags) input.tags = options.tags;
      
      const data = await graphql(`
        mutation UpdateNote($id: ID!, $input: UpdateNoteInput!) {
          updateNote(id: $id, input: $input) {
            id
            title
            content
            tags
            updatedAt
          }
        }
      `, { id, input });
      
      spinner.succeed(chalk.green('✓ Note updated!'));
      console.log(chalk.cyan(`\n📝 ${chalk.bold(data.updateNote.title)}`));
      console.log(chalk.gray(`Updated: ${new Date(data.updateNote.updatedAt).toLocaleString()}`));
    } catch (error) {
      spinner.fail(chalk.red(error.message));
    }
  });

program
  .command('delete-note')
  .description('Delete a note (GraphQL)')
  .argument('', 'Note ID')
  .action(async (id) => {
    const spinner = ora('Deleting note...').start();
    try {
      await graphql(`
        mutation DeleteNote($id: ID!) {
          deleteNote(id: $id)
        }
      `, { id });
      
      spinner.succeed(chalk.green('✓ Note deleted!'));
    } catch (error) {
      spinner.fail(chalk.red(error.message));
    }
  });

program
  .command('subscribe')
  .description('Subscribe to realtime note events (Socket.IO)')
  .action(async () => {
    const token = getToken();
    if (!token) {
      console.log(chalk.red('❌ Not authenticated. Please login first.'));
      return;
    }
    
    console.log(chalk.cyan.bold('\n🔌 Connecting to realtime events...'));
    console.log(chalk.gray('Press Ctrl+C to stop\n'));
    
    const socket = io(SERVER_URL, {
      auth: { token }
    });
    
    socket.on('connect', () => {
      console.log(chalk.green('✓ Connected! Listening for events...\n'));
    });
    
    socket.on('noteAdded', (note) => {
      console.log(chalk.green.bold('🆕 NEW NOTE'));
      console.log(chalk.cyan(`   ${note.title}`));
      console.log(chalk.gray(`   by ${note.owner.username}`));
      console.log(chalk.gray(`   ${note.tags.join(', ')}`));
      console.log();
    });
    
    socket.on('noteUpdated', (note) => {
      console.log(chalk.yellow.bold('✏️  UPDATED NOTE'));
      console.log(chalk.cyan(`   ${note.title}`));
      console.log(chalk.gray(`   by ${note.owner.username}`));
      console.log();
    });
    
    socket.on('noteDeleted', (data) => {
      console.log(chalk.red.bold('🗑️  DELETED NOTE'));
      console.log(chalk.gray(`   ID: ${data.id}`));
      console.log(chalk.gray(`   by ${data.deletedBy}`));
      console.log();
    });
    
    socket.on('connect_error', (error) => {
      console.log(chalk.red(`❌ Connection error: ${error.message}`));
      process.exit(1);
    });
    
    socket.on('disconnect', () => {
      console.log(chalk.yellow('\n⚠️  Disconnected from server'));
      process.exit(0);
    });
  });

program.parse();