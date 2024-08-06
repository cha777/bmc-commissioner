import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

execSync(`docker-compose up --build -d`, {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
});
