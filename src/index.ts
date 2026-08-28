export * from './object';
export * from './diff';
export * from './repository';

import { InMemoryRepository } from './repository';

if (require.main === module) {
  const repo = new InMemoryRepository();

  const file1 = repo.putBlob('README.md', '# Hello Git\nThis is pure TypeScript Git.\n');
  const file2 = repo.putBlob('index.js', 'console.log("hello world");\n');

  console.log('Created blob 1:', file1);
  console.log('Created blob 2:', file2);

  const commitId = repo.commit('Vida <vida@example.com>', 'Initial commit');
  console.log('Created commit:', commitId);
  console.log('Current HEAD commit is:', repo.getHeadCommit());

  console.log('\n--- Myers Diff Demonstration ---');
  const oldText = 'line1\nline2\nline3\n';
  const newText = 'line1\nline2 modified\nline3\nline4\n';
  const diffHunks = repo.diffFiles(oldText, newText);
  for (const hunk of diffHunks) {
    const symbol = hunk.type === 'add' ? '+' : hunk.type === 'delete' ? '-' : ' ';
    console.log(`${symbol} ${hunk.line}`);
  }
}
