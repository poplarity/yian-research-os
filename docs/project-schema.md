# Project Schema

Project notes are ordinary Markdown files. A file is included on the dashboard when it has:

```yaml
class: project
```

Recommended frontmatter:

```yaml
class: project
status: active
phase: planning
priority: 2
start_date: 2026-06-25
deadline:
project_area:
tags:
  - project
```

Recommended sections:

```markdown
## 项目目标
- 

## 实验规划与进度
- [ ] 明确核心问题
- [ ] 设计第一轮实验 / 分析
- [ ] 记录第一条实验发现

## 实验发现
- 2026-06-25 | 发现内容 | evidence: [[记录]] | next: 下一步

## 实验 idea
- [ ] 

## 相关记录
- 
```

Legacy section names are supported:

- `## 下一步`
- `## 进度`
- `## 发现`
- `## idea`
- `## Ideas`

