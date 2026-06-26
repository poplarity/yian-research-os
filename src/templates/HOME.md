---
cssclasses:
  - home-research-os
aliases:
  - Yian Research OS
  - 个人主页
tags:
  - home
  - research-os
---

# Yian Research OS

## 快速操作

```dataviewjs
const today = window.moment ? window.moment().format("YYYY-MM-DD") : new Date().toISOString().slice(0, 10);
const todayLabel = window.moment ? window.moment().format("YYYY年MM月DD日 dddd") : today;
const toArray = (value) => value?.array ? value.array() : Array.from(value ?? []);
const formatFileTime = (millis) => window.moment
  ? window.moment(millis).format("MM-DD HH:mm")
  : new Date(millis).toLocaleDateString();

if (!window.__YRO_INPUT_FOCUS_GUARD__) {
  window.__YRO_INPUT_FOCUS_GUARD__ = true;
  const focusSelector = ".markdown-preview-view.home-research-os input:not([type='checkbox']), .markdown-preview-view.home-research-os textarea";
  document.addEventListener("mousedown", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const editable = target.closest(focusSelector);
    if (!editable) return;
    event.stopPropagation();
    window.setTimeout(() => editable.focus({ preventScroll: true }), 0);
  }, true);
  document.addEventListener("focusin", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches(focusSelector)) return;
    target.closest(".markdown-preview-view.home-research-os")?.classList.add("yro-has-input-focus");
  });
  document.addEventListener("focusout", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches(focusSelector)) return;
    window.setTimeout(() => {
      if (!document.activeElement?.matches?.(focusSelector)) {
        document.querySelector(".markdown-preview-view.home-research-os")?.classList.remove("yro-has-input-focus");
      }
    }, 20);
  });
}

const notify = (message) => {
  try {
    if (typeof Notice !== "undefined") new Notice(message);
  } catch (error) {
    console.log(message, error);
  }
};

const sanitize = (value) => String(value ?? "")
  .replace(/[\\/#%&{}<>*?$!'":@+`|=]/g, "")
  .replace(/\s+/g, " ")
  .trim();

const ensureFolder = async (folderPath) => {
  if (!folderPath) return;
  const parts = folderPath.split("/").filter(Boolean);
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!app.vault.getAbstractFileByPath(current)) await app.vault.createFolder(current);
  }
};

const uniquePath = (path) => {
  if (!app.vault.getAbstractFileByPath(path)) return path;
  const dot = path.lastIndexOf(".");
  const base = dot > -1 ? path.slice(0, dot) : path;
  const ext = dot > -1 ? path.slice(dot) : "";
  for (let index = 2; index < 100; index += 1) {
    const candidate = `${base}-${index}${ext}`;
    if (!app.vault.getAbstractFileByPath(candidate)) return candidate;
  }
  return `${base}-${Date.now()}${ext}`;
};

const openVaultPath = async (path) => {
  const cleanPath = path.replace(/\/$/, "");
  const target = app.vault.getAbstractFileByPath(cleanPath) || app.vault.getAbstractFileByPath(`${cleanPath}.md`);
  if (target?.extension === "md") {
    await app.workspace.getLeaf(false).openFile(target);
    return;
  }
  if (target?.children) {
    const explorer = app.workspace.getLeavesOfType("file-explorer")?.[0]?.view;
    if (explorer?.revealInFolder) await explorer.revealInFolder(target);
    app.workspace.leftSplit?.expand?.();
    notify(`已定位目录: ${cleanPath}`);
    return;
  }
  await app.workspace.openLinkText(cleanPath.replace(/\.md$/, ""), "");
};

const openOrCreate = async (path, content, options = {}) => {
  const existing = app.vault.getAbstractFileByPath(path);
  if (existing?.extension === "md") {
    await app.workspace.getLeaf(false).openFile(existing);
    notify(`已打开: ${path}`);
    return existing;
  }
  const targetPath = options.unique ? uniquePath(path) : path;
  await ensureFolder(targetPath.split("/").slice(0, -1).join("/"));
  const file = await app.vault.create(targetPath, content);
  await app.workspace.getLeaf(false).openFile(file);
  notify(`已创建: ${targetPath}`);
  return file;
};

const timeNow = () => window.moment ? window.moment().format("HH:mm") : new Date().toTimeString().slice(0, 5);

