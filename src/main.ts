import { impmalLog } from './utils/log';
import * as packages from './packages';
import './main.scss';

Hooks.on('init', async () => {
  // Without waiting at the beginning because we need to be faster than the system's init
  Object.values(packages).forEach((pkg) => {
    pkg.init();
    impmalLog(`${pkg.PACKAGE} package initialized`);
  });

  // If something needs to wait, we can do it here
  // await wait(250);
});
