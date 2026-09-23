// 全生命周期模拟数据（后端接口未接入前使用，与其他页面的内联 mock 方式保持一致）

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

export interface StageTimeIssue {
  stageId: string
  reason: string
}

export interface TrendData {
  xData: string[]
  series: Array<{ name: string; data: number[]; color: string }>
}

const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data))

export const wellListMock: Well[] = [
  { id: 1, wellCode: 'A-001', wellName: 'A-01井', blockName: '胜利油田', status: '生产中' },
  { id: 2, wellCode: 'B-003', wellName: 'B-03井', blockName: '胜利油田', status: '钻井中' },
  { id: 3, wellCode: 'C-002', wellName: 'C-02井', blockName: '孤岛油田', status: '生产中' },
  { id: 4, wellCode: 'D-007', wellName: 'D-07井', blockName: '孤东油田', status: '关停井' }
]

const wellStageMap: Record<number, Stage[]> = {
  1: [
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
        { id: '1-e1', title: '三维地震勘探启动', description: '完成三维地震数据采集工作', time: '2023-01-20', type: 'primary', color: '#3b82f6' },
        { id: '1-e2', title: '储量评估完成', description: '完成石油储量评估报告', time: '2023-02-28', type: 'success', color: '#22c55e' },
        { id: '1-e3', title: '井位设计评审通过', description: '井位设计方案通过专家评审', time: '2023-03-15', type: 'success', color: '#22c55e' }
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
        { id: '1-d1', title: '开钻典礼', description: '正式开始钻井作业', time: '2023-04-01', type: 'primary', color: '#3b82f6' },
        { id: '1-d2', title: '二开完成', description: '完成第二开钻井作业', time: '2023-05-10', type: 'success', color: '#22c55e' },
        { id: '1-d3', title: '完钻井深达到设计', description: '顺利钻达设计井深3500米', time: '2023-07-10', type: 'success', color: '#22c55e' }
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
        { id: '1-c1', title: '固井作业完成', description: '完成油层套管固井作业', time: '2023-07-25', type: 'success', color: '#22c55e' },
        { id: '1-c2', title: '射孔作业完成', description: '成功射开目的层段', time: '2023-08-05', type: 'success', color: '#22c55e' },
        { id: '1-c3', title: '试油成果达标', description: '试油产量达到预期目标', time: '2023-09-05', type: 'success', color: '#22c55e' }
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
        { id: '1-p1', title: '投产成功', description: '正式投入生产运营', time: '2023-09-15', type: 'primary', color: '#3b82f6' },
        { id: '1-p2', title: '首次措施作业', description: '完成首次压裂增产措施', time: '2024-01-20', type: 'warning', color: '#f59e0b' },
        { id: '1-p3', title: '产量稳产达标', description: '连续3个月产量稳定', time: '2024-03-01', type: 'success', color: '#22c55e' }
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
  ],

  // B-03 井：正在钻井，存在两类非法时间边界——勘探结束晚于钻井开始（阶段重叠）、完井开始早于钻井预计开始，用于校验提示
  2: [
    {
      id: 'exploration',
      name: '勘探规划',
      status: 'completed',
      startDate: '2023-01-10',
      endDate: '2023-05-20',
      manager: '孙工程师',
      progress: 100,
      metrics: [
        { name: '物探面积', value: '98 km²', icon: 'Compass', color: '#3b82f6' },
        { name: '预测储量', value: '320 万吨', icon: 'DataLine', color: '#8b5cf6' },
        { name: '探井数量', value: '3 口', icon: 'Position', color: '#22c55e' }
      ],
      events: [
        { id: '2-e1', title: '三维地震勘探启动', description: '完成三维地震数据采集工作', time: '2023-03-08', type: 'primary', color: '#3b82f6' },
        { id: '2-e2', title: '储量评估完成', description: '完成石油储量评估报告', time: '2023-04-10', type: 'success', color: '#22c55e' }
      ],
      documents: [
        { name: '三维地震勘探报告.pdf', type: 'PDF', size: '11.6 MB', uploadTime: '2023-03-02' }
      ]
    },
    {
      id: 'drilling',
      name: '钻井施工',
      status: 'in_progress',
      startDate: '2023-04-01',
      manager: '李工程师',
      progress: 62,
      metrics: [
        { name: '钻井深度', value: '2,180 m', icon: 'TrendCharts', color: '#f59e0b' },
        { name: '钻井周期', value: '76 天', icon: 'Clock', color: '#ef4444' },
        { name: '机械钻速', value: '7.9 m/h', icon: 'Odometer', color: '#06b6d4' }
      ],
      events: [
        { id: '2-d1', title: '开钻典礼', description: '正式开始钻井作业', time: '2023-04-01', type: 'primary', color: '#3b82f6' },
        { id: '2-d2', title: '二开完成', description: '完成第二开钻井作业', time: '2023-06-18', type: 'success', color: '#22c55e' }
      ],
      documents: [
        { name: '钻井工程设计.pdf', type: 'PDF', size: '12.1 MB', uploadTime: '2023-03-26' },
        { name: '钻井日报汇总.xlsx', type: 'Excel', size: '2.8 MB', uploadTime: '2024-06-20' }
      ]
    },
    {
      id: 'completion',
      name: '完井测试',
      status: 'pending',
      startDate: '2024-08-01',
      endDate: '2024-07-20',
      manager: '待分配',
      progress: 0,
      metrics: [
        { name: '计划测试层数', value: '6 层', icon: 'CopyDocument', color: '#64748b' },
        { name: '设计日产油', value: '90 吨', icon: 'TrendCharts', color: '#64748b' },
        { name: '预测地层压力', value: '32.0 MPa', icon: 'DataAnalysis', color: '#64748b' }
      ],
      events: [],
      documents: []
    },
    {
      id: 'production',
      name: '生产运营',
      status: 'pending',
      startDate: '2024-10-15',
      manager: '待分配',
      progress: 0,
      metrics: [
        { name: '规划产能', value: '2.6 万吨/年', icon: 'TrendCharts', color: '#64748b' },
        { name: '生产时率目标', value: '97.0%', icon: 'Clock', color: '#64748b' }
      ],
      events: [],
      documents: []
    },
    {
      id: 'maintenance',
      name: '修井作业',
      status: 'pending',
      startDate: '2027-06-01',
      manager: '待分配',
      progress: 0,
      metrics: [
        { name: '计划作业次数', value: '2 次', icon: 'Tools', color: '#64748b' },
        { name: '预计周期', value: '12 天', icon: 'Clock', color: '#64748b' },
        { name: '预算费用', value: '380 万', icon: 'Money', color: '#64748b' }
      ],
      events: [],
      documents: []
    },
    {
      id: 'abandonment',
      name: '废弃处置',
      status: 'pending',
      startDate: '2034-01-01',
      manager: '待分配',
      progress: 0,
      metrics: [
        { name: '预计年限', value: '10 年', icon: 'Clock', color: '#64748b' },
        { name: '环保等级', value: '一级', icon: 'Warning', color: '#64748b' },
        { name: '残值回收', value: '75%', icon: 'Coin', color: '#64748b' }
      ],
      events: [],
      documents: []
    }
  ],

  // C-02 井：生产中后期老井，阶段指标与 A-01 有差异，便于多井对比
  3: [
    {
      id: 'exploration',
      name: '勘探规划',
      status: 'completed',
      startDate: '2021-05-10',
      endDate: '2021-08-18',
      manager: '周工程师',
      progress: 100,
      metrics: [
        { name: '物探面积', value: '210 km²', icon: 'Compass', color: '#3b82f6' },
        { name: '预测储量', value: '760 万吨', icon: 'DataLine', color: '#8b5cf6' },
        { name: '探井数量', value: '8 口', icon: 'Position', color: '#22c55e' }
      ],
      events: [
        { id: '3-e1', title: '三维地震勘探启动', description: '完成三维地震数据采集工作', time: '2021-05-20', type: 'primary', color: '#3b82f6' },
        { id: '3-e2', title: '储量评估完成', description: '完成石油储量评估报告', time: '2021-07-30', type: 'success', color: '#22c55e' },
        { id: '3-e3', title: '井位设计评审通过', description: '井位设计方案通过专家评审', time: '2021-08-10', type: 'success', color: '#22c55e' }
      ],
      documents: [
        { name: '三维地震勘探报告.pdf', type: 'PDF', size: '18.9 MB', uploadTime: '2021-08-20' },
        { name: '储量评估报告.docx', type: 'Word', size: '10.2 MB', uploadTime: '2021-08-05' }
      ]
    },
    {
      id: 'drilling',
      name: '钻井施工',
      status: 'completed',
      startDate: '2021-09-01',
      endDate: '2022-01-20',
      manager: '吴工程师',
      progress: 100,
      metrics: [
        { name: '钻井深度', value: '4,200 m', icon: 'TrendCharts', color: '#f59e0b' },
        { name: '钻井周期', value: '141 天', icon: 'Clock', color: '#ef4444' },
        { name: '机械钻速', value: '7.2 m/h', icon: 'Odometer', color: '#06b6d4' }
      ],
      events: [
        { id: '3-d1', title: '开钻典礼', description: '正式开始钻井作业', time: '2021-09-01', type: 'primary', color: '#3b82f6' },
        { id: '3-d2', title: '二开完成', description: '完成第二开钻井作业', time: '2021-11-05', type: 'success', color: '#22c55e' },
        { id: '3-d3', title: '完钻井深达到设计', description: '顺利钻达设计井深4200米', time: '2022-01-15', type: 'success', color: '#22c55e' },
        { id: '3-d4', title: '钻井复杂情况处理', description: '处理井漏复杂情况一次', time: '2021-12-08', type: 'warning', color: '#f59e0b' }
      ],
      documents: [
        { name: '钻井工程设计.pdf', type: 'PDF', size: '14.5 MB', uploadTime: '2021-08-25' },
        { name: '完井报告.pdf', type: 'PDF', size: '21.3 MB', uploadTime: '2022-01-25' }
      ]
    },
    {
      id: 'completion',
      name: '完井测试',
      status: 'completed',
      startDate: '2022-02-01',
      endDate: '2022-04-12',
      manager: '王工程师',
      progress: 100,
      metrics: [
        { name: '测试层数', value: '12 层', icon: 'CopyDocument', color: '#3b82f6' },
        { name: '日产油量', value: '156 吨', icon: 'TrendCharts', color: '#22c55e' },
        { name: '地层压力', value: '38.6 MPa', icon: 'DataAnalysis', color: '#8b5cf6' }
      ],
      events: [
        { id: '3-c1', title: '固井作业完成', description: '完成油层套管固井作业', time: '2022-02-10', type: 'success', color: '#22c55e' },
        { id: '3-c2', title: '射孔作业完成', description: '成功射开目的层段', time: '2022-03-02', type: 'success', color: '#22c55e' },
        { id: '3-c3', title: '试油成果达标', description: '试油产量达到预期目标', time: '2022-04-05', type: 'success', color: '#22c55e' }
      ],
      documents: [
        { name: '完井测试方案.pdf', type: 'PDF', size: '7.1 MB', uploadTime: '2022-01-28' },
        { name: '试油成果报告.pdf', type: 'PDF', size: '11.2 MB', uploadTime: '2022-04-15' }
      ]
    },
    {
      id: 'production',
      name: '生产运营',
      status: 'in_progress',
      startDate: '2022-04-20',
      manager: '钱工程师',
      progress: 78,
      metrics: [
        { name: '累计产油', value: '42,360 吨', icon: 'TrendCharts', color: '#22c55e' },
        { name: '累计产气', value: '2,160 万方', icon: 'Wind', color: '#f59e0b' },
        { name: '生产时率', value: '96.8%', icon: 'Clock', color: '#3b82f6' }
      ],
      events: [
        { id: '3-p1', title: '投产成功', description: '正式投入生产运营', time: '2022-04-20', type: 'primary', color: '#3b82f6' },
        { id: '3-p2', title: '首次措施作业', description: '完成首次压裂增产措施', time: '2022-09-15', type: 'warning', color: '#f59e0b' },
        { id: '3-p3', title: '产量稳产达标', description: '连续12个月产量稳定', time: '2023-05-01', type: 'success', color: '#22c55e' },
        { id: '3-p4', title: '二次压裂增效', description: '实施重复压裂，日增油 12 吨', time: '2024-02-18', type: 'warning', color: '#f59e0b' }
      ],
      documents: [
        { name: '生产运行日报.xlsx', type: 'Excel', size: '6.4 MB', uploadTime: '2024-05-21' },
        { name: '油井工况分析报告.pdf', type: 'PDF', size: '8.7 MB', uploadTime: '2024-04-28' }
      ]
    },
    {
      id: 'maintenance',
      name: '修井作业',
      status: 'pending',
      startDate: '2026-03-01',
      manager: '待分配',
      progress: 0,
      metrics: [
        { name: '计划作业次数', value: '5 次', icon: 'Tools', color: '#64748b' },
        { name: '预计周期', value: '30 天', icon: 'Clock', color: '#64748b' },
        { name: '预算费用', value: '820 万', icon: 'Money', color: '#64748b' }
      ],
      events: [],
      documents: []
    },
    {
      id: 'abandonment',
      name: '废弃处置',
      status: 'pending',
      startDate: '2032-06-01',
      manager: '待分配',
      progress: 0,
      metrics: [
        { name: '预计年限', value: '8 年', icon: 'Clock', color: '#64748b' },
        { name: '环保等级', value: '二级', icon: 'Warning', color: '#64748b' },
        { name: '残值回收', value: '65%', icon: 'Coin', color: '#64748b' }
      ],
      events: [],
      documents: []
    }
  ],

  // D-07 井：关停井，暂无生命周期阶段数据
  4: []
}

