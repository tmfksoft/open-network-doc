# Open Network Doc

A Visio-style, network-specific documentation tool that runs entirely in
your browser. Draw devices, network groups, VLANs, and IP ranges on a
canvas, group and link them across multiple sheets, write up the details in
a per-item markdown inspector, and keep a linked knowledgebase alongside the
diagram — all saved to a single portable file you drag in and out of the
browser tab. **There is no backend and no account**: nothing you draw ever
leaves your machine unless you choose to share the file.

> **AI disclaimer**: This project was built almost entirely by
> [Claude Code](https://claude.com/claude-code) (Anthropic's AI coding
> assistant) working from a human-directed feature plan, with a human
> reviewing and steering the output at each step. Treat it accordingly —
> read before you trust, and please open an issue if something looks wrong.

## Features

- **Canvas nodes**: devices, network groups, VLANs, IP ranges, group headers
  (resizable containers with drag-to-group), and sheet portals for linking
  between sheets.
- **Connections**: physical link, logical link, VLAN membership, and VPN
  tunnel edge types, each with an optional custom color, line style
  (solid/dashed), and arrowheads (none/forward/both directions) — useful for
  things like tracing a site-to-site VPN tunnel across an "Internet" node.
- **VLANs**: devices and connections can carry a VLAN ID; clicking a VLAN
  node highlights every device and edge that shares its ID.
- **Multi-sheet documents** with cross-sheet portal nodes to jump between
  them.
- **Inspector sidebar** with per-type fields and a markdown description for
  every node and edge, plus hover popovers for a quick summary without
  clicking in.
- **Small conveniences**: network groups named "Internet"/"The Internet"
  automatically get a globe icon; groups can have a custom uploaded logo in
  place of their icon.
- **Markdown knowledgebase** with a folder-tree nav, shared editor/renderer
  with the node descriptions, and paste-to-upload images.
- **No backend** — everything is held in memory in the browser and written
  out to a single file on save.

## The `.ond` file format

Documents are saved as a `.ond` file: a zip archive containing a SQLite
database (structured data — sheets, nodes, edges), separate markdown files
for every long-form description/knowledgebase page, and any images you've
pasted or uploaded, referenced by an internal `asset://` scheme. Opening a
file parses it fully client-side (via [sql.js](https://sql.js.org/) and
[fflate](https://github.com/101arrowz/fflate)) — you can:

- Drag and drop a `.ond` file onto the app, or use **File → Open**.
- Save with **File → Save**, which uses the File System Access API where
  available (so repeat saves don't re-prompt) and falls back to a plain
  download elsewhere.
- Open a document by URL on page load with `?url=<encoded-url>`, e.g. for a
  publicly hosted file or an S3 presigned URL — handy for sharing a document
  as a link instead of an attachment (subject to the target's CORS policy).

## Tech stack

- [React 19](https://react.dev/) + [Vite 6](https://vite.dev/) + TypeScript
- [Mantine 9](https://mantine.dev/) for UI components
- [@xyflow/react (React Flow) 12](https://reactflow.dev/) for the canvas
- [Zustand 5](https://zustand-demo.pmnd.rs/) for state management
- [sql.js](https://sql.js.org/) (SQLite compiled to WASM) + [fflate](https://github.com/101arrowz/fflate) for the file format
- [react-markdown](https://github.com/remarkjs/react-markdown) + `remark-gfm` + `rehype-sanitize` for markdown
- [@tabler/icons-react](https://tabler.io/icons) for iconography

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and build a production bundle
npm run lint      # run ESLint
```

## Deployment

The app is a static SPA with no server dependency, deployed to GitHub Pages
via `.github/workflows/deploy.yml` on every push to `main`
(https://tmfksoft.github.io/open-network-doc/). `vite.config.ts` switches
the build's `base` path automatically depending on whether it's running in
GitHub Actions, so `npm run dev`/`npm run build` locally still work from the
root path.
