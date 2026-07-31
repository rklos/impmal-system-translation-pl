import { spawn } from 'node:child_process';

export async function runCommand(
  command: string,
  args: string[],
  {
    env = process.env,
    cwd = process.cwd(),
  }: {
    env?: NodeJS.ProcessEnv;
    cwd?: string;
  } = {},
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(
        `${command} exited with ${signal ? `signal ${signal}` : `code ${code}`}`,
      ));
    });
  });
}
