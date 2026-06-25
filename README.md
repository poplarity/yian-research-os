# Yian Research OS

Yian Research OS is an Obsidian plugin that installs a polished research home dashboard into a vault. It packages the `HOME.md` workflow as a reusable plugin: project cards, daily essays, quick memos, reminders, folder shortcuts, and scoped visual styling.

The dashboard is still plain Markdown at rest. The plugin generates and refreshes the files, while you keep editing your projects, memos, and daily notes directly in Obsidian.

## Features

- **Research home installer**: writes a ready-to-use `HOME.md` workbench.
- **Scoped styling**: installs `.obsidian/snippets/home-research-os.css` and enables it.
- **DataviewJS setup helper**: enables DataviewJS when the Dataview plugin is installed.
- **Project management cards**: reads notes with `class: project` and renders progress, tasks, findings, and ideas.
- **Daily essay capture**: creates or opens `00 - System/02 - daily/YYYY-MM-DD.md`.
- **Quick memo inbox**: creates or opens `00 - System/01 - memory/quick-memo.md`.
- **Reminder inbox**: creates or opens `00 - System/01 - memory/reminders.md`.
- **Safe refresh**: backs up generated files before overwriting them.
- **Configurable paths**: adjust note paths in the plugin settings tab.

## Requirements

- Obsidian 1.5.0 or newer.
- Dataview is recommended for the full dashboard experience.
- DataviewJS must be enabled. The plugin can update Dataview settings when Dataview is already installed.

## Install From Source

```bash
git clone https://github.com/YOUR_GITHUB_USER/yian-research-os.git
cd yian-research-os
npm install
npm run build
```

Copy these files into your vault:

```text
<vault>/.obsidian/plugins/yian-research-os/
├── main.js
├── manifest.json
└── styles.css
```

Restart Obsidian, enable **Yian Research OS**, then run:

```text
Command palette -> Yian Research OS: Install or refresh Research OS home
```

## Development

```bash
npm install
npm run dev
```

For one-off verification:

```bash
npm run build
```

## Publish To GitHub

After logging in with the GitHub CLI:

```bash
gh auth login
gh repo create yian-research-os --public --source . --remote origin --push
```

To create a release:

```bash
git tag 0.1.0
git push origin 0.1.0
```

The included GitHub Actions workflow builds and uploads `main.js`, `manifest.json`, and `styles.css` as release assets.

## Commands

- `Install or refresh Research OS home`
- `Install missing Research OS files only`
- `Open Research OS home`
- `Open today's daily essay`
- `Open quick memo`
- `Open reminders`

## Generated Vault Files

Default paths:

```text
HOME.md
.obsidian/snippets/home-research-os.css
00 - System/02 - daily/
00 - System/01 - memory/quick-memo.md
00 - System/01 - memory/reminders.md
.home-backup/
```

## Project Schema

A project note is detected when its frontmatter includes:

```yaml
class: project
status: active
phase: analysis
priority: 1
project_area: 3D genome / transcription regulation
```

The dashboard reads these sections when present:

```markdown
## 实验规划与进度
- [ ] Design first experiment

## 实验发现
- 2026-06-25 | Finding text | evidence: [[note]] | next: Next step

## 实验 idea
- [ ] New idea
```

It also supports legacy sections such as `## 下一步`, `## 进度`, and `## 发现`.

## Design

This plugin intentionally keeps the main experience as Markdown + DataviewJS + scoped CSS instead of a custom React view. That makes the home page easy to edit, diff, back up, and adapt.

## License

MIT

