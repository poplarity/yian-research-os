import {
  App,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  normalizePath
} from "obsidian";

import homeTemplate from "./templates/HOME.md";
import snippetTemplate from "./templates/home-research-os.css";

interface ResearchOsSettings {
  homeNotePath: string;
  cssSnippetPath: string;
  dailyFolderPath: string;
  quickMemoPath: string;
  remindersPath: string;
  backupFolderPath: string;
  enableSnippetOnInstall: boolean;
  enableDataviewJsOnInstall: boolean;
  createSupportFiles: boolean;
  backupBeforeOverwrite: boolean;
  openHomeAfterInstall: boolean;
  autoInstallOnStartup: boolean;
}

const DEFAULT_SETTINGS: ResearchOsSettings = {
  homeNotePath: "HOME.md",
  cssSnippetPath: ".obsidian/snippets/home-research-os.css",
  dailyFolderPath: "00 - System/02 - daily",
  quickMemoPath: "00 - System/01 - memory/quick-memo.md",
  remindersPath: "00 - System/01 - memory/reminders.md",
  backupFolderPath: ".home-backup",
  enableSnippetOnInstall: true,
  enableDataviewJsOnInstall: true,
  createSupportFiles: true,
  backupBeforeOverwrite: true,
  openHomeAfterInstall: true,
  autoInstallOnStartup: false
};