export const trendDataMap: Record<string, TrendData> = {
  exploration: {
    xData: ['1月', '2月', '3月'],
    series: [
      { name: '地震覆盖面积', data: [50, 120, 150], color: '#3b82f6' },
      { name: '发现圈闭', data: [2, 5, 8], color: '#8b5cf6' }
    ]
  },
  drilling: {
    xData: ['4月', '5月', '6月', '7月'],
    series: [
      { name: '钻井进尺', data: [800, 1800, 2800, 3500], color: '#f59e0b' },
      { name: '机械钻速', data: [7.2, 8.5, 9.1, 8.8], color: '#ef4444' }
    ]
  },
  completion: {
    xData: ['7月下旬', '8月', '9月上旬'],
    series: [
      { name: '测试层数', data: [2, 5, 8], color: '#3b82f6' },
      { name: '单层产量', data: [8, 15, 15], color: '#22c55e' }
    ]
  },
  production: {
    xData: ['9月', '10月', '11月', '12月', '1月', '2月', '3月', '4月', '5月'],
    series: [
      { name: '日产油量', data: [115, 118, 122, 120, 118, 125, 122, 120, 118], color: '#22c55e' },
      { name: '日产水量', data: [45, 48, 52, 50, 48, 45, 42, 40, 38], color: '#06b6d4' }
    ]
  }
}

