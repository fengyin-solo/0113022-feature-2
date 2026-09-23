/**
 * 全生命周期前端数据层（当前后端接口未就绪，页面使用 mock 数据）。
 * 包含多井分阶段数据、时间边界校验与数据克隆，供单井视图与阶段对比页共用。
 */

export interface Well {
  id: number
  wellCode: string
  wellName: string
  blockName: string
  status: string
}

export interface StageMetric {
  name: string
  value: string
  icon: string
  color: string
}

export interface StageEvent {
  id: string
  title: string
  description: string
  time: string
  type: string
  color: string
}

export interface StageDocument {
  name: string
  type: string
  size: string
  uploadTime: string
}

export interface Stage {
  id: string
  name: string
  status: string
  startDate: string
  endDate?: string
  manager?: string
  progress: number
  duration?: number
  metrics?: StageMetric[]
  events?: StageEvent[]
  documents?: StageDocument[]
}

/** 时间边界校验结果 */
export interface StageTimeStatus {
  valid: boolean
  message?: string
}

const WELL_LIST: Well[] = [
  { id: 1, wellCode: 'A-001', wellName: 'A-01井', blockName: '胜利油田', status: '生产中' },
  { id: 2, wellCode: 'B-003', wellName: 'B-03井', blockName: '胜利油田', status: '钻井中' },
  { id: 3, wellCode: 'C-002', wellName: 'C-02井', blockName: '大庆油田', status: '生产中' },
  { id: 4, wellCode: 'D-005', wellName: 'D-05井', blockName: '大庆油田', status: '待建档' }
]

