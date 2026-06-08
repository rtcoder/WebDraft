import {Buffer} from 'node:buffer';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';

export async function importTypescriptModule(path) {
  const url = new URL(path, import.meta.url);
  const source = await readFile(url, 'utf8');
  const {outputText} = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      strict: true,
    },
    fileName: url.pathname,
  });
  const encoded = Buffer.from(outputText).toString('base64');

  return import(`data:text/javascript;base64,${encoded}`);
}

export function test(name, run) {
  try {
    run();
  } catch (error) {
    error.message = `${name}: ${error.message}`;
    throw error;
  }
}