export default class ResearchOsPlugin extends Plugin {
  settings: ResearchOsSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "install-or-refresh-workbench",
      name: "Install or refresh Research OS home",
      callback: async () => {
        await this.installWorkbench({ overwriteHome: true, overwriteCss: true });
      }
    });

    this.addCommand({
      id: "install-missing-files",
      name: "Install missing Research OS files only",
      callback: async () => {
        await this.installWorkbench({ overwriteHome: false, overwriteCss: false });
      }
    });

    this.addCommand({
      id: "open-home",
      name: "Open Research OS home",
      callback: async () => {
        await this.openOrCreateHome();
      }
    });

    this.addCommand({
      id: "open-daily-essay",
      name: "Open today's daily essay",
      callback: async () => {
        await this.openOrCreateDailyEssay();
      }
    });

    this.addCommand({
      id: "open-quick-memo",
      name: "Open quick memo",
      callback: async () => {
        await this.openOrCreateFile(this.settings.quickMemoPath, this.quickMemoContent(this.today()));
      }
    });

    this.addCommand({
      id: "open-reminders",
      name: "Open reminders",
      callback: async () => {
        await this.openOrCreateFile(this.settings.remindersPath, this.remindersContent(this.today()));
      }
    });

    this.addSettingTab(new ResearchOsSettingTab(this.app, this));

    if (this.settings.autoInstallOnStartup) {
      await this.installWorkbench({ overwriteHome: false, overwriteCss: false, quiet: true });
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async installWorkbench(options: { overwriteHome: boolean; overwriteCss: boolean; quiet?: boolean }) {
    const wrote: string[] = [];
    const skipped: string[] = [];

    if (await this.writeManagedFile(this.settings.homeNotePath, this.renderHomeTemplate(), options.overwriteHome)) {
      wrote.push(this.settings.homeNotePath);
    } else {
      skipped.push(this.settings.homeNotePath);
    }

    if (await this.writeManagedFile(this.settings.cssSnippetPath, snippetTemplate, options.overwriteCss)) {
      wrote.push(this.settings.cssSnippetPath);
    } else {
      skipped.push(this.settings.cssSnippetPath);
    }

    if (this.settings.createSupportFiles) {
      await this.openOrCreateSupportFile(this.settings.quickMemoPath, this.quickMemoContent(this.today()));
      await this.openOrCreateSupportFile(this.settings.remindersPath, this.remindersContent(this.today()));
      await this.ensureFolder(this.settings.dailyFolderPath);
    }

    if (this.settings.enableSnippetOnInstall) {
      await this.enableCssSnippet(this.settings.cssSnippetPath);
    }

    if (this.settings.enableDataviewJsOnInstall) {
      await this.enableDataviewJs();
    }

    if (this.settings.openHomeAfterInstall) {
      await this.openFile(this.settings.homeNotePath);
    }

    if (!options.quiet) {
      new Notice(
        `Research OS installed. Wrote ${wrote.length} file(s)` +
        (skipped.length ? `, skipped ${skipped.length} existing file(s).` : ".")
      );
    }
  }

  async openOrCreateHome() {
    await this.openOrCreateFile(this.settings.homeNotePath, this.renderHomeTemplate());
  }

  async openOrCreateDailyEssay() {
    const date = this.today();
    const dailyPath = normalizePath(`${this.settings.dailyFolderPath}/${date}.md`);
    await this.openOrCreateFile(dailyPath, this.dailyEssayContent(date));
  }

  async openOrCreateFile(path: string, content: string) {
    const normalized = normalizePath(path);
    if (!(await this.exists(normalized))) {
      await this.writeText(normalized, content);
    }
    await this.openFile(normalized);
  }

  async openOrCreateSupportFile(path: string, content: string) {
    const normalized = normalizePath(path);
    if (!(await this.exists(normalized))) {
      await this.writeText(normalized, content);
    }
  }

  renderHomeTemplate() {
    return homeTemplate;
  }

  dailyEssayContent(date: string) {
    return [
      "---",
      `date: ${date}`,
      "tags:",
      "  - daily",
      "  - essay",
      "---",
      `# 每日随笔 ${date}`,
      "",
      "## 随笔",
      "",
      "## 快捷备忘",
      "",
      "## 提醒事项",
      "",
      "## 今日回顾",
      "- "
    ].join("\n");
  }

  quickMemoContent(date: string) {
    return [
      "---",
      `created: ${date}`,
      "tags:",
      "  - quick-memo",
      "  - inbox",
      "---",
      "# 快捷备忘录",
      "",
      `## ${date}`,
      ""
    ].join("\n");
  }

  remindersContent(date: string) {
    return [
      "---",
      `created: ${date}`,
      "tags:",
      "  - reminders",
      "  - inbox",
      "---",
      "# 提醒事项",
      "",
      "## 活跃提醒",
      "",
      "## 已完成",
      ""
    ].join("\n");
  }

  async writeManagedFile(path: string, content: string, overwrite: boolean) {
    const normalized = normalizePath(path);
    const exists = await this.exists(normalized);
    if (exists && !overwrite) return false;

    if (exists && overwrite && this.settings.backupBeforeOverwrite) {
      await this.backupFile(normalized);
    }

    await this.writeText(normalized, content);
    return true;
  }

  async backupFile(path: string) {
    const current = await this.app.vault.adapter.read(path);
    const backupPath = normalizePath(`${this.settings.backupFolderPath}/yian-research-os-${this.timestamp()}/${path}`);
    await this.writeText(backupPath, current);
  }

  async writeText(path: string, content: string) {
    const normalized = normalizePath(path);
    await this.ensureFolder(this.parentPath(normalized));
    await this.app.vault.adapter.write(normalized, content);
  }

  async openFile(path: string) {
    const normalized = normalizePath(path);
    const file = this.app.vault.getAbstractFileByPath(normalized);
    if (!(file instanceof TFile)) {
      new Notice(`Research OS could not open ${normalized}`);
      return;
    }
    await this.app.workspace.getLeaf(false).openFile(file);
  }

  async exists(path: string) {
    return this.app.vault.adapter.exists(normalizePath(path));
  }

  async ensureFolder(folderPath: string) {
    const normalized = normalizePath(folderPath);
    if (!normalized || normalized === ".") return;

    const parts = normalized.split("/").filter(Boolean);
    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (!(await this.app.vault.adapter.exists(current))) {
        await this.app.vault.adapter.mkdir(current);
      }
    }
  }

  async enableCssSnippet(cssPath: string) {
    const snippetId = this.basename(cssPath).replace(/\.css$/i, "");
    const appearancePath = ".obsidian/appearance.json";
    let appearance: Record<string, unknown> = {};

    if (await this.exists(appearancePath)) {
      try {
        appearance = JSON.parse(await this.app.vault.adapter.read(appearancePath)) as Record<string, unknown>;
      } catch (error) {
        console.error("Unable to parse appearance.json", error);
      }
    }

    const enabled = Array.isArray(appearance.enabledCssSnippets)
      ? [...appearance.enabledCssSnippets]
      : [];

    if (!enabled.includes(snippetId)) enabled.push(snippetId);
    appearance.enabledCssSnippets = enabled;
    await this.writeText(appearancePath, `${JSON.stringify(appearance, null, 2)}\n`);
  }

  async enableDataviewJs() {
    const dataviewPath = ".obsidian/plugins/dataview/data.json";
    if (!(await this.exists(dataviewPath))) {
      new Notice("Dataview settings not found. Install Dataview and enable DataviewJS for the full dashboard.");
      return;
    }

    try {
      const raw = await this.app.vault.adapter.read(dataviewPath);
      const config = JSON.parse(raw) as Record<string, unknown>;
      config.enableDataviewJs = true;
      config.allowHtml = true;
      config.refreshEnabled = true;
      await this.writeText(dataviewPath, `${JSON.stringify(config, null, 2)}\n`);
    } catch (error) {
      console.error("Unable to update Dataview settings", error);
      new Notice("Could not update Dataview settings. Enable DataviewJS manually.");
    }
  }

  parentPath(path: string) {
    const index = path.lastIndexOf("/");
    return index === -1 ? "" : path.slice(0, index);
  }

  basename(path: string) {
    return path.split("/").filter(Boolean).pop() ?? path;
  }

  today() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  timestamp() {
    return new Date().toISOString().replace(/[:.]/g, "-");
  }
}