const appendLineToSection = async (path, createContent, headingNames, fallbackHeading, line) => {
  await ensureFolder(path.split("/").slice(0, -1).join("/"));
  let file = app.vault.getAbstractFileByPath(path);
  if (!file) file = await app.vault.create(path, createContent);
  const current = await app.vault.read(file);
  const wanted = new Set(headingNames.map(name => String(name).replace(/\s+/g, " ").trim().toLowerCase()));
  const lines = current.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^##\s+(.+?)\s*$/);
    if (!match || !wanted.has(match[1].replace(/\s+/g, " ").trim().toLowerCase())) continue;
    let insertAt = index + 1;
    while (insertAt < lines.length && !/^##\s+/.test(lines[insertAt])) insertAt += 1;
    const before = lines.slice(0, insertAt);
    const after = lines.slice(insertAt);
    if (before[before.length - 1]?.trim()) before.push("");
    before.push(line);
    if (after.length && after[0]?.trim()) before.push("");
    await app.vault.modify(file, before.concat(after).join("\n"));
    return file;
  }
  const next = `${current.replace(/\s*$/, "")}\n\n## ${fallbackHeading}\n${line}\n`;
  await app.vault.modify(file, next);
  return file;
};

const projectContent = (title) => [
  "---",
  "class: project",
  "status: active",
  "phase: planning",
  "priority: 2",
  `start_date: ${today}`,
  "deadline: ",
  "project_area: ",
  "tags:",
  "  - project",
  "---",
  "",
  `# ${title}`,
  "",
  "## 项目目标",
  "- ",
  "",
  "## 实验规划与进度",
  "- [ ] 明确核心问题",
  "- [ ] 设计第一轮实验 / 分析",
  "- [ ] 记录第一条实验发现",
  "",
  "## 实验发现",
  `- ${today} | 发现内容 | evidence:  | next: `,
  "",
  "## 实验 idea",
  "- [ ] ",
  "",
  "## 相关记录",
  "- "
].join("\n");

const experimentContent = () => [
  "---",
  `creation_date: ${today}`,
  "tags:",
  "  - experiment-log",
  "---",
  `# 实验记录 ${today}`,
  "",
  "## 项目",
  "- ",
  "",
  "## 实验规划",
  "- ",
  "",
  "## 实验过程",
  "- ",
  "",
  "## 实验发现",
  "- ",
  "",
  "## 下一步",
  "- [ ] "
].join("\n");

