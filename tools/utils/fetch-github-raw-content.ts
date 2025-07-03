export function fetchGithubRawContent(repository: string, ref: string, path: string) {
  return fetch(`https://raw.githubusercontent.com/${repository}/${ref}/${path}`);
}
