import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Building required images');

execSync(`docker-compose build`, {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
});

import packageJson from '../package.json' assert { type: 'json' };

const { name } = packageJson;

const buildDir = path.join(__dirname, '../build');
const frontendImg = `${name}-app:latest`;
const dbImg = `${name}-db:latest`;

const frontendTarFile = path.join(buildDir, `${name}-app.tar`);
const dbTarFile = path.join(buildDir, `${name}-db.tar`);

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

console.log('Saving docker images');

execSync(`docker save -o "${frontendTarFile}" ${frontendImg}`, {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
});

execSync(`docker save -o "${dbTarFile}" ${dbImg}`, {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..'),
});

console.log('Copying docker-compose file');

fs.copyFileSync(
  path.resolve(__dirname, '..', 'docker-compose.deploy.yml'),
  path.resolve(buildDir, 'docker-compose.yml')
);