const STAGES_A01: Stage[] = [
  {
    id: 'exploration',
    name: '勘探规划',
    status: 'completed',
    startDate: '2023-01-15',
    endDate: '2023-03-20',
    manager: '张工程师',
    progress: 100,
    metrics: [
      { name: '物探面积', value: '150 km²', icon: 'Compass', color: '#3b82f6' },
      { name: '预测储量', value: '500 万吨', icon: 'DataLine', color: '#8b5cf6' },
      { name: '探井数量', value: '5 口', icon: 'Position', color: '#22c55e' }
    ],
    events: [
      { id: 'e1', title: '三维地震勘探启动', description: '完成三维地震数据采集工作', time: '2023-01-20', type: 'primary', color: '#3b82f6' },
      { id: 'e2', title: '储量评估完成', description: '完成石油储量评估报告', time: '2023-02-28', type: 'success', color: '#22c55e' },
      { id: 'e3', title: '井位设计评审通过', description: '井位设计方案通过专家评审', time: '2023-03-15', type: 'success', color: '#22c55e' }
    ],
    documents: [
      { name: '三维地震勘探报告.pdf', type: 'PDF', size: '15.2 MB', uploadTime: '2023-02-15' },
      { name: '储量评估报告.docx', type: 'Word', size: '8.5 MB', uploadTime: '2023-03-01' },
      { name: '井位设计图纸.dwg', type: 'CAD', size: '3.2 MB', uploadTime: '2023-03-18' }
    ]
  },
  {
    id: 'drilling',
    name: '钻井施工',
    status: 'completed',
    startDate: '2023-04-01',
    endDate: '2023-07-15',
    manager: '李工程师',
    progress: 100,
    metrics: [
      { name: '钻井深度', value: '3,500 m', icon: 'TrendCharts', color: '#f59e0b' },
      { name: '钻井周期', value: '105 天', icon: 'Clock', color: '#ef4444' },
      { name: '机械钻速', value: '8.5 m/h', icon: 'Odometer', color: '#06b6d4' }
    ],
    events: [
      { id: 'd1', title: '开钻典礼', description: '正式开始钻井作业', time: '2023-04-01', type: 'primary', color: '#3b82f6' },
      { id: 'd2', title: '二开完成', description: '完成第二开钻井作业', time: '2023-05-10', type: 'success', color: '#22c55e' },
      { id: 'd3', title: '完钻井深达到设计', description: '顺利钻达设计井深3500米', time: '2023-07-10', type: 'success', color: '#22c55e' }
    ],
    documents: [
      { name: '钻井工程设计.pdf', type: 'PDF', size: '12.8 MB', uploadTime: '2023-03-25' },
      { name: '钻井日报汇总.xlsx', type: 'Excel', size: '4.2 MB', uploadTime: '2023-07-16' },
      { name: '完井报告.pdf', type: 'PDF', size: '18.5 MB', uploadTime: '2023-07-20' }
    ]
  },
  {
    id: 'completion',
    name: '完井测试',
    status: 'completed',
    startDate: '2023-07-20',
    endDate: '2023-09-10',
    manager: '王工程师',
    progress: 100,
    metrics: [
      { name: '测试层数', value: '8 层', icon: 'CopyDocument', color: '#3b82f6' },
      { name: '日产油量', value: '120 吨', icon: 'TrendCharts', color: '#22c55e' },
      { name: '地层压力', value: '35.2 MPa', icon: 'DataAnalysis', color: '#8b5cf6' }
    ],
    events: [
      { id: 'c1', title: '固井作业完成', description: '完成油层套管固井作业', time: '2023-07-25', type: 'success', color: '#22c55e' },
      { id: 'c2', title: '射孔作业完成', description: '成功射开目的层段', time: '2023-08-05', type: 'success', color: '#22c55e' },
      { id: 'c3', title: '试油成果达标', description: '试油产量达到预期目标', time: '2023-09-05', type: 'success', color: '#22c55e' }
    ],
    documents: [
      { name: '完井测试方案.pdf', type: 'PDF', size: '6.3 MB', uploadTime: '2023-07-18' },
      { name: '试油成果报告.pdf', type: 'PDF', size: '9.8 MB', uploadTime: '2023-09-12' }
    ]
  },
  {
    id: 'production',
    name: '生产运营',
    status: 'in_progress',
    startDate: '2023-09-15',
    manager: '赵工程师',
    progress: 45,
    metrics: [
      { name: '累计产油', value: '15,680 吨', icon: 'TrendCharts', color: '#22c55e' },
      { name: '累计产气', value: '850 万方', icon: 'Wind', color: '#f59e0b' },
      { name: '生产时率', value: '98.5%', icon: 'Clock', color: '#3b82f6' }
    ],
    events: [
      { id: 'p1', title: '投产成功', description: '正式投入生产运营', time: '2023-09-15', type: 'primary', color: '#3b82f6' },
      { id: 'p2', title: '首次措施作业', description: '完成首次压裂增产措施', time: '2024-01-20', type: 'warning', color: '#f59e0b' },
      { id: 'p3', title: '产量稳产达标', description: '连续3个月产量稳定', time: '2024-03-01', type: 'success', color: '#22c55e' }
    ],
    documents: [
      { name: '生产运行日报.xlsx', type: 'Excel', size: '2.5 MB', uploadTime: '2024-05-10' },
      { name: '油井工况分析报告.pdf', type: 'PDF', size: '5.8 MB', uploadTime: '2024-04-15' }
    ]
  },
  {
    id: 'maintenance',
    name: '修井作业',
    status: 'pending',
    startDate: '2026-06-01',
    manager: '待分配',
    progress: 0,
    metrics: [
      { name: '计划作业次数', value: '3 次', icon: 'Tools', color: '#64748b' },
      { name: '预计周期', value: '15 天', icon: 'Clock', color: '#64748b' },
      { name: '预算费用', value: '500 万', icon: 'Money', color: '#64748b' }
    ],
    events: [],
    documents: []
  },
  {
    id: 'abandonment',
    name: '废弃处置',
    status: 'pending',
    startDate: '2033-01-01',
    manager: '待分配',
    progress: 0,
    metrics: [
      { name: '预计年限', value: '10 年', icon: 'Clock', color: '#64748b' },
      { name: '环保等级', value: '一级', icon: 'Warning', color: '#64748b' },
      { name: '残值回收', value: '80%', icon: 'Coin', color: '#64748b' }
    ],
    events: [],
    documents: []
  }
]

