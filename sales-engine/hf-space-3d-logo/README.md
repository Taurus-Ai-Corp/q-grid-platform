---
title: Q-GRID Comply — 3D Logo & Brand System
emoji: 🔐
colorFrom: indigo
colorTo: green
sdk: static
pinned: true
license: mit
tags:
  - pqc
  - post-quantum-cryptography
  - brand
  - 3d
  - threejs
  - compliance
  - eu-ai-act
short_description: Interactive 3D logo for Q-GRID Comply PQC
---

# Q-GRID Comply — 3D Logo & Brand System

Interactive Three.js 3D visualization of the Q-GRID Comply logo.

## Features
- **3D Grid Mesh Logo** — Concept B (3x3 nodes + diagonal lattice + Q tail)
- **Mouse-reactive rotation** — follows cursor with smooth easing
- **Bloom post-processing** — Unreal Engine-style glow
- **Ambient particles** — floating quantum-inspired particles
- **Node pulsing** — breathing animation on all lattice nodes
- **Full brand system** — dark/light nav mockups, size scaling, all 3 concepts

## Brand Tokens
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#00CCAA` | Accent, nodes, CTAs (dark mode) |
| Primary Deep | `#008E8A` | Accent (light mode) |
| Background | `#0B0E14` | Dark surfaces |
| Light BG | `#F8F9FA` | Comply app surfaces |
| Heading Font | Jura 700 | Logo text, section headers |
| Body Font | DM Sans 400-700 | All body text |
| Mono Font | IBM Plex Mono 300-600 | Labels, badges, code |

## Links
- [Q-GRID.net](https://q-grid.net) — Marketing site
- [EU AI Act Risk Assessment](https://q-grid.net/assess) — Free compliance tool
- [PQC SSL Scan Dataset](https://huggingface.co/datasets/Q-GRID/pqc-ssl-scans) — 45 domain scans
- [TAURUS AI Corp](https://taurusai.io)

## Tech Stack
- Three.js r170 (ES Modules via CDN)
- UnrealBloomPass post-processing
- Pure CSS (no framework)
- Google Fonts: DM Sans, Jura, IBM Plex Mono
