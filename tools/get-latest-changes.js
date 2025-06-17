import fs from 'fs';
import chalk from 'chalk';

export async function getLatestChanges(repo, version) {
  try {
    // Get latest release from GitHub API
    const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
    const release = await response.json();

    // Get the tag name
    const tagName = release.tag_name;

    // Get module.json or system.json from the latest release
    const moduleResponse = await fetch(`https://raw.githubusercontent.com/${repo}/${tagName}/module.json`);
    let moduleData;
    try {
      moduleData = await moduleResponse.json();
    } catch {
      // If module.json not found, try system.json
      const systemResponse = await fetch(`https://raw.githubusercontent.com/${repo}/${tagName}/system.json`);
      moduleData = await systemResponse.json();
    }

    // Get the module ID
    const moduleId = moduleData.id;

    // Read local module.json
    const localModuleJson = JSON.parse(fs.readFileSync('src/module.json', 'utf8'));

    // Find the module in relationships
    const relationship = localModuleJson.relationships.systems?.find((s) => s.id === moduleId)
                        || localModuleJson.relationships.requires?.find((r) => r.id === moduleId);

    if (!version && relationship) {
      version = relationship.compatibility.verified;
    }

    if (!version) {
      console.log(chalk.yellow('No compatibility version found - no Git changes to report'));
      return {
        tagName,
        previousTag: null,
        changedFiles: [],
      };
    }

    // Use the version as previousTag
    const previousTag = version;

    // Check if versions are the same
    if (previousTag === tagName) {
      console.log(chalk.green(`\nNo new releases found. Current verified version ${tagName} is up to date.`));
      return {
        tagName,
        previousTag,
        changedFiles: [],
      };
    }

    // Get list of changed files between releases
    const compareResponse = await fetch(
      `https://api.github.com/repos/${repo}/compare/${previousTag}...${tagName}`,
    );
    const compareData = await compareResponse.json();

    console.log(chalk.blue(`\nNew release found! ${previousTag} -> ${tagName}`));
    return {
      tagName,
      previousTag,
      changedFiles: await Promise.all(compareData.files.map(async (f) => {
        const content = await fetch(f.raw_url);
        return {
          filename: f.filename,
          status: f.status,
          additions: f.additions,
          deletions: f.deletions,
          content: await content.text(),
        };
      })),
    };
  } catch (error) {
    console.error(chalk.red('Error fetching latest changes:'), error);
    throw error;
  }
}
