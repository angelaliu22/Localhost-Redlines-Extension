# Demo — Not Part of the Product

This folder contains a **standalone interactive demo** of Localhost Redliner for static hosting (e.g. Vercel). It is not part of the actual VS Code or Chrome extension.

The demo lets visitors try the element inspection and comment overlay on a sample page. All backend calls are mocked — no VS Code extension or Chrome extension is needed.

## What's different from the real thing

- Comments are **not** sent to VS Code. They appear in the activity log with a simulated "done" status.
- The overlay runs as inline JS, not as a Chrome extension.
- This is a single static HTML file with no build step or dependencies.

## Deploying

Point your static hosting provider at this `demo/` directory. No build command needed.