class ResearchOsSettingTab extends PluginSettingTab {
  plugin: ResearchOsPlugin;

  constructor(app: App, plugin: ResearchOsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Yian Research OS" });
    containerEl.createEl("p", {
      cls: "yro-settings-note",
      text: "Install a Markdown + DataviewJS research home into this vault. Existing HOME files can be backed up before refresh."
    });

    new Setting(containerEl)
      .setName("Home note path")
      .setDesc("The note generated by the plugin.")
      .addText(text => text
        .setPlaceholder("HOME.md")
        .setValue(this.plugin.settings.homeNotePath)
        .onChange(async value => {
          this.plugin.settings.homeNotePath = normalizePath(value || DEFAULT_SETTINGS.homeNotePath);
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("CSS snippet path")
      .setDesc("The scoped CSS snippet written and enabled by the plugin.")
      .addText(text => text
        .setPlaceholder(".obsidian/snippets/home-research-os.css")
        .setValue(this.plugin.settings.cssSnippetPath)
        .onChange(async value => {
          this.plugin.settings.cssSnippetPath = normalizePath(value || DEFAULT_SETTINGS.cssSnippetPath);
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Daily essay folder")
      .setDesc("Daily essay notes are created as YYYY-MM-DD.md inside this folder.")
      .addText(text => text
        .setPlaceholder("00 - System/02 - daily")
        .setValue(this.plugin.settings.dailyFolderPath)
        .onChange(async value => {
          this.plugin.settings.dailyFolderPath = normalizePath(value || DEFAULT_SETTINGS.dailyFolderPath);
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Quick memo path")
      .addText(text => text
        .setPlaceholder("00 - System/01 - memory/quick-memo.md")
        .setValue(this.plugin.settings.quickMemoPath)
        .onChange(async value => {
          this.plugin.settings.quickMemoPath = normalizePath(value || DEFAULT_SETTINGS.quickMemoPath);
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Reminders path")
      .addText(text => text
        .setPlaceholder("00 - System/01 - memory/reminders.md")
        .setValue(this.plugin.settings.remindersPath)
        .onChange(async value => {
          this.plugin.settings.remindersPath = normalizePath(value || DEFAULT_SETTINGS.remindersPath);
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Backup folder")
      .setDesc("Used before overwriting generated files.")
      .addText(text => text
        .setPlaceholder(".home-backup")
        .setValue(this.plugin.settings.backupFolderPath)
        .onChange(async value => {
          this.plugin.settings.backupFolderPath = normalizePath(value || DEFAULT_SETTINGS.backupFolderPath);
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Enable CSS snippet on install")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableSnippetOnInstall)
        .onChange(async value => {
          this.plugin.settings.enableSnippetOnInstall = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Enable DataviewJS on install")
      .setDesc("Updates Dataview settings if Dataview is installed.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableDataviewJsOnInstall)
        .onChange(async value => {
          this.plugin.settings.enableDataviewJsOnInstall = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Create support files")
      .setDesc("Creates quick memo, reminders, and daily essay folders if missing.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.createSupportFiles)
        .onChange(async value => {
          this.plugin.settings.createSupportFiles = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Back up before overwrite")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.backupBeforeOverwrite)
        .onChange(async value => {
          this.plugin.settings.backupBeforeOverwrite = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Open home after install")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.openHomeAfterInstall)
        .onChange(async value => {
          this.plugin.settings.openHomeAfterInstall = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Auto-install missing files on startup")
      .setDesc("Keeps support files present without overwriting HOME.md.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoInstallOnStartup)
        .onChange(async value => {
          this.plugin.settings.autoInstallOnStartup = value;
          await this.plugin.saveSettings();
        }));

    containerEl.createEl("p", {
      cls: "yro-settings-warning",
      text: "Refresh overwrites the generated HOME and CSS snippet after creating backups. Project notes, memos, reminders, and daily notes are not overwritten."
    });

    new Setting(containerEl)
      .setName("Install missing files")
      .setDesc("Creates missing files only.")
      .addButton(button => button
        .setButtonText("Install missing")
        .onClick(async () => {
          await this.plugin.installWorkbench({ overwriteHome: false, overwriteCss: false });
        }));

    new Setting(containerEl)
      .setName("Refresh generated files")
      .setDesc("Backs up and overwrites HOME.md and the CSS snippet.")
      .addButton(button => button
        .setWarning()
        .setButtonText("Refresh")
        .onClick(async () => {
          await this.plugin.installWorkbench({ overwriteHome: true, overwriteCss: true });
        }));
  }
}