const dailyEssayContent = () => [
  "---",
  `date: ${today}`,
  "tags:",
  "  - daily",
  "  - essay",
  "---",
  `# 每日随笔 ${today}`,
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

const analysisContent = (title) => [
  "---",
  `creation_date: ${today}`,
  "tags:",
  "  - analysis-log",
  "project: ",
  "status: draft",
  "---",
  `# ${title}`,
  "",
  "## 分析问题",
  "- ",
  "",
  "## 输入数据",
  "- ",
  "",
  "## 结果发现",
  "- ",
  "",
  "## 下一步",
  "- [ ] "
].join("\n");

const quickMemoContent = () => [
  "---",
  `created: ${today}`,
  "tags:",
  "  - quick-memo",
  "  - inbox",
  "---",
  "# 快捷备忘录",
  "",
  `## ${today}`
].join("\n");

const remindersContent = () => [
  "---",
  `created: ${today}`,
  "tags:",
  "  - reminders",
  "  - inbox",
  "---",
  "# 提醒事项",
  "",
  "## 活跃提醒",
  "",
  "## 已完成"
].join("\n");

const dailyPath = `00 - System/02 - daily/${today}.md`;
const memoPath = "00 - System/01 - memory/quick-memo.md";
const reminderPath = "00 - System/01 - memory/reminders.md";

const markdownFiles = app.vault.getMarkdownFiles();
const projectPagesForOverview = dv.pages()
  .where(page => page.class === "project" && !page.file.path.startsWith("99 - template/"))
  .array();
const activeProjectsForOverview = projectPagesForOverview.filter(page => String(page.status ?? "active") === "active");
const priorityProjectsForOverview = [...activeProjectsForOverview]
  .sort((a, b) => Number(a.priority ?? 99) - Number(b.priority ?? 99));
const topProject = priorityProjectsForOverview[0] ?? activeProjectsForOverview[0] ?? projectPagesForOverview[0];
const projectTasksForOverview = projectPagesForOverview.flatMap(page => toArray(page.file.tasks));
const openProjectTaskCount = projectTasksForOverview.filter(task => !task.completed).length;
const highPriorityCount = projectPagesForOverview.filter(page => Number(page.priority ?? 99) === 1).length;
const dailyExists = Boolean(app.vault.getAbstractFileByPath(dailyPath));
const readVaultText = async (path) => {
  const file = app.vault.getAbstractFileByPath(path);
  if (!file?.extension) return "";
  return file.extension === "md" ? app.vault.read(file) : "";
};
const reminderText = await readVaultText(reminderPath);
const openReminders = reminderText.split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => /^-\s+\[\s\]\s+/.test(line))
  .map(line => line.replace(/^-\s+\[\s\]\s+/, "").replace(/\s+#reminder\b/g, ""));
const recentFiles = markdownFiles
  .filter(file => [
    "00 - System/02 - daily/",
    "00 - System/01 - memory/",
    "10 - Lab Notebook/",
    "20 - Literature Notes/",
    "30 - Protocols/",
    "40 - Meetings/"
  ].some(prefix => file.path.startsWith(prefix)))
  .sort((a, b) => b.stat.mtime - a.stat.mtime)
  .slice(0, 3);

const shell = dv.el("div", "", { cls: "yro-control-shell" });
shell.textContent = "";

const scrollHomeTarget = (selector, headingText) => {
  const root = shell.closest(".markdown-preview-view.home-research-os") ?? document;
  let target = selector ? root.querySelector(selector) : null;
  if (!target && headingText) {
    target = Array.from(root.querySelectorAll("h2"))
      .find(heading => heading.textContent?.trim() === headingText);
  }
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const firstLook = shell.createEl("section", { cls: "yro-first-look" });
const firstNav = firstLook.createEl("nav", { cls: "yro-first-nav", attr: { "aria-label": "Research OS sections" } });
for (const item of [
  ["FIRST LOOK", ".yro-first-look", ""],
  ["CAPTURE", ".yro-capture-panel", ""],
  ["FOLDERS", ".yro-folder-panel", ""],
  ["PROJECTS", "", "科研项目管理"],
  ["FOCUS", "", "今日聚焦"]
]) {
  const button = firstNav.createEl("button", { text: item[0], attr: { type: "button" } });
  button.addEventListener("click", () => scrollHomeTarget(item[1], item[2]));
}

const firstHero = firstLook.createEl("div", { cls: "yro-first-hero" });
const firstCopy = firstHero.createEl("div", { cls: "yro-first-copy" });
firstCopy.createEl("span", { cls: "yro-kicker", text: "FIRST LOOK" });
firstCopy.createEl("strong", { text: "科研主页总览" });
firstCopy.createEl("p", { text: "把今日捕获、项目推进、提醒事项和常用目录收束到一个可编辑主页。" });

const firstRail = firstHero.createEl("div", { cls: "yro-first-rail" });
firstRail.createEl("span", { text: todayLabel });
firstRail.createEl("span", { text: topProject ? `重点: ${topProject.file.name}` : "重点: 等待新项目" });
firstRail.createEl("span", { text: `${activeProjectsForOverview.length} active projects` });

const widgetGrid = firstLook.createEl("div", { cls: "yro-widget-grid" });
const addWidget = ({ label, value, meta, actionLabel, run, tone = "" }) => {
  const card = widgetGrid.createEl("article", { cls: `yro-widget-card ${tone}`.trim() });
  card.createEl("span", { cls: "yro-widget-label", text: label });
  card.createEl("strong", { text: value });
  card.createEl("p", { text: meta });
  if (actionLabel && run) {
    const button = card.createEl("button", { text: actionLabel, attr: { type: "button" } });
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await run();
      } catch (error) {
        console.error(error);
        notify(`打开失败: ${error.message ?? error}`);
      } finally {
        button.disabled = false;
      }
    });
  }
  return card;
};

