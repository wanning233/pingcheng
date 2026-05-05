# 拼程 · 后端接口文档

---

## 统一规范

### 请求

- Base URL：`https://api.pingcheng.com/v1`
- 认证：Header `Authorization: Bearer {token}`
- Content-Type：`application/json`

### 响应

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

| code | 含义 |
|------|------|
| 0 | 成功 |
| 401 | 未登录 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 422 | 参数错误 |
| 500 | 服务器错误 |

---

## 一、用户模块

### 1.1 微信登录

`POST /auth/wechat`

**Request**
```json
{
  "code": "wx_auth_code",
  "userInfo": {
    "nickName": "林小夏",
    "avatarUrl": "https://..."
  }
}
```

**Response**
```json
{
  "userId": "u_abc123",
  "token": "eyJ...",
  "userInfo": {
    "id": "u_abc123",
    "name": "林小夏",
    "avatar": "https://..."
  }
}
```

---

### 1.2 获取用户信息

`GET /users/{userId}`

**Response**
```json
{
  "id": "u_abc123",
  "name": "林小夏",
  "avatar": "https://...",
  "createdAt": "2026-05-01T10:00:00Z"
}
```

---

## 二、行程模块

### 2.1 创建行程

`POST /trips`

**Request**
```json
{
  "area": "五角场",
  "city": "上海",
  "endTime": "21:00",
  "budgetPerPerson": 150,
  "peopleCount": 4,
  "notes": "有老人同行",
  "tags": ["朋友聚会", "省钱优先"],
  "categories": ["火锅", "拍照"]
}
```

**Response**
```json
{
  "tripId": "t_xyz789",
  "inviteCode": "ABC123",
  "status": "created",
  "createdAt": "2026-05-03T14:00:00Z"
}
```

---

### 2.2 生成路线

`POST /trips/{tripId}/generate-routes`

所有成员偏好收集完成后调用，AI 生成 3 条候选路线。

**Request**
```json
{
  "tripId": "t_xyz789"
}
```

**Response**
```json
[
  {
    "id": "route-1",
    "name": "拍照出片线",
    "budgetPerPerson": 132,
    "totalMinutes": 270,
    "walkDistanceM": 1200,
    "queueRisk": "low",
    "isAiRecommended": true,
    "highlights": ["低排队", "轻松漫步", "网红咖啡"],
    "stops": [ /* Stop[] 见下方数据结构 */ ]
  }
]
```

---

### 2.3 选择路线

`POST /trips/{tripId}/select-route`

**Request**
```json
{
  "routeId": "route-1"
}
```

**Response**
```json
{
  "tripId": "t_xyz789",
  "selectedRouteId": "route-1",
  "status": "route_selected"
}
```

---

### 2.4 获取路线详情

`GET /trips/{tripId}/routes/{routeId}`

**Response**
```json
{
  "id": "route-1",
  "name": "拍照出片线",
  "budgetPerPerson": 132,
  "totalMinutes": 270,
  "walkDistanceM": 1200,
  "stops": [
    {
      "id": "stop-1",
      "name": "网红鸳鸯锅",
      "category": "餐厅",
      "coord": { "lat": 31.2990, "lng": 121.5120 },
      "arriveTime": "14:00",
      "stayMinutes": 100,
      "status": "done",
      "estimatedQueueMinutes": 58,
      "queueRisk": "high",
      "tags": ["鸳鸯锅", "网红", "辣不辣都有"],
      "ugcHighlight": "排队值得，锅底超香",
      "planB": [
        {
          "id": "pb-1",
          "name": "弄堂里湖南菜",
          "reason": "评分4.8，现在几乎不用等",
          "rating": 4.8,
          "pricePerPerson": 68,
          "estimatedQueueMinutes": 5,
          "walkMinutesFromOriginal": 6
        }
      ]
    }
  ]
}
```

---

### 2.5 更新行程进度

`PUT /trips/{tripId}/progress`

