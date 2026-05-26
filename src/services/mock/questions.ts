// src/services/mock/questions.ts

export interface QuestionOption {
  id: string
  label: string
}

export interface Question {
  id: string
  text: string
  multi: boolean
  options: QuestionOption[]
}

// ── 目的地特色问题库 ──────────────────────────────────────────
const DESTINATION_QUESTIONS: Record<string, Question[]> = {
  景德镇: [
    {
      id: 'jdz_ceramics',
      text: '对陶瓷体验，你更倾向哪种？',
      multi: false,
      options: [
        { id: 'handson',     label: '拉坯成型这类基础动手体验' },
        { id: 'painting',    label: '彩绘挂瓷这类成品创作体验' },
        { id: 'fullprocess', label: '参观体验制瓷全流程' },
        { id: 'noceramics',  label: '不安排陶瓷体验，只看文博景点' },
      ],
    },
    {
      id: 'jdz_food',
      text: '关于当地美食，你更偏好哪种？',
      multi: false,
      options: [
        { id: 'traditional', label: '本地老字号传统赣菜馆' },
        { id: 'trendy',      label: '陶溪川/三宝蓬周边网红文艺小店' },
        { id: 'local',       label: '本地地道苍蝇馆子' },
        { id: 'snack',       label: '只吃最有代表性的特色小吃' },
      ],
    },
  ],
  西藏: [
    {
      id: 'tibet_altitude',
      text: '关于高原反应，你的准备情况是？',
      multi: false,
      options: [
        { id: 'prepared',  label: '已有高原旅行经验，适应良好' },
        { id: 'medicine',  label: '已备好高反药物，会慢慢适应' },
        { id: 'slow',      label: '首次进藏，希望行程节奏放慢' },
        { id: 'worry',     label: '比较担心，希望路线避开高海拔点' },
      ],
    },
    {
      id: 'tibet_focus',
      text: '此次西藏行，最想体验的是？',
      multi: true,
      options: [
        { id: 'temple',    label: '寺庙与宗教文化' },
        { id: 'landscape', label: '高原自然风光' },
        { id: 'folk',      label: '藏族民俗与日常生活' },
        { id: 'photo',     label: '摄影与星空拍摄' },
      ],
    },
  ],
  三亚: [
    {
      id: 'sanya_water',
      text: '对海上项目，你的态度是？',
      multi: false,
      options: [
        { id: 'love',  label: '必须安排，越刺激越好' },
        { id: 'mild',  label: '选温和的，如浮潜/玻璃船' },
        { id: 'beach', label: '只在沙滩晒太阳，不下水' },
        { id: 'skip',  label: '不感兴趣，以逛街美食为主' },
      ],
    },
    {
      id: 'sanya_time',
      text: '最想把时间花在哪里？',
      multi: true,
      options: [
        { id: 'resort',   label: '酒店度假区享受' },
        { id: 'oldstreet', label: '老街/免税店购物' },
        { id: 'nature',   label: '热带雨林/南山等景区' },
        { id: 'seafood',  label: '海鲜美食探索' },
      ],
    },
  ],
  成都: [
    {
      id: 'chengdu_panda',
      text: '熊猫基地打算怎么安排？',
      multi: false,
      options: [
        { id: 'morning', label: '一早去，看喂食最活跃的时段' },
        { id: 'quick',   label: '快速打卡，1小时内离开' },
        { id: 'skip',    label: '不去，更想逛街吃火锅' },
      ],
    },
    {
      id: 'chengdu_food',
      text: '成都美食怎么吃？',
      multi: true,
      options: [
        { id: 'hotpot',     label: '火锅是必须的' },
        { id: 'snack',      label: '串串/冒菜/钵钵鸡等小吃' },
        { id: 'teahouse',   label: '老茶馆坐一下午' },
        { id: 'finedining', label: '预约一家本地知名川菜馆' },
      ],
    },
  ],
  上海: [
    {
      id: 'shanghai_style',
      text: '偏好哪种上海体验？',
      multi: true,
      options: [
        { id: 'bund',      label: '外滩/陆家嘴标志性景点' },
        { id: 'lane',      label: '弄堂/老街区漫步' },
        { id: 'museum',    label: '博物馆/美术馆打卡' },
        { id: 'nightlife', label: '夜生活/酒吧街' },
      ],
    },
    {
      id: 'shanghai_transport',
      text: '出行方式偏好？',
      multi: false,
      options: [
        { id: 'metro', label: '地铁为主，省心省钱' },
        { id: 'walk',  label: '步行为主，慢慢逛' },
        { id: 'taxi',  label: '打车为主，节省时间' },
        { id: 'bike',  label: '骑行，体验城市感' },
      ],
    },
  ],
  北京: [
    {
      id: 'beijing_must',
      text: '以下必打卡，你想去哪些？',
      multi: true,
      options: [
        { id: 'palace',    label: '故宫/天安门' },
        { id: 'greatwall', label: '长城' },
        { id: 'hutong',    label: '胡同骑行/四合院' },
        { id: 'temple',    label: '天坛/颐和园' },
      ],
    },
    {
      id: 'beijing_pace',
      text: '行程节奏偏好？',
      multi: false,
      options: [
        { id: 'full',     label: '安排满满，每个景点都去' },
        { id: 'focused',  label: '精选2-3个深度游' },
        { id: 'relax',    label: '轻松为主，随走随停' },
      ],
    },
  ],
}