addWidget({
  label: "TODAY",
  value: dailyExists ? "随笔已就绪" : "还未写随笔",
  meta: dailyExists ? "继续补充今日观察和复盘。" : "创建今天的每日随笔，保留当天思路。",
  actionLabel: "打开",
  run: () => openOrCreate(dailyPath, dailyEssayContent()),
  tone: "is-today"
});
addWidget({
  label: "PROJECTS",
  value: `${activeProjectsForOverview.length} active`,
  meta: highPriorityCount ? `${highPriorityCount} 个 P1 项目需要优先关注。` : "项目按状态、阶段和优先级自动汇总。",
  actionLabel: topProject ? "打开重点" : "新建项目",
  run: () => topProject ? openVaultPath(topProject.file.path) : openOrCreate(`10 - Lab Notebook/10 - Projects/${today}_new_project.md`, projectContent(`${today}_new_project`)),
  tone: "is-project"
});
addWidget({
  label: "TASKS",
  value: `${openProjectTaskCount} open`,
  meta: openReminders.length ? `${openReminders.length} 条提醒仍未完成。` : "提醒清单当前没有未完成条目。",
  actionLabel: "提醒",
  run: () => openOrCreate(reminderPath, remindersContent()),
  tone: "is-task"
});
const recentCard = addWidget({
  label: "RECENT",
  value: recentFiles[0]?.basename ?? "暂无更新",
  meta: recentFiles.length ? `最近更新 ${formatFileTime(recentFiles[0].stat.mtime)}` : "开始创建项目、随笔或实验记录后会显示。",
  actionLabel: recentFiles[0] ? "打开" : "",
  run: recentFiles[0] ? (() => openVaultPath(recentFiles[0].path)) : null,
  tone: "is-recent"
});
if (recentFiles.length > 1) {
  const recentList = recentCard.createEl("ul", { cls: "yro-recent-mini" });
  for (const file of recentFiles.slice(1)) {
    const item = recentList.createEl("li");
    item.createEl("span", { text: file.basename });
    item.createEl("time", { text: formatFileTime(file.stat.mtime) });
  }
}

const createPanel = shell.createEl("section", { cls: "yro-create-panel" });
const createCopy = createPanel.createEl("div", { cls: "yro-create-copy" });
createCopy.createEl("strong", { text: "快速新建" });
createCopy.createEl("span", { text: "输入标题后创建；留空会使用今天日期。" });

const titleInput = createPanel.createEl("input", {
  cls: "yro-title-input",
  attr: {
    type: "text",
    placeholder: "项目名 / 分析标题",
    "aria-label": "项目名或分析标题"
  }
});

const actionGrid = createPanel.createEl("div", { cls: "yro-action-grid" });
const actions = [
  {
    label: "每日随笔",
    meta: "daily essay",
    run: () => openOrCreate(dailyPath, dailyEssayContent())
  },
  {
    label: "新项目",
    meta: "project note",
    run: () => {
      const title = sanitize(titleInput.value) || `${today}_new_project`;
      titleInput.value = "";
      return openOrCreate(`10 - Lab Notebook/10 - Projects/${title}.md`, projectContent(title));
    }
  },
  {
    label: "今日实验",
    meta: "experiment log",
    run: () => openOrCreate(`10 - Lab Notebook/11 - Experiment Log/Exp.log-${today}.md`, experimentContent())
  },
  {
    label: "分析记录",
    meta: "analysis log",
    run: () => {
      const title = sanitize(titleInput.value) || `${today}_analysis_note`;
      titleInput.value = "";
      return openOrCreate(`10 - Lab Notebook/12 - Analysis Log/${title}.md`, analysisContent(title), { unique: true });
    }
  }
];

for (const action of actions) {
  const button = actionGrid.createEl("button", { cls: "yro-action", attr: { type: "button", "aria-label": action.label } });
  button.createEl("strong", { text: action.label });
  button.createEl("span", { text: action.meta });
  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      await action.run();
    } catch (error) {
      console.error(error);
      notify(`操作失败: ${error.message ?? error}`);
    } finally {
      button.disabled = false;
    }
  });
}

