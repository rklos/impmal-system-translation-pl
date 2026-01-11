import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { Package } from '~/packages';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Root directories
export const ROOT_DIR = join(__dirname, '..', '..');
export const SRC_DIR = join(ROOT_DIR, 'src');
export const PACKAGES_DIR = join(SRC_DIR, 'packages');
export const DIST_DIR = join(ROOT_DIR, 'dist');

// Directory names
export const DIR_PATCHES = 'patches';
export const DIR_SCRIPTS = 'scripts';
export const DIR_TEMPLATES = 'templates';
export const DIR_LANG = 'lang';
export const DIR_TEMP = 'temp';
export const DIR_STATIC = 'static';
export const DIR_PACKAGES = 'packages';
export const DIR_DOWNLOAD = 'download';

// File names
export const FILE_COMMON_TRANSLATIONS = 'common-translations.json';
export const FILE_MODULE_JSON = 'module.json';
export const FILE_SYSTEM_JSON = 'system.json';
export const FILE_LANG_JSON = 'lang.json';
export const FILE_EN_JSON = 'en.json';
export const FILE_PL_JSON = 'pl.json';
export const FILE_PACKAGE_JSON = 'package.json';
export const FILE_PACKAGE_LOCK_JSON = 'package-lock.json';
export const FILE_MAIN_SCSS = 'main.scss';

// File extensions
export const EXT_DIFF = '.diff';
export const EXT_JS = '.js';
export const EXT_HBS = '.hbs';
export const EXT_JSON = '.json';
export const EXT_SCSS = '.scss';

// Path prefixes
export const PATH_STATIC_SCRIPTS = `${DIR_STATIC}/${DIR_SCRIPTS}`;
export const PATH_STATIC_LANG = `${DIR_STATIC}/${DIR_LANG}`;
export const PATH_STATIC = DIR_STATIC;
export const PATH_LANG = DIR_LANG;
export const PATH_SRC_PACKAGES = `src/${DIR_PACKAGES}`;
export const PATH_PACKAGES = DIR_PACKAGES;

// Language codes
export const LANG_EN = 'en';
export const LANG_PL = 'pl';

// Git refs
export const GIT_REFS_TAGS = 'refs/tags';
export const GIT_REF_MASTER = 'master';
export const GIT_REF_MAIN = 'main';

// Repository specific
export const REPO_WFRP4E_CORE_PL = 'foundryvttpl/wfrp4e-core-pl';
export const PACKAGE_WARHAMMER_LIBRARY = 'warhammer-library';

export function getConstsOfPackage(pkg: Package) {
  const PACKAGE_DIR = join(PACKAGES_DIR, pkg.PACKAGE);
  const PATCHES_DIR = join(PACKAGE_DIR, DIR_PATCHES);

  const TEMP_DIR = join(PACKAGE_DIR, DIR_TEMP);
  const TEMP_PATCHES_DIR = join(TEMP_DIR, DIR_PATCHES);
  const TEMP_PATCHES_DOWNLOAD_DIR = join(TEMP_PATCHES_DIR, DIR_DOWNLOAD);
  const TEMP_PATCHES_EN_DIR = join(TEMP_PATCHES_DIR, LANG_EN);
  const TEMP_PATCHES_EN_SCRIPTS_DIR = join(TEMP_PATCHES_EN_DIR, DIR_SCRIPTS);
  const TEMP_PATCHES_EN_TEMPLATES_DIR = join(TEMP_PATCHES_EN_DIR, DIR_TEMPLATES);
  const TEMP_PATCHES_PL_DIR = join(TEMP_PATCHES_DIR, LANG_PL);
  const TEMP_PATCHES_PL_SCRIPTS_DIR = join(TEMP_PATCHES_PL_DIR, DIR_SCRIPTS);
  const TEMP_PATCHES_PL_TEMPLATES_DIR = join(TEMP_PATCHES_PL_DIR, DIR_TEMPLATES);

  const getScriptsDir = (lang: 'en' | 'pl') => (lang === LANG_EN ? TEMP_PATCHES_EN_SCRIPTS_DIR : TEMP_PATCHES_PL_SCRIPTS_DIR);
  const getTemplatesDir = (lang: 'en' | 'pl') => (lang === LANG_EN ? TEMP_PATCHES_EN_TEMPLATES_DIR : TEMP_PATCHES_PL_TEMPLATES_DIR);

  const getTempPatchesDir = (lang: 'en' | 'pl') => (lang === LANG_EN ? TEMP_PATCHES_EN_DIR : TEMP_PATCHES_PL_DIR);

  return {
    PACKAGE_DIR,
    PATCHES_DIR,

    TEMP_DIR,
    TEMP_PATCHES_DIR,
    TEMP_PATCHES_DOWNLOAD_DIR,
    TEMP_PATCHES_EN_DIR,
    TEMP_PATCHES_EN_SCRIPTS_DIR,
    TEMP_PATCHES_EN_TEMPLATES_DIR,
    TEMP_PATCHES_PL_DIR,
    TEMP_PATCHES_PL_SCRIPTS_DIR,
    TEMP_PATCHES_PL_TEMPLATES_DIR,

    getScriptsDir,
    getTemplatesDir,
    getTempPatchesDir,
  };
}
