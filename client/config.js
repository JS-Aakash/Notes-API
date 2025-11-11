import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '.notes-config.json');

export const SERVER_URL = 'http://localhost:4000';

export function saveToken(token) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ token }, null, 2));
}

export function getToken() {
  try {
    const data = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(data).token;
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    fs.unlinkSync(CONFIG_PATH);
  } catch {}
}