import { GitObject, TreeEntry } from './object';
import { MyersDiff, DiffHunk } from './diff';

export class InMemoryRepository {
  private objects: Map<string, Buffer> = new Map();
  private refs: Map<string, string> = new Map();
  private index: Map<string, string> = new Map(); // path -> blobHash

  constructor() {
    this.refs.set('HEAD', 'ref: refs/heads/main');
  }

  putBlob(filePath: string, content: string): string {
    const { hash, serialized } = GitObject.hashBlob(content);
    this.objects.set(hash, serialized);
    this.index.set(filePath, hash);
    return hash;
  }

  commit(author: string, message: string): string {
    const treeEntries: TreeEntry[] = [];
    for (const [name, hash] of this.index.entries()) {
      treeEntries.push({
        mode: '100644',
        name,
        hash,
      });
    }

    const { hash: treeHash, serialized: treeData } = GitObject.serializeTree(treeEntries);
    this.objects.set(treeHash, treeData);

    const currentHeadRef = this.refs.get('HEAD')!;
    const branchKey = currentHeadRef.replace('ref: ', '');
    const parentHash = this.refs.get(branchKey);

    const parents = parentHash ? [parentHash] : [];
    const { hash: commitHash, serialized: commitData } = GitObject.serializeCommit(
      treeHash,
      parents,
      author,
      message
    );
    this.objects.set(commitHash, commitData);
    this.refs.set(branchKey, commitHash);

    return commitHash;
  }

  getHeadCommit(): string | undefined {
    const headRef = this.refs.get('HEAD')!;
    const branchKey = headRef.replace('ref: ', '');
    return this.refs.get(branchKey);
  }

  diffFiles(textA: string, textB: string): DiffHunk[] {
    return MyersDiff.diff(textA, textB);
  }
}
