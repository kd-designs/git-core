# ts-git-core

A pure TypeScript Git internal object store, SHA-1 staging index, commit graph, and Myers diff engine.

## Features

- **Object Store**: Low-level Git binary format for `blob`, `tree`, and `commit` objects.
- **Branch & Head Management**: Symbolic refs resolution (`HEAD -> refs/heads/main`).
- **Myers Diff**: Longest Common Subsequence (LCS) / shortest edit script Myers diff algorithm.
- **Zero External Dependencies**: Uses standard Node.js crypto primitives.