const STAGES_B03: Stage[] = [
  {
    id: 'exploration',
    name: '勘探规划',
    status: 'completed',
    startDate: '2024-02-10',
    endDate: '2024-04-05',
    manager: '孙工程师',
    progress: 100,
    metrics: [
      { name: '物探面积', value: '96 km²', icon: 'Compass', color: '#3b82f6' },
      { name: '预测储量', value: '320 万吨', icon: 'DataLine', color: '#8b5cf6' },
      { name: '探井数量', value: '3 口', icon: 'Position', color: '#22c55e' }
    ],
    events: [
      { id: 'b-e1', title: '二维地震普查完成', description: '完成区域二维地震测线采集', time: '2024-02-25', type: 'primary', color: '#3b82f6' },
      { id: 'b-e2', title: '井位设计评审通过', description: '井位设计方案通过专家评审', time: '2024-03-28', type: 'success', color: '#22c55e' }
    ],
    documents: [
      { name: '区域地质评价报告.pdf', type: 'PDF', size: '11.4 MB', uploadTime: '2024-04-02' }
    ]
  },
  {
    id: 'drilling',
    name: '钻井施工',
    status: 'in_progress',
    startDate: '2024-05-08',
    manager: '周工程师',
    progress: 60,
    metrics: [
      { name: '钻井深度', value: '2,100 m', icon: 'TrendCharts', color: '#f59e0b' },
      { name: '钻井周期', value: '62 天', icon: 'Clock', color: '#ef4444' },
      { name: '机械钻速', value: '7.9 m/h', icon: 'Odometer', color: '#06b6d4' }
    ],
    events: [
      { id: 'b-d1', title: '开钻', description: '一开钻进作业开始', time: '2024-05-08', type: 'primary', color: '#3b82f6' },
      { id: 'b-d2', title: '二开完成', description: '完成第二开钻井作业', time: '2024-06-18', type: 'success', color: '#22c55e' },
      { id: 'b-d3', title: '钻遇复杂地层', description: '发生一次井漏，处置后恢复钻进', time: '2024-07-02', type: 'warning', color: '#f59e0b' }
    ],
    documents: [
      { name: '钻井工程设计.pdf', type: 'PDF', size: '10.6 MB', uploadTime: '2024-04-28' },
      { name: '钻井日报汇总.xlsx', type: 'Excel', size: '3.1 MB', uploadTime: '2024-07-09' }
    ]
  },
  {
    id: 'completion',
    name: '完井测试',
    status: 'pending',
    startDate: '2024-09-01',
    manager: '待分配',
    progress: 0,
    metrics: [
      { name: '计划测试层数', value: '6 层', icon: 'CopyDocument', color: '#64748b' },
      { name: '设计日产油', value: '85 吨', icon: 'TrendCharts', color: '#64748b' },
      { name: '预测地层压力', value: '31.8 MPa', icon: 'DataAnalysis', color: '#64748b' }
    ],
    events: [],
    documents: []
  },
  {
    id: 'production',
    name: '生产运营',
    status: 'pending',
    startDate: '2024-11-01',
    manager: '待分配',
    progress: 0,
    metrics: [
      { name: '规划年产油', value: '2.8 万吨', icon: 'TrendCharts', color: '#64748b' },
      { name: '设计生产时率', value: '97.0%', icon: 'Clock', color: '#64748b' }
    ],
    events: [],
    documents: []
  }
]

