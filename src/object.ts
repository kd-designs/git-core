import * as crypto from 'crypto';

export type GitObjectType = 'blob' | 'tree' | 'commit' | 'tag';

export interface TreeEntry {
  mode: string;
  name: string;
  hash: string;
}

export class GitObject {
  static hashBlob(content: Buffer | string): { hash: string; serialized: Buffer } {
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf-8');
    const header = Buffer.from(`blob ${data.length}\0`);
    const serialized = Buffer.concat([header, data]);
    const hash = crypto.createHash('sha1').update(serialized).digest('hex');
    return { hash, serialized };
  }

  static serializeTree(entries: TreeEntry[]): { hash: string; serialized: Buffer } {
    // Entries must be sorted by name
    const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
    const parts: Buffer[] = [];

    for (const entry of sorted) {
      const modeAndName = Buffer.from(`${entry.mode} ${entry.name}\0`);
      const hashBytes = Buffer.from(entry.hash, 'hex');
      parts.push(Buffer.concat([modeAndName, hashBytes]));
    }

    const body = Buffer.concat(parts);
    const header = Buffer.from(`tree ${body.length}\0`);
    const serialized = Buffer.concat([header, body]);
    const hash = crypto.createHash('sha1').update(serialized).digest('hex');
    return { hash, serialized };
  }

  static serializeCommit(
    treeHash: string,
    parentHashes: string[],
    author: string,
    message: string
  ): { hash: string; serialized: Buffer } {
    const timestamp = Math.floor(Date.now() / 1000);
    const timezone = '+0000';

    let body = `tree ${treeHash}\n`;
    for (const parent of parentHashes) {
      body += `parent ${parent}\n`;
    }
    body += `author ${author} ${timestamp} ${timezone}\n`;
    body += `committer ${author} ${timestamp} ${timezone}\n\n`;
    body += `${message.trim()}\n`;

    const bodyBuf = Buffer.from(body, 'utf-8');
    const header = Buffer.from(`commit ${bodyBuf.length}\0`);
    const serialized = Buffer.concat([header, bodyBuf]);
    const hash = crypto.createHash('sha1').update(serialized).digest('hex');
    return { hash, serialized };
  }
}
