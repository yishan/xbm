---
template: sheet
theme: auto
lang: zh
title: 需求变更的数据模型（示例数据）
subtitle: 「任务评论 + @提及提醒」需求对数据模型的改动，用 er 的改前 / 变更 / 改后切换查看
cols: 3
source: 示例数据（虚构的任务管理产品），用于演示 am v0.5 的 er 组件
---

## 数据模型变更 {span=2}

```er LR
*User
  id PK
  ~ email varchar(320) UK
  name string
  + notify_pref string
Project
  id PK
  owner_id FK -> User
Task
  id PK
  project_id FK -> Project
  assignee_id FK -> User
  ~ status enum
  - legacy_note text
+ Comment
  id PK
  task_id FK -> Task
  author_id FK -> User
  body text
+ Mention
  id PK
  comment_id FK -> Comment
  user_id FK -> User
+ Notification
  id PK
  user_id FK -> User
  mention_id FK -> Mention
  read_at timestamp
```

## 需求要点

- 任务下可以发评论，评论里可以 @ 成员。
- 被 @ 的成员收到一条提醒，可以标为已读。
- 用户可以设置提醒偏好（`notify_pref`）。
- 任务的旧备注字段 `legacy_note` 迁到第一条评论后删除。

```callout info 怎么看这张图
图下方有「改前 / 变更 / 改后」切换。改前是现在的表结构，变更标出新增（+）、删除（−）、修改（~），改后是上线后的结构。
```

## 变更清单

| 类型 | 对象 | 说明 |
| --- | --- | --- |
| 新增 | Comment、Mention、Notification | 3 张新表 |
| 新增字段 | User.notify_pref | 提醒偏好 |
| 修改 | User.email、Task.status | 加长 email；status 增加「待评审」 |
| 删除 | Task.legacy_note | 迁移后删除 |

## 待确认

```ask
提醒先做哪一种渠道？
* 站内提醒 | 只写 Notification 表，最快上线
- 站内 + 邮件 | 需要再加发送队列
```