**Request**
```json
{
  "currentStopIndex": 1,
  "completedStops": ["stop-1"]
}
```

**Response**
```json
{
  "tripId": "t_xyz789",
  "currentStopIndex": 1,
  "completedStops": ["stop-1"],
  "updatedAt": "2026-05-03T16:00:00Z"
}
```

---

### 2.6 结束行程

`POST /trips/{tripId}/complete`

**Request**
```json
{
  "actualEndTime": "20:48",
  "feedback": "很顺利！"
}
```

**Response**
```json
{
  "tripId": "t_xyz789",
  "status": "completed",
  "completedAt": "2026-05-03T20:48:00Z"
}
```

---

## 三、邀请模块

### 3.1 获取邀请详情

`GET /invites/{inviteCode}`

用户打开邀请链接时调用。

**Response**
```json
{
  "inviteCode": "ABC123",
  "tripId": "t_xyz789",
  "tripName": "五角场下午局",
  "initiator": {
    "id": "u_abc123",
    "name": "林小夏",
    "avatar": "https://..."
  },
  "message": "最近发现几个超棒的新地方，大家一起去！",
  "date": "5月3日（周日）下午",
  "area": "五角场 · 上海",
  "maxPeople": 4,
  "joinedCount": 3,
  "joinedMembers": [
    {
      "id": "u_abc123",
      "name": "林小夏",
      "avatar": "https://...",
      "status": "done"
    }
  ],
  "status": "active",
  "expiresAt": "2026-05-04T14:00:00Z"
}
```

---

### 3.2 加入行程

`POST /invites/{inviteCode}/join`

**Request**
```json
{
  "userId": "u_def456"
}
```

**Response**
```json
{
  "tripId": "t_xyz789",
  "memberId": "m_001",
  "status": "pending_preferences"
}
```

---

### 3.3 获取我发出的邀请列表

`GET /users/{userId}/sent-invites`

**Response**
```json
[
  {
    "id": "inv-1",
    "tripName": "五角场下午局",
    "area": "五角场 · 上海",
    "date": "5月3日（周日）下午",
    "joinedCount": 3,
    "maxPeople": 4,
    "status": "active"
  }
]
```

---

## 四、偏好模块

### 4.1 获取偏好问卷

`GET /preferences/questions`

**Response**
```json
[
  {
    "id": "taste",
    "question": "口味偏好？",
    "options": [
      { "id": "spicy",    "label": "必须辣",   "icon": "chili"  },
      { "id": "mild",     "label": "微辣可以", "icon": "smile"  },
      { "id": "no_spicy", "label": "不吃辣",   "icon": "no"     },
      { "id": "any",      "label": "都行",     "icon": "peace"  }
    ]
  },
  {
    "id": "budget",
    "question": "人均预算？",
    "options": [
      { "id": "under100", "label": "100以内", "icon": "budget-low"  },
      { "id": "under150", "label": "150以内", "icon": "budget-mid"  },
      { "id": "under200", "label": "200以内", "icon": "budget-high" },
      { "id": "any",      "label": "不限制",  "icon": "budget-any"  }
    ]
  },
  {
    "id": "energy",
    "question": "体力状态？",
    "options": [
      { "id": "high",   "label": "体力充沛",   "icon": "energy-high" },
      { "id": "medium", "label": "一般般",     "icon": "energy-mid"  },
      { "id": "low",    "label": "能少走就少走","icon": "energy-low"  },
      { "id": "knee",   "label": "膝盖不好",   "icon": "energy-knee" }
    ]
  },
  {
    "id": "vibe",
    "question": "今天想要？",
    "options": [
      { "id": "photo",   "label": "出片出片",   "icon": "vibe-photo"   },
      { "id": "eat",     "label": "吃吃吃",     "icon": "vibe-eat"     },
      { "id": "chill",   "label": "放松躺平",   "icon": "vibe-chill"   },
      { "id": "explore", "label": "探索新地方", "icon": "vibe-explore" }
    ]
  }
]
```