const capturePanel = shell.createEl("section", { cls: "yro-capture-panel" });
const captureCopy = capturePanel.createEl("div", { cls: "yro-section-head" });
captureCopy.createEl("strong", { text: "个人捕获" });
captureCopy.createEl("span", { text: "随笔、备忘、提醒都从这里进入，之后可在对应笔记中继续整理。" });
const captureInput = capturePanel.createEl("textarea", {
  cls: "yro-capture-input",
  attr: {
    placeholder: "写一条随笔、备忘或提醒",
    "aria-label": "个人捕获内容"
  }
});
const captureTools = capturePanel.createEl("div", { cls: "yro-capture-tools" });
const dueInput = captureTools.createEl("input", {
  cls: "yro-reminder-date",
  attr: {
    type: "date",
    "aria-label": "提醒日期"
  }
});
const captureActions = captureTools.createEl("div", { cls: "yro-capture-actions" });
const appendCapture = async (kind) => {
  const text = captureInput.value.trim();
  if (!text) {
    notify("请输入内容。");
    return;
  }
  if (kind === "essay") {
    await appendLineToSection(dailyPath, dailyEssayContent(), ["随笔"], "随笔", `- ${timeNow()} ${text}`);
    notify("已写入今日随笔。");
  }
  if (kind === "memo") {
    await appendLineToSection(memoPath, quickMemoContent(), [today], today, `- ${timeNow()} ${text}`);
    notify("已加入快捷备忘录。");
  }
  if (kind === "reminder") {
    const due = dueInput.value ? ` [due:: ${dueInput.value}]` : "";
    await appendLineToSection(reminderPath, remindersContent(), ["活跃提醒"], "活跃提醒", `- [ ] ${text}${due} #reminder`);
    dueInput.value = "";
    notify("已加入提醒事项。");
  }
  captureInput.value = "";
};
for (const [kind, label] of [["essay", "写随笔"], ["memo", "记备忘"], ["reminder", "加提醒"]]) {
  const button = captureActions.createEl("button", { text: label, attr: { type: "button" } });
  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      await appendCapture(kind);
    } catch (error) {
      console.error(error);
      notify(`捕获失败: ${error.message ?? error}`);
    } finally {
      button.disabled = false;
    }
  });
}
if (openReminders.length) {
  const feed = capturePanel.createEl("div", { cls: "yro-mini-feed" });
  feed.createEl("strong", { text: "近期提醒" });
  const list = feed.createEl("ul");
  for (const item of openReminders.slice(0, 5)) list.createEl("li", { text: item });
}

const folders = [
  ["每日随笔", "00 - System/02 - daily"],
  ["备忘录", "00 - System/01 - memory"],
  ["项目库", "10 - Lab Notebook/10 - Projects"],
  ["实验记录", "10 - Lab Notebook/11 - Experiment Log"],
  ["分析记录", "10 - Lab Notebook/12 - Analysis Log"],
  ["Code report", "10 - Lab Notebook/13 - code report"],
  ["文献笔记", "20 - Literature Notes"],
  ["每日文献", "20 - Literature Notes/21 - Daily Report"],
  ["Protocols", "30 - Protocols"],
  ["Meetings", "40 - Meetings"],
  ["Ideas", "50 - Ideas & Fleeting Notes"],
  ["Coding", "60 - Coding"],
  ["Research", "70 - research"],
  ["PI", "80 - PI"],
  ["Attachments", "90 - Attachments"],
  ["Templates", "99 - template"]
];

const filesInFolder = (path) => markdownFiles
  .filter(file => file.path.startsWith(`${path}/`) || file.path === `${path}.md`);
const noteCount = (path) => filesInFolder(path).length;
const projectCount = dv.pages()
  .where(page => page.class === "project" && !page.file.path.startsWith("99 - template/"))
  .length;
const countLabel = (title, path) => title === "项目库" ? `${projectCount} projects` : `${noteCount(path)} notes`;
const latestLabel = (path) => {
  const latest = filesInFolder(path).sort((a, b) => b.stat.mtime - a.stat.mtime)[0];
  return latest ? `updated ${formatFileTime(latest.stat.mtime)}` : "empty";
};
const folderPanel = shell.createEl("section", { cls: "yro-folder-panel" });
const folderHead = folderPanel.createEl("div", { cls: "yro-section-head" });
folderHead.createEl("strong", { text: "常用目录" });
folderHead.createEl("span", { text: "点击定位文件夹，保留最常用入口。" });
const folderGrid = folderPanel.createEl("div", { cls: "yro-folder-grid" });

for (const [title, path] of folders) {
  const button = folderGrid.createEl("button", { cls: "yro-folder", attr: { type: "button", "aria-label": title } });
  button.createEl("strong", { text: title });
  button.createEl("span", { text: path });
  button.createEl("em", { text: `${countLabel(title, path)} · ${latestLabel(path)}` });
  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      await openVaultPath(path);
    } catch (error) {
      console.error(error);
      notify(`打开失败: ${error.message ?? error}`);
    } finally {
      button.disabled = false;
    }
  });
}
```

## 今日聚焦

> [!focus]
> **主线**：SFPQ / ERH 与 3D genome 调控  
> **当前阶段**：analysis / figure story  
> **下一步**：把 Spike-in、Pol2 pausing、TAD boundary 三条线收束到 Figure 1-5 叙事

## 科研项目管理

```dataviewjs
const toArray = (value) => value?.array ? value.array() : Array.from(value ?? []);
const fmt = (value) => value?.toFormat ? value.toFormat("yyyy-MM-dd") : (value ?? "NA");
const today = window.moment ? window.moment().format("YYYY-MM-DD") : new Date().toISOString().slice(0, 10);

