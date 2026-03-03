# Release Guide

## Packaging the VS Code Extension

```bash
npm install
npm run compile
npx @vscode/vsce package
```

This creates `localhost-redliner-0.1.0.vsix`.

## Packaging the Chrome Extension

Zip the `chrome-extension-prototype` folder:

```bash
zip -r chrome-extension-prototype.zip chrome-extension-prototype/
```

## Creating a GitHub Release

1. Tag the version: `git tag v0.1.0`
2. Push the tag: `git push origin v0.1.0`
3. Create a release on GitHub and attach:
   - `localhost-redliner-0.1.0.vsix`
   - `chrome-extension-prototype.zip`
