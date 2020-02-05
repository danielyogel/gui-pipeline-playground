import got from 'got';
import * as fs from 'fs';
import * as stream from 'stream';
import * as path from 'path';
import { promisify } from 'util';
import * as AdmZip from 'adm-zip';
import * as chalk from 'chalk';
import { streamToPromise } from './scripts-utils';
const pipeline = promisify(stream.pipeline);

const SWAGGER_URL = 'http://localhost:8080/dev/api/typescript-axios';
const ZIP_FILE_PATH = path.join(__dirname, 'zip.zip');
const API_FILE_PATH = path.join(__dirname, '../', 'src/clientApi/api.ts');

(async () => {
  try {
    console.log(chalk.magentaBright.bold('Swagger Client Init'));
    await pipeline(got.stream(SWAGGER_URL), fs.createWriteStream(ZIP_FILE_PATH));
    const entries = new AdmZip(ZIP_FILE_PATH).getEntries();
    const entry = entries.find(entry => entry.entryName === 'api.ts');
    if (!entry) throw new Error('api.ts is missing!');
    const dist = fs.createWriteStream(API_FILE_PATH);
    dist.write('/* eslint-disable */ \n', 'utf8');
    dist.write(entry.getData().toString('utf8'));
    dist.end();
    await Promise.all([streamToPromise(dist), promisify(fs.unlink)(ZIP_FILE_PATH)]);
    console.log(chalk.magentaBright.greenBright('Swagger Client Success'));
  } catch (e) {
    console.log(chalk.red('Swagger Client Failure'));
    console.error(e);
  }
})();