const notify = (message) => {
  try {
    if (typeof Notice !== "undefined") new Notice(message);
  } catch (error) {
    console.log(message, error);
  }
};

const normalize = (value) => String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
const stripWiki = (value) => String(value ?? "")
  .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
  .replace(/\[\[([^\]]+)\]\]/g, (_, target) => target.split("/").pop());

const getSections = (text, headingNames) => {
  const wanted = new Set(headingNames.map(normalize));
  const lines = text.split(/\r?\n/);
  const sections = [];
  let active = false;
  let level = 0;
  let current = [];
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (match) {
      const nextLevel = match[1].length;
      const heading = normalize(match[2]);
      if (active && nextLevel <= level) {
        sections.push(current.join("\n"));
        active = false;
        current = [];
      }
      if (wanted.has(heading)) {
        active = true;
        level = nextLevel;
        current = [];
        continue;
      }
    }
    if (active) current.push(line);
  }
  if (active) sections.push(current.join("\n"));
  return sections.join("\n");
};

const parseTasks = (section) => section.split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => /^-\s+\[[ xX]\]\s+/.test(line))
  .map(line => {
    const done = /^-\s+\[[xX]\]/.test(line);
    const text = stripWiki(line.replace(/^-\s+\[[ xX]\]\s+/, "")).trim();
    return { done, text };
  })
  .filter(item => item.text);

const parseBullets = (section) => section.split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line.startsWith("- "))
  .map(line => stripWiki(line.replace(/^-\s+\[[ xX]\]\s+/, "").replace(/^- /, "")).trim())
  .filter(Boolean);

const parseFindings = (section) => section.split(/\r?\n/)
  .map(line => line.replace(/^- /, "").trim())
  .filter(Boolean)
  .map(line => {
    const parts = line.split("|").map(part => stripWiki(part.trim()));
    if (parts.length >= 2 && /^\d{4}-\d{2}-\d{2}$/.test(parts[0])) {
      return { date: parts[0], text: parts[1], meta: parts.slice(2).join(" · ") };
    }
    return { date: "", text: stripWiki(line), meta: "" };
  })
  .filter(item => item.text && item.text !== "发现内容");

const taskStats = (page) => {
  const tasks = toArray(page.file.tasks);
  const total = tasks.length;
  const done = tasks.filter(task => task.completed).length;
  return { total, done, open: total - done, pct: total ? Math.round(done / total * 100) : 0 };
};

const openProject = async (path) => {
  const file = app.vault.getAbstractFileByPath(path);
  if (!file) throw new Error(`找不到项目文件: ${path}`);
  await app.workspace.getLeaf(false).openFile(file);
};

const insertLineInSection = (text, headingNames, fallbackHeading, line) => {
  const wanted = new Set(headingNames.map(normalize));
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^##\s+(.+?)\s*$/);
    if (!match || !wanted.has(normalize(match[1]))) continue;
    let insertAt = index + 1;
    while (insertAt < lines.length && !/^##\s+/.test(lines[insertAt])) insertAt += 1;
    const before = lines.slice(0, insertAt);
    const after = lines.slice(insertAt);
    if (before[before.length - 1]?.trim()) before.push("");
    before.push(line);
    if (after.length && after[0]?.trim()) before.push("");
    return before.concat(after).join("\n");
  }
  const trimmed = text.replace(/\s*$/, "");
  return `${trimmed}\n\n## ${fallbackHeading}\n${line}\n`;
};

const appendToProject = async (path, kind, value) => {
  const text = String(value ?? "").trim();
  if (!text) {
    notify("请输入要追加的内容。");
    return;
  }
  const file = app.vault.getAbstractFileByPath(path);
  if (!file) throw new Error(`找不到项目文件: ${path}`);
  const current = await app.vault.read(file);
  const config = {
    plan: {
      headings: ["实验规划与进度", "下一步", "进度"],
      fallback: "实验规划与进度",
      line: `- [ ] ${text}`,
      label: "进度"
    },
    finding: {
      headings: ["实验发现", "发现"],
      fallback: "实验发现",
      line: `- ${today} | ${text} | evidence:  | next: `,
      label: "发现"
    },
    idea: {
      headings: ["实验 idea", "实验 Idea", "idea", "Ideas"],
      fallback: "实验 idea",
      line: `- [ ] ${text}`,
      label: "idea"
    }
  }[kind];
  const next = insertLineInSection(current, config.headings, config.fallback, config.line);
  await app.vault.modify(file, next);
  notify(`已追加${config.label}: ${text}`);
};

