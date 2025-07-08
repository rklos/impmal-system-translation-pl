export interface Changes {
  tagName: string;
  previousTag: string | null;
  changedFiles: {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    content: string;
  }[];
}
