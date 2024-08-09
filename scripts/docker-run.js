import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import packageJson from '../package.json' assert { type: 'json' };

const { name } = packageJson;

execSync(`docker-compose -p ${name} up --build -d`, {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
});