const pages = dv.pages()
  .where(page => page.class === "project" && !page.file.path.startsWith("99 - template/"))
  .sort(page => page.status === "active" ? 0 : 1, "asc")
  .sort(page => Number(page.priority ?? 99), "asc")
  .array();

const projectShell = dv.el("div", "", { cls: "yro-project-shell" });
projectShell.textContent = "";

const toolbar = projectShell.createEl("div", { cls: "yro-project-toolbar" });
const toolbarCopy = toolbar.createEl("div", { cls: "yro-project-toolbar-copy" });
toolbarCopy.createEl("span", { text: "PROJECT BOARD" });
toolbarCopy.createEl("strong", { text: `${pages.length} 个科研项目` });
toolbarCopy.createEl("p", { text: "项目页仍然是普通 Markdown；这里负责汇总、筛选和快速追加。" });

const projectMetrics = toolbar.createEl("div", { cls: "yro-project-metrics" });
projectMetrics.createEl("span", { text: `${pages.filter(page => String(page.status ?? "active") === "active").length} active` });
projectMetrics.createEl("span", { text: `${pages.filter(page => Number(page.priority ?? 99) === 1).length} P1` });
projectMetrics.createEl("span", { text: `${pages.filter(page => String(page.phase ?? "") === "analysis").length} analysis` });

const filterBar = projectShell.createEl("div", { cls: "yro-project-filters", attr: { "aria-label": "Project filters" } });
const filters = [
  { key: "all", label: "全部" },
  { key: "active", label: "Active", status: "active" },
  { key: "p1", label: "P1", priority: "1" },
  { key: "planning", label: "Planning", phase: "planning" },
  { key: "experiment", label: "Experiment", phase: "experiment" },
  { key: "analysis", label: "Analysis", phase: "analysis" },
  { key: "writing", label: "Writing", phase: "writing" }
];
const filterButtons = new Map();
const applyProjectFilter = (filter) => {
  filterButtons.forEach((button, key) => button.classList.toggle("is-active", key === filter.key));
  for (const card of projectShell.querySelectorAll(".yro-project-card")) {
    if (card.classList.contains("yro-empty-card")) continue;
    const visible = filter.key === "all"
      || (filter.status && card.dataset.status === filter.status)
      || (filter.phase && card.dataset.phase === filter.phase)
      || (filter.priority && card.dataset.priority === filter.priority);
    card.toggleAttribute("hidden", !visible);
  }
};
for (const filter of filters) {
  const button = filterBar.createEl("button", { text: filter.label, attr: { type: "button" } });
  filterButtons.set(filter.key, button);
  button.addEventListener("click", () => applyProjectFilter(filter));
}

const board = projectShell.createEl("div", { cls: "yro-project-board" });

if (!pages.length) {
  const empty = board.createEl("article", { cls: "yro-project-card yro-empty-card" });
  empty.createEl("strong", { text: "还没有项目页" });
  empty.createEl("p", { text: "用上方「新项目」创建第一个科研项目。" });
}

