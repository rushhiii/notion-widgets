# Copilot Instructions

This repo is the Notion Widgets app. Keep widget behavior stable, especially URL query param fidelity and embed output compatibility.

When available, prefer the graphify outputs over rescanning the repo:

- Read `graphify-out/GRAPH_REPORT.md` first.
- Use `graphify-out/graph.json` for repo structure and relationships.
- Do not edit generated graph files directly.

If graph data is missing, treat it as unavailable rather than assuming a fresh scan was performed.

For UI and widget changes, preserve the existing builder/embed split and keep changes small and route-specific.

## graphify

Before answering architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md` if it exists.
If `graphify-out/wiki/index.md` exists, navigate it for deep questions.
Type `/graphify` in Copilot Chat to build or update the knowledge graph.
