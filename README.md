# dsh-apple-design

DeepSeek Harness plugin for the **apple-design** skill: a cross-platform UI/UX reviewer grounded in Apple's Human Interface Guidelines.

Upstream skill: [dickwu/apple-design-skill](https://github.com/dickwu/apple-design-skill)

---

## What this is

A thin **DSH Host wrapper** around the externally maintained `apple-design` skill.

The upstream skill contains:

```text
123 Apple HIG reference pages
57 component pages
Liquid Glass guide
Flutter / React Native / Tauri / Electron translations
a design-craft review method
```

This plugin adds DSH plumbing:

```text
registers the apple-design skill inside DSH
exposes read-only tools to browse and read the HIG references
does not bundle or relicense Apple's HIG text
```

---

## Install

```bash
npx skills add dickwu/apple-design-skill
dsh plugin --profile web add github:mycroft-sherlock/apple-design
```

Optional custom skill location:

```powershell
$env:APPLE_DESIGN_SKILL_DIR = "C:\path\to\apple-design"
```

---

## Tools

| Tool | Purpose |
|---|---|
| `apple_design_pages` | List installed HIG reference pages |
| `apple_design_hig` | Read one page by filename |
| `apple_design_index` | Read `hig-lookup.md` |

Example:

```text
用 apple-design 审查这个页面：
- iOS 风格
- 侧边栏 + 详情
- 暗色模式
- 表单校验
先给 HIG 依据，再给修改建议。
```

---

## Why a wrapper instead of copying

The upstream project has **no LICENSE file**. The HIG text belongs to Apple Inc.

This repository does **not** contain:

```text
SKILL.md
references/hig/*.md
Apple HIG text
```

It only reads a locally installed copy.

---

## Safety

```text
Read-only tools
Page filename regex only
No path traversal
Max reference size 200 KB
No shell
No network calls
No bundled Apple text
```

---

## Status

```text
Wrapper code: MIT
Upstream skill and Apple HIG text: not bundled
Tests: 4/4 passing
dsh.pub: not listed; using GitHub topic / directory discovery
```

---

## Credits

```text
apple-design skill: dickwu
https://github.com/dickwu/apple-design-skill

Apple Human Interface Guidelines: Apple Inc.
https://developer.apple.com/design/human-interface-guidelines/
```

Not affiliated with or endorsed by Apple Inc. or the upstream author.

---

## License

MIT for this wrapper only. The upstream skill and Apple HIG text remain under their own terms.
