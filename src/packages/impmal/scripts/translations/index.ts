import { translateConfig } from './config';
import { translateEffects } from './effects';

export function translate() {
  translateConfig();
  translateEffects();
}
