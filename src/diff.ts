export interface DiffHunk {
  type: 'add' | 'delete' | 'common';
  line: string;
}

export class MyersDiff {
  static diff(textA: string, textB: string): DiffHunk[] {
    const a = textA.split('\n');
    const b = textB.split('\n');
    const n = a.length;
    const m = b.length;
    const max = n + m;
    const v: number[] = new Array(2 * max + 1);
    v[1 + max] = 0;

    const trace: { [k: number]: number }[] = [];

    for (let d = 0; d <= max; d++) {
      const vCopy: { [k: number]: number } = {};
      for (let k = -d; k <= d; k += 2) {
        let x: number;
        if (k === -d || (k !== d && v[k - 1 + max] < v[k + 1 + max])) {
          x = v[k + 1 + max];
        } else {
          x = v[k - 1 + max] + 1;
        }

        let y = x - k;
        while (x < n && y < m && a[x] === b[y]) {
          x++;
          y++;
        }

        v[k + max] = x;
        vCopy[k] = x;

        if (x >= n && y >= m) {
          trace.push(vCopy);
          return MyersDiff.backtrack(trace, a, b);
        }
      }
      trace.push(vCopy);
    }

    return [];
  }

  private static backtrack(
    trace: { [k: number]: number }[],
    a: string[],
    b: string[]
  ): DiffHunk[] {
    const hunks: DiffHunk[] = [];
    let x = a.length;
    let y = b.length;

    for (let d = trace.length - 1; d >= 0; d--) {
      const v = trace[d];
      const k = x - y;

      const prevK =
        k === -d || (k !== d && (trace[d - 1]?.[k - 1] ?? -1) < (trace[d - 1]?.[k + 1] ?? -1))
          ? k + 1
          : k - 1;

      const prevX = trace[d - 1]?.[prevK] ?? 0;
      const prevY = prevX - prevK;

      while (x > prevX && y > prevY) {
        hunks.unshift({ type: 'common', line: a[x - 1] });
        x--;
        y--;
      }

      if (d > 0) {
        if (x === prevX) {
          hunks.unshift({ type: 'add', line: b[prevY] });
        } else if (y === prevY) {
          hunks.unshift({ type: 'delete', line: a[prevX] });
        }
      }
      x = prevX;
      y = prevY;
    }

    return hunks;
  }
}