---

### 4.2 提交偏好

`POST /trips/{tripId}/members/{memberId}/preferences`

**Request**
```json
{
  "answers": {
    "taste":  "spicy",
    "budget": "under150",
    "energy": "high",
    "vibe":   "photo"
  }
}
```

**Response**
```json
{
  "memberId": "m_001",
  "status": "preferences_saved",
  "allMembersDone": false,
  "conflicts": [
    {
      "id": "c_001",
      "type": "taste",
      "members": ["m_001", "m_002"],
      "description": "小林不吃辣，但林小夏必须吃辣"
    }
  ]
}
```

---

### 4.3 获取成员偏好与冲突

`GET /trips/{tripId}/members`

**Response**
```json
{
  "members": [
    {
      "id": "m_001",
      "name": "林小夏",
      "avatar": "https://...",
      "isHost": true,
      "status": "done",
      "preferences": {
        "taste": "spicy",
        "budget": "under150",
        "energy": "high",
        "vibe": "photo"
      }
    }
  ],
  "conflicts": [
    {
      "id": "c_001",
      "type": "taste",
      "members": ["m_001", "m_002"],
      "description": "小林不吃辣，但林小夏必须吃辣",
      "resolution": "找一家鸳鸯锅，辣不辣都能点",
      "resolved": true
    }
  ]
}
```

---

## 五、AI 助手模块

### 5.1 发起对话

`POST /trips/{tripId}/ai-chat`

流式响应（SSE）或普通 JSON，由 `stream` 参数控制。

**Request**
```json
{
  "message": "换一家",
  "currentStopId": "stop-1",
  "routeId": "route-1",
  "stream": true
}
```

**Response（非流式）**
```json
{
  "messageId": "msg_001",
  "response": "刚查了一下，网红鸳鸯锅目前排队58分钟，我找到一个不错的替代方案——",
  "actionType": "route_diff",
  "suggestions": ["排队多久？", "换一家", "修改预算", "提前结束"]
}
```

---

### 5.2 获取替代方案

`GET /stops/{stopId}/alternatives`

**Query Params**
```
tripId=t_xyz789
&lat=31.2990&lng=121.5120
&budgetPerPerson=150
&endTime=21:00
```

**Response**
```json
[
  {
    "id": "alt-1",
    "name": "弄堂里湖南菜",
    "category": "湘菜 · 小馆子",
    "rating": 4.8,
    "pricePerPerson": 68,
    "estimatedQueueMinutes": 5,
    "walkMinutesFromOriginal": 6,
    "reason": "评分4.8，人均68元，现在几乎不用等",
    "coord": { "lat": 31.2985, "lng": 121.5110 }
  }
]
```

---

### 5.3 获取路线变更对比

`POST /trips/{tripId}/route-diff`

**Request**
```json
{
  "currentStopId": "stop-1",
  "alternativeStopId": "alt-1",
  "routeId": "route-1"
}
```

**Response**
```json
{
  "timeStatus": "rescued",
  "sessionDeadline": "21:00",
  "currentStop": {
    "id": "stop-1",
    "name": "网红鸳鸯锅",
    "rating": 4.8,
    "estimatedQueueMinutes": 58,
    "pricePerPerson": 85,
    "estimatedEndTime": "21:15"
  },
  "planBStop": {
    "id": "alt-1",
    "name": "弄堂里湖南菜",
    "rating": 4.6,
    "estimatedQueueMinutes": 5,
    "pricePerPerson": 68,
    "estimatedEndTime": "20:48"
  },
  "gains": {
    "savedMinutes": 53,
    "savedPricePerPerson": 17
  },
  "costs": {
    "ratingDrop": 0.2,
    "extraWalkMeters": 420,
    "extraWalkMinutes": 6
  },
  "aiRecommendation": "强烈建议换。原路线排队58分钟，行程将在21:15结束，超出截止时间15分钟。换成弄堂里湖南菜，等位仅5分钟，能在20:48结束，为你们抢回12分钟。"
}
```

