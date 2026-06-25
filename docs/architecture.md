# Architecture

Yian Research OS packages a Markdown-first Obsidian dashboard as a small generator plugin.

## Components

- `src/main.ts`: plugin commands, settings tab, file writing, backup flow, Dataview/CSS setup.
- `src/templates/HOME.md`: generated homepage template.
- `src/templates/home-research-os.css`: generated scoped snippet.
- `styles.css`: minimal CSS for the plugin settings tab.

## Generated Files

The plugin writes files into the active vault:

- `HOME.md`
- `.obsidian/snippets/home-research-os.css`
- `00 - System/01 - memory/quick-memo.md`
- `00 - System/01 - memory/reminders.md`
- `00 - System/02 - daily/`

Before overwriting generated home or CSS files, it writes a backup under `.home-backup/yian-research-os-<timestamp>/`.

## Why Markdown First

The dashboard is intentionally not a custom Obsidian view. Markdown keeps the system easy to edit and inspect, while DataviewJS provides enough dynamic behavior for project cards, quick creation, and capture actions.

## Dataview

The dashboard expects DataviewJS for dynamic rendering. If Dataview is installed, the plugin can enable:

- `enableDataviewJs`
- `allowHtml`
- `refreshEnabled`

The plugin does not install community plugins automatically.