const UNIVERSAL_QUESTIONS: Question[] = [
  {
    id: 'universal_pace',
    text: '出行节奏偏好？',
    multi: false,
    options: [
      { id: 'tight',    label: '紧凑充实，景点全覆盖' },
      { id: 'balanced', label: '张弛有度，有休息时间' },
      { id: 'relaxed',  label: '悠闲随意，走到哪算哪' },
    ],
  },
  {
    id: 'universal_interest',
    text: '最想体验的是？',
    multi: true,
    options: [
      { id: 'food',    label: '美食探索' },
      { id: 'culture', label: '历史文化' },
      { id: 'nature',  label: '自然风光' },
      { id: 'photo',   label: '拍照出片' },
    ],
  },
]

export function getQuestionsForDestination(area: string): Question[] {
  const key = Object.keys(DESTINATION_QUESTIONS).find(k => area.includes(k))
  const specific = key ? DESTINATION_QUESTIONS[key] : []
  if (specific.length > 0) {
    return [...specific, UNIVERSAL_QUESTIONS[0]]
  }
  return UNIVERSAL_QUESTIONS
}

// ── 目的地特色描述 ─────────────────────────────────────────────
const DESTINATION_TRAITS: Record<string, string> = {
  景德镇: '千年瓷都，核心体验是陶瓷文化、三宝蓬艺术区和陶溪川创意园区',
  西藏:   '高原独特风光，主要体验寺庙文化、自然风光和藏族民俗',
  三亚:   '海滨度假胜地，可安排海上项目、免税购物和热带景区',
  成都:   '美食之都，熊猫基地、宽窄巷子、火锅和茶馆是标志性体验',
  上海:   '国际都市，外滩、弄堂、博物馆和夜生活各有特色',
  北京:   '历史古都，故宫、长城、胡同和四合院是核心体验',
  杭州:   '以西湖为核心，可延伸到灵隐、龙井、古镇和江南美食',
  厦门:   '鼓浪屿、南普陀、文艺小店和海鲜是亮点',
  重庆:   '山城立体感强，洪崖洞、磁器口、火锅和网红打卡地是特色',
  西安:   '十三朝古都，兵马俑、城墙、回民街和古迹是核心体验',
}

// ── 根据首页信息 + 追问答案构建完整 Prompt ────────────────────
interface SessionLike {
  area?: string
  sceneTags?: string[]
  peopleCount?: number
  budgetPerPerson?: number
  startTime?: string
  endTime?: string
  notes?: string
}

export function buildPromptFromAnswers(
  session: SessionLike,
  questions: Question[],
  answers: Record<string, string[]>,
  customInputs: Record<string, string>,
): string {
  const {
    area = '',
    sceneTags = [],
    peopleCount = 2,
    budgetPerPerson,
    startTime = '',
    endTime = '',
    notes = '',
  } = session

  const lines: string[] = []

  // 目的地
  const traitKey = Object.keys(DESTINATION_TRAITS).find(k => area.includes(k))
  const traitDesc = traitKey ? DESTINATION_TRAITS[traitKey] : ''
  lines.push(`我想去${area || '当地'}${traitDesc ? `（${traitDesc}）` : ''}。`)

  // 人数 + 场景
  const sceneStr = sceneTags.length > 0 ? `，出行主题是${sceneTags.join('、')}` : ''
  lines.push(`一共 ${peopleCount} 人出行${sceneStr}。`)

  // 时间
  if (startTime && endTime) {
    lines.push(`计划 ${startTime} 出发，${endTime} 结束。`)
  } else if (endTime) {
    lines.push(`计划 ${endTime} 前结束行程。`)
  }

  // 预算
  if (budgetPerPerson && budgetPerPerson < 999) {
    lines.push(`人均预算 ${budgetPerPerson} 元以内。`)
  }

  // 追问答案
  const answerLines: string[] = []
  questions.forEach(q => {
    const selected = answers[q.id] ?? []
    const custom = customInputs[q.id]?.trim()
    const selectedLabels = selected.map(id => q.options.find(o => o.id === id)?.label).filter(Boolean)
    if (custom) selectedLabels.push(custom)
    if (selectedLabels.length > 0) {
      answerLines.push(`${q.text.replace('？', '')}：${selectedLabels.join('、')}`)
    }
  })
  if (answerLines.length > 0) {
    lines.push('\n偏好补充：')
    answerLines.forEach(l => lines.push(`· ${l}`))
  }

  // 备注
  if (notes?.trim()) {
    lines.push(`\n其他需求：${notes.trim()}`)
  }

  lines.push('\n请根据以上信息，为我规划最适合的出行路线，包含具体地点、游览顺序和时间安排。')

  return lines.join('\n')
}
