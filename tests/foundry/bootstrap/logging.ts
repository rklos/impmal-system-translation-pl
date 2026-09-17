import chalk from 'chalk';

type FoundryLogStatus = 'error' | 'step' | 'success';

export function logFoundry(
  message: string,
  status: FoundryLogStatus = 'step',
): void {
  const prefix = chalk.bold.cyan('[foundry]');
  const marker = {
    error: chalk.red('✗'),
    step: chalk.blue('●'),
    success: chalk.green('✓'),
  }[status];

  console.info(`${prefix} ${marker} ${message}`);
}