---

### 5.4 确认路线变更

`PUT /trips/{tripId}/swap-stop`

队长确认后调用，后端同步通知其他成员。

**Request**
```json
{
  "currentStopId": "stop-1",
  "newStopId": "alt-1",
  "routeId": "route-1"
}
```

**Response**
```json
{
  "tripId": "t_xyz789",
  "updatedStops": [ /* 更新后完整 Stop[] */ ],
  "notified": {
    "memberIds": ["m_002", "m_003", "m_004"],
    "sentAt": "2026-05-03T18:22:00Z"
  }
}
```

---

## 六、实时同步

### 6.1 WebSocket

`WS /trips/{tripId}/sync?token={token}`

连接后服务端推送以下事件：

```json
{ "type": "member_status_changed", "data": { "memberId": "m_002", "status": "done" } }
{ "type": "route_changed",         "data": { "newStopId": "alt-1", "changedBy": "m_001" } }
{ "type": "stop_completed",        "data": { "stopId": "stop-1", "completedBy": "m_001" } }
{ "type": "ai_message",            "data": { "content": "路线已更新，步行6分钟可到" } }
```

---

## 七、数据结构速查

### Trip
| 字段 | 类型 | 说明 |
|------|------|------|
| tripId | string | 行程ID |
| area | string | 目的地 |
| city | string | 城市 |
| endTime | string | HH:MM |
| budgetPerPerson | number | 人均预算 |
| peopleCount | number | 人数 |
| notes | string | 特殊要求 |
| status | enum | created / route_selected / started / completed |
| inviteCode | string | 邀请码 |
| selectedRouteId | string | 已选路线ID |

### Stop
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 站点ID |
| name | string | 名称 |
| category | string | 分类 |
| coord | {lat, lng} | 坐标 |
| arriveTime | string | 到达时间 HH:MM |
| stayMinutes | number | 停留时长 |
| status | enum | done / current / upcoming |
| estimatedQueueMinutes | number | 预估排队分钟 |
| queueRisk | enum | low / medium / high |
| tags | string[] | 标签 |
| ugcHighlight | string | UGC精选评价 |
| planB | PlanBItem[] | 替代方案列表 |

### Member
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 成员ID |
| name | string | 昵称 |
| avatar | string | 头像URL |
| isHost | boolean | 是否是发起人（队长） |
| status | enum | pending / filling / done |
| preferences | object | taste/budget/energy/vibe |

---

## 八、接口汇总

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 用户 | POST | /auth/wechat | 微信登录 |
| 用户 | GET | /users/{userId} | 获取用户信息 |
| 行程 | POST | /trips | 创建行程 |
| 行程 | POST | /trips/{tripId}/generate-routes | 生成路线 |
| 行程 | POST | /trips/{tripId}/select-route | 选择路线 |
| 行程 | GET | /trips/{tripId}/routes/{routeId} | 路线详情 |
| 行程 | PUT | /trips/{tripId}/progress | 更新进度 |
| 行程 | POST | /trips/{tripId}/complete | 结束行程 |
| 邀请 | GET | /invites/{inviteCode} | 邀请详情 |
| 邀请 | POST | /invites/{inviteCode}/join | 加入行程 |
| 邀请 | GET | /users/{userId}/sent-invites | 我的邀请 |
| 偏好 | GET | /preferences/questions | 问卷题目 |
| 偏好 | POST | /trips/{tripId}/members/{memberId}/preferences | 提交偏好 |
| 偏好 | GET | /trips/{tripId}/members | 成员与冲突 |
| AI | POST | /trips/{tripId}/ai-chat | 对话 |
| AI | GET | /stops/{stopId}/alternatives | 替代方案 |
| AI | POST | /trips/{tripId}/route-diff | 变更对比 |
| AI | PUT | /trips/{tripId}/swap-stop | 确认换站 |
| 实时 | WS | /trips/{tripId}/sync | 实时同步 |
