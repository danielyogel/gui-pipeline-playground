import { left } from 'fp-ts/es6/Either';
import { Errors as IoTsErrors } from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';

interface Params {
  filename: string;
  dirname: string;
}

export function InitLogger({ filename, dirname }: Params) {
  return {
    group(groupName: string) {
      console.group(groupName);
    },
    groupEnd() {
      console.groupEnd();
    },
    success(message: string) {
      console.log('%c ˝' + message, 'color: green; font-weight: bold;');
    },
    error(message: string, innerError: Error) {
      console.group(`GUI Error`);
      console.error(message);
      console.error(innerError);
      console.groupEnd();
    },
    validationError(message: string, err: IoTsErrors) {
      console.group(`validationError`);
      console.log(`%c FILE: ${filename}`, 'color: Aqua; font-weight: bold;');
      console.log(`%c DIR: ${dirname}`, 'color: Aqua; font-weight: bold;');
      console.log('%c ˝MESSAGE: ' + message, 'color: Aqua; font-weight: bold;');
      console.log(PathReporter.report(left(err)));
      console.groupEnd();
      return undefined;
    }
  };
}
