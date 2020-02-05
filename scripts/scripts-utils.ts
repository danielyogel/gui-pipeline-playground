import * as fs from 'fs';

//
// Internals
//
export const streamToPromise = (dist: fs.WriteStream) => {
  return new Promise((resolve, reject) => {
    dist.on('finish', resolve);
    dist.on('error', reject);
  });
};