const DAY_MS = 1000 * 60 * 60 * 24

const toDate = (dateStr: string): number => new Date(dateStr + 'T00:00:00').getTime()

/** 模拟接口：获取井位列表 */
export const fetchWellList = (): Promise<Well[]> =>
  new Promise(resolve => setTimeout(() => resolve(clone(wellListMock)), 100))

/** 模拟接口：获取单井全生命周期阶段；未收录的井按空数据处理 */
export const fetchLifecycleStages = (wellId: number): Promise<Stage[]> =>
  new Promise(resolve => setTimeout(() => resolve(clone(wellStageMap[wellId] ?? [])), 120))

/** 阶段时间边界校验：结束早于开始、与上一阶段时间重叠均视为不合法 */
export const validateStageBoundaries = (stages: Stage[]): StageTimeIssue[] => {
  const issues: StageTimeIssue[] = []
  stages.forEach((stage, index) => {
    const start = toDate(stage.startDate)
    if (Number.isNaN(start)) {
      issues.push({ stageId: stage.id, reason: '开始时间格式无法解析' })
      return
    }
    if (stage.endDate) {
      const end = toDate(stage.endDate)
      if (Number.isNaN(end)) {
        issues.push({ stageId: stage.id, reason: '结束时间格式无法解析' })
      } else if (end < start) {
        issues.push({ stageId: stage.id, reason: `结束时间 ${stage.endDate} 早于开始时间 ${stage.startDate}` })
      }
    }
    const prev = stages[index - 1]
    if (prev?.endDate) {
      const prevEnd = toDate(prev.endDate)
      if (!Number.isNaN(prevEnd) && start < prevEnd) {
        issues.push({ stageId: stage.id, reason: `开始时间 ${stage.startDate} 早于上一阶段「${prev.name}」结束时间 ${prev.endDate}，阶段时间重叠` })
      }
    }
  })
  return issues
}

/** 阶段持续天数：未结束返回 null，边界非法返回 null */
export const getStageDays = (stage: Stage): number | null => {
  if (!stage.endDate) return null
  const start = toDate(stage.startDate)
  const end = toDate(stage.endDate)
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null
  return Math.ceil((end - start) / DAY_MS)
}

/** 从指标值中解析数值与单位，无法解析时 num 为 null */
export const parseMetricValue = (value: string): { num: number | null; unit: string } => {
  const match = value.match(/^([\d,]+(?:\.\d+)?)(.*)$/)
  if (!match) return { num: null, unit: value }
  return { num: Number(match[1].replace(/,/g, '')), unit: match[2].trim() }
}