for (const page of pages) {
  const text = await dv.io.load(page.file.path);
  const stats = taskStats(page);
  const nextTasks = parseTasks(getSections(text, ["实验规划与进度", "下一步"]));
  const progressTasks = parseTasks(getSections(text, ["进度"]));
  const taskItems = [];
  const seenTasks = new Set();
  for (const item of [...nextTasks, ...progressTasks.filter(task => !task.done), ...progressTasks.filter(task => task.done)]) {
    const key = normalize(item.text);
    if (seenTasks.has(key)) continue;
    seenTasks.add(key);
    taskItems.push(item);
    if (taskItems.length >= 7) break;
  }
  const findings = parseFindings(getSections(text, ["实验发现", "发现"])).slice(0, 4);
  const ideas = parseBullets(getSections(text, ["实验 idea", "实验 Idea", "idea", "Ideas"])).slice(0, 4);
  const title = text.match(/^#\s+(.+?)\s*$/m)?.[1]?.trim() || page.file.name.replace(/_/g, " ");

  const card = board.createEl("article", { cls: "yro-project-card" });
  card.dataset.status = String(page.status ?? "active");
  card.dataset.phase = String(page.phase ?? "planning");
  card.dataset.priority = String(page.priority ?? "");
  const header = card.createEl("header", { cls: "yro-project-head" });
  const titleBox = header.createEl("div", { cls: "yro-project-titlebox" });
  const titleLink = titleBox.createEl("a", {
    cls: "yro-project-title",
    text: title,
    attr: { href: `obsidian://open?vault=${encodeURIComponent(app.vault.getName())}&file=${encodeURIComponent(page.file.path)}` }
  });
  titleLink.addEventListener("click", async (event) => {
    event.preventDefault();
    await openProject(page.file.path);
  });
  titleBox.createEl("p", { text: page.project_area ?? "未标注领域" });
  const status = header.createEl("div", { cls: "yro-status-stack" });
  status.createEl("span", { cls: "yro-status", text: page.status ?? "active" });
  status.createEl("span", { cls: "yro-phase", text: page.phase ?? "planning" });
  const openButton = status.createEl("button", { cls: "yro-open-project", text: "打开", attr: { type: "button" } });
  openButton.addEventListener("click", async () => {
    try {
      await openProject(page.file.path);
    } catch (error) {
      console.error(error);
      notify(`打开失败: ${error.message ?? error}`);
    }
  });

  const progress = card.createEl("div", { cls: "yro-progress-row" });
  const progressTrack = progress.createEl("div", { cls: "yro-progress" });
  progressTrack.createEl("span", { attr: { style: `width:${stats.pct}%` } });
  progress.createEl("strong", { text: `${stats.pct}%` });

  const meta = card.createEl("div", { cls: "yro-project-meta" });
  meta.createEl("span", { text: `${stats.done}/${stats.total} tasks` });
  meta.createEl("span", { text: `P${page.priority ?? "-"}` });
  meta.createEl("span", { text: `updated ${fmt(page.file.mtime)}` });

  const modules = card.createEl("div", { cls: "yro-project-modules" });
  const planModule = modules.createEl("section", { cls: "yro-module yro-module-plan" });
  planModule.createEl("h3", { text: "实验规划与进度" });
  const planList = planModule.createEl("ul", { cls: "yro-task-list" });
  if (taskItems.length) {
    for (const item of taskItems) {
      const li = planList.createEl("li", { cls: item.done ? "is-done" : "is-open" });
      li.createEl("span", { cls: "yro-check", text: item.done ? "✓" : "" });
      li.createEl("span", { text: item.text });
    }
  } else {
    planList.createEl("li", { cls: "is-muted", text: "添加第一条实验规划" });
  }

  const findingModule = modules.createEl("section", { cls: "yro-module yro-module-finding" });
  findingModule.createEl("h3", { text: "实验发现" });
  const findingList = findingModule.createEl("ul", { cls: "yro-finding-list" });
  if (findings.length) {
    for (const finding of findings) {
      const li = findingList.createEl("li");
      if (finding.date) li.createEl("time", { text: finding.date });
      li.createEl("strong", { text: finding.text });
      if (finding.meta) li.createEl("span", { text: finding.meta });
    }
  } else {
    findingList.createEl("li", { cls: "is-muted", text: "添加第一条实验发现" });
  }

  const ideaModule = modules.createEl("section", { cls: "yro-module yro-module-idea" });
  ideaModule.createEl("h3", { text: "实验 idea" });
  const ideaList = ideaModule.createEl("ul", { cls: "yro-idea-list" });
  if (ideas.length) {
    for (const idea of ideas) ideaList.createEl("li", { text: idea });
  } else {
    ideaList.createEl("li", { cls: "is-muted", text: "添加第一条 idea" });
  }

  const compose = card.createEl("div", { cls: "yro-project-compose" });
  const input = compose.createEl("input", {
    attr: {
      type: "text",
      placeholder: "给这个项目追加一条内容",
      "aria-label": `追加到 ${title}`
    }
  });
  const composeActions = compose.createEl("div", { cls: "yro-compose-actions" });
  const appendButtons = [
    ["plan", "+进度"],
    ["finding", "+发现"],
    ["idea", "+idea"]
  ];
  for (const [kind, label] of appendButtons) {
    const button = composeActions.createEl("button", { text: label, attr: { type: "button" } });
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await appendToProject(page.file.path, kind, input.value);
        input.value = "";
      } catch (error) {
        console.error(error);
        notify(`追加失败: ${error.message ?? error}`);
      } finally {
        button.disabled = false;
      }
    });
  }
}

applyProjectFilter(filters[0]);
```