// C-02井：完井测试阶段结束时间早于开始时间，用于演示时间边界不合法场景
const STAGES_C02: Stage[] = [
  {
    id: 'exploration',
    name: '勘探规划',
    status: 'completed',
    startDate: '2022-06-01',
    endDate: '2022-08-20',
    manager: '吴工程师',
    progress: 100,
    metrics: [
      { name: '物探面积', value: '210 km²', icon: 'Compass', color: '#3b82f6' },
      { name: '预测储量', value: '680 万吨', icon: 'DataLine', color: '#8b5cf6' },
      { name: '探井数量', value: '6 口', icon: 'Position', color: '#22c55e' }
    ],
    events: [
      { id: 'c-e1', title: '三维地震勘探启动', description: '完成满覆盖三维采集', time: '2022-06-10', type: 'primary', color: '#3b82f6' },
      { id: 'c-e2', title: '储量评估完成', description: '探明地质储量通过评审', time: '2022-08-12', type: 'success', color: '#22c55e' }
    ],
    documents: [
      { name: '三维地震勘探报告.pdf', type: 'PDF', size: '18.7 MB', uploadTime: '2022-08-15' },
      { name: '储量评估报告.docx', type: 'Word', size: '9.2 MB', uploadTime: '2022-08-22' }
    ]
  },
  {
    id: 'drilling',
    name: '钻井施工',
    status: 'completed',
    startDate: '2022-09-01',
    endDate: '2022-12-18',
    manager: '郑工程师',
    progress: 100,
    metrics: [
      { name: '钻井深度', value: '4,200 m', icon: 'TrendCharts', color: '#f59e0b' },
      { name: '钻井周期', value: '108 天', icon: 'Clock', color: '#ef4444' },
      { name: '机械钻速', value: '9.2 m/h', icon: 'Odometer', color: '#06b6d4' }
    ],
    events: [
      { id: 'c-d1', title: '开钻', description: '正式开始钻井作业', time: '2022-09-01', type: 'primary', color: '#3b82f6' },
      { id: 'c-d2', title: '完钻井深达到设计', description: '顺利钻达设计井深4200米', time: '2022-12-15', type: 'success', color: '#22c55e' }
    ],
    documents: [
      { name: '钻井工程设计.pdf', type: 'PDF', size: '13.5 MB', uploadTime: '2022-08-25' },
      { name: '完井报告.pdf', type: 'PDF', size: '21.3 MB', uploadTime: '2022-12-22' }
    ]
  },
  {
    // 时间边界不合法：endDate 早于 startDate
    id: 'completion',
    name: '完井测试',
    status: 'completed',
    startDate: '2023-02-10',
    endDate: '2023-01-25',
    manager: '冯工程师',
    progress: 100,
    metrics: [
      { name: '测试层数', value: '10 层', icon: 'CopyDocument', color: '#3b82f6' },
      { name: '日产油量', value: '156 吨', icon: 'TrendCharts', color: '#22c55e' },
      { name: '地层压力', value: '38.6 MPa', icon: 'DataAnalysis', color: '#8b5cf6' }
    ],
    events: [
      { id: 'c-c1', title: '固井作业完成', description: '完成油层套管固井作业', time: '2023-01-20', type: 'success', color: '#22c55e' },
      { id: 'c-c2', title: '试油成果达标', description: '试油产量超过预期目标', time: '2023-02-05', type: 'success', color: '#22c55e' }
    ],
    documents: [
      { name: '试油成果报告.pdf', type: 'PDF', size: '10.4 MB', uploadTime: '2023-02-08' }
    ]
  },
  {
    id: 'production',
    name: '生产运营',
    status: 'in_progress',
    startDate: '2023-03-01',
    manager: '陈工程师',
    progress: 72,
    metrics: [
      { name: '累计产油', value: '28,420 吨', icon: 'TrendCharts', color: '#22c55e' },
      { name: '累计产气', value: '1,260 万方', icon: 'Wind', color: '#f59e0b' },
      { name: '生产时率', value: '99.1%', icon: 'Clock', color: '#3b82f6' }
    ],
    events: [
      { id: 'c-p1', title: '投产成功', description: '正式投入生产运营', time: '2023-03-01', type: 'primary', color: '#3b82f6' },
      { id: 'c-p2', title: '首次措施作业', description: '完成酸化压裂增产', time: '2023-08-16', type: 'warning', color: '#f59e0b' },
      { id: 'c-p3', title: '产量稳产达标', description: '连续6个月产量稳定', time: '2024-01-10', type: 'success', color: '#22c55e' }
    ],
    documents: [
      { name: '生产运行日报.xlsx', type: 'Excel', size: '4.6 MB', uploadTime: '2024-05-12' },
      { name: '油井工况分析报告.pdf', type: 'PDF', size: '7.2 MB', uploadTime: '2024-04-20' }
    ]
  }
]

// 按井存放阶段数据；未配置（如 D-05井）即表示阶段数据为空
const STAGE_MAP: Record<number, Stage[]> = {
  1: STAGES_A01,
  2: STAGES_B03,
  3: STAGES_C02
}

const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data))

/** 获取井位列表（副本） */
export const getMockWellList = (): Well[] => clone(WELL_LIST)

/**
 * 获取某口井的生命周期阶段（深拷贝，避免视图间相互污染）。
 * 阶段数据为空（井不存在或尚未建档）时返回空数组。
 */
export const getMockLifecycleStages = (wellId: number): Stage[] => {
  return STAGE_MAP[wellId] ? clone(STAGE_MAP[wellId]) : []
}

/** 阶段时间边界校验：日期需可解析；有结束时间时结束不得早于开始 */
export const validateStageTime = (stage: Stage): StageTimeStatus => {
  if (!stage.startDate) {
    return { valid: false, message: '缺少开始时间' }
  }
  const start = new Date(stage.startDate)
  if (Number.isNaN(start.getTime())) {
    return { valid: false, message: '开始时间格式不合法' }
  }
  if (stage.endDate) {
    const end = new Date(stage.endDate)
    if (Number.isNaN(end.getTime())) {
      return { valid: false, message: '结束时间格式不合法' }
    }
    if (end.getTime() < start.getTime()) {
      return { valid: false, message: '结束时间早于开始时间' }
    }
  }
  return { valid: true }
}

/** 阶段持续天数；进行中（无结束时间）或时间边界不合法时返回 null */
export const getStageDays = (stage: Stage): number | null => {
  if (!stage.endDate || !validateStageTime(stage).valid) return null
  const start = new Date(stage.startDate).getTime()
  const end = new Date(stage.endDate).getTime()
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
}

/** 从指标值中提取数值部分（如 '15,680 吨' -> 15680），无法提取时返回 null */
export const parseMetricNumber = (value: string): number | null => {
  if (value == null) return null
  const matched = String(value).replace(/,/g, '').match(/-?\d+(\.\d+)?/)
  return matched ? Number(matched[0]) : null
}
