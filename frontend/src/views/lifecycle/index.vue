<template>
  <div class="lifecycle-container">
    <el-card class="well-select-card">
      <template #header>
        <div class="card-header">
          <span>井位选择</span>
        </div>
      </template>
      <div class="well-selector">
        <el-select v-model="selectedWellId" placeholder="请选择井位" style="width: 300px" @change="handleWellChange">
          <el-option v-for="well in wellList" :key="well.id" :label="well.wellName" :value="well.id" />
        </el-select>
        <div v-if="selectedWell" class="well-info">
          <el-tag size="small" :type="getStatusType(selectedWell.status)">{{ selectedWell.status }}</el-tag>
          <span class="well-code">{{ selectedWell.wellCode }}</span>
          <span class="well-block">{{ selectedWell.blockName }}</span>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card class="timeline-card">
          <template #header>
            <div class="card-header">
              <span>全生命周期时间线</span>
              <div class="timeline-actions">
                <el-tag type="info">当前阶段: {{ currentStage?.name || '无' }}</el-tag>
                <el-button type="primary" :icon="Switch" @click="goCompare">阶段对比</el-button>
              </div>
            </div>
          </template>
          <div v-if="lifecycleStages.length" class="timeline-container">
            <div class="timeline-track">
              <div class="timeline-progress" :style="{ width: `${progressPercentage}%` }"></div>
              <div v-for="(stage, index) in lifecycleStages" :key="stage.id" class="timeline-node" :class="{ active: stage.status === 'completed', current: stage.status === 'in_progress' }" @click="selectStage(stage)">
                <div class="node-icon">
                  <el-icon v-if="stage.status === 'completed'" size="20"><CircleCheck /></el-icon>
                  <el-icon v-else-if="stage.status === 'in_progress'" size="20"><Loading /></el-icon>
                  <el-icon v-else size="20"><CircleClose /></el-icon>
                </div>
                <div class="node-content">
                  <div class="node-name">
                    {{ stage.name }}
                    <el-tooltip v-if="!getTimeStatus(stage).valid" :content="getTimeStatus(stage).message" placement="top">
                      <el-icon class="time-warn-icon"><WarningFilled /></el-icon>
                    </el-tooltip>
                  </div>
                  <div class="node-date">{{ stage.startDate }} ~ {{ stage.endDate || '进行中' }}</div>
                </div>
                <div class="node-line" v-if="index < lifecycleStages.length - 1"></div>
              </div>
            </div>
          </div>
          <el-empty v-else description="该井暂无生命周期阶段数据" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="6">
        <el-card class="stage-list-card">
          <template #header>
            <span>阶段详情</span>
          </template>
          <div v-if="lifecycleStages.length" class="stage-nav">
            <div v-for="stage in lifecycleStages" :key="stage.id" class="stage-item" :class="{ active: selectedStage?.id === stage.id }" @click="selectStage(stage)">
              <div class="stage-indicator" :class="stage.status"></div>
              <div class="stage-info">
                <div class="stage-name">
                  {{ stage.name }}
                  <el-icon v-if="!getTimeStatus(stage).valid" class="time-warn-icon sm"><WarningFilled /></el-icon>
                </div>
                <div class="stage-duration">持续: {{ getStageDuration(stage) }}</div>
              </div>
              <el-icon class="stage-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
          <el-empty v-else description="暂无阶段" :image-size="60" />
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card v-if="selectedStage" class="stage-detail-card">
          <template #header>
            <div class="card-header">
              <span>{{ selectedStage.name }} - 详细信息</span>
              <el-tag :type="getStageStatusType(selectedStage.status)">{{ getStageStatusText(selectedStage.status) }}</el-tag>
            </div>
          </template>

          <el-alert
            v-if="!selectedTimeStatus.valid"
            class="mb-20"
            type="error"
            show-icon
            :closable="false"
            title="时间边界不合法"
            :description="selectedTimeStatus.message"
          />

          <el-row :gutter="20" class="mb-20">
            <el-col :span="12">
              <div class="info-group">
                <div class="info-label">开始时间</div>
                <div class="info-value">{{ selectedStage.startDate }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-group">
                <div class="info-label">结束时间</div>
                <div class="info-value">{{ selectedStage.endDate || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-group">
                <div class="info-label">负责人</div>
                <div class="info-value">{{ selectedStage.manager || '-' }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-group">
                <div class="info-label">完成度</div>
                <div class="info-value">
                  <el-progress :percentage="selectedStage.progress" :status="selectedStage.progress === 100 ? 'success' : ''" />
                </div>
              </div>
            </el-col>
          </el-row>

          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="关键指标" name="metrics">
              <el-row :gutter="20">
                <el-col :span="8" v-for="metric in selectedStage.metrics" :key="metric.name">
                  <div class="metric-card">
                    <div class="metric-icon" :style="{ background: metric.color }">
                      <el-icon><component :is="metric.icon" /></el-icon>
                    </div>
                    <div class="metric-content">
                      <div class="metric-value">{{ metric.value }}</div>
                      <div class="metric-name">{{ metric.name }}</div>
                    </div>
                  </div>
                </el-col>
              </el-row>
              <el-empty v-if="!selectedStage.metrics?.length" description="暂无关键指标" :image-size="60" />
            </el-tab-pane>
            <el-tab-pane label="数据趋势" name="trend">
              <div v-show="hasTrendData" ref="trendChart" class="chart-container"></div>
              <el-empty v-if="!hasTrendData" description="该阶段暂无可视化趋势数据" />
            </el-tab-pane>
            <el-tab-pane label="关键事件" name="events">
              <el-timeline v-if="selectedStage.events?.length">
                <el-timeline-item v-for="event in selectedStage.events" :key="event.id" :timestamp="event.time" :type="(event.type as any)" :color="event.color">
                  <el-card>
                    <h4>{{ event.title }}</h4>
                    <p>{{ event.description }}</p>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
              <el-empty v-else description="暂无关键事件" />
            </el-tab-pane>
            <el-tab-pane label="文档资料" name="docs">
              <el-table :data="selectedStage.documents" style="width: 100%">
                <el-table-column prop="name" label="文档名称" />
                <el-table-column prop="type" label="类型" width="120" />
                <el-table-column prop="size" label="大小" width="120" />
                <el-table-column prop="uploadTime" label="上传时间" width="180" />
                <el-table-column label="操作" width="120">
                  <template #default>
                    <el-button type="primary" size="small" link>下载</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="!selectedStage.documents?.length" description="暂无文档资料" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
        <el-card v-else class="stage-detail-card">
          <el-empty description="该井暂无阶段详情，请选择其他井位" />
        </el-card>
      </el-col>
    </el-row>

    <el-row v-if="lifecycleStages.length" :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card class="comparison-card">
          <template #header>
            <div class="card-header">
              <span>各阶段对比分析</span>
              <el-button type="primary" link @click="goCompare">前往阶段对比，跨井/跨阶段比较 →</el-button>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="12">
              <div ref="durationChart" class="chart-container"></div>
            </el-col>
            <el-col :span="12">
              <div ref="eventsChart" class="chart-container"></div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { Switch, WarningFilled } from '@element-plus/icons-vue'
import {
  getMockWellList,
  getMockLifecycleStages,
  validateStageTime,
  getStageDays,
  type Well,
  type Stage,
  type StageTimeStatus
} from './data'
import { loadViewState, saveViewState, type LifecycleViewState } from './state'

const router = useRouter()

const wellList = ref<Well[]>([])
const selectedWellId = ref<number | null>(null)
const selectedWell = ref<Well | null>(null)
const lifecycleStages = ref<Stage[]>([])
const selectedStage = ref<Stage | null>(null)
const activeTab = ref('metrics')

const trendChart = ref<HTMLElement>()
const durationChart = ref<HTMLElement>()
const eventsChart = ref<HTMLElement>()

let trendChartInstance: echarts.ECharts | null = null
let durationChartInstance: echarts.ECharts | null = null
let eventsChartInstance: echarts.ECharts | null = null

const STAGE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e', '#06b6d4', '#64748b']

const currentStage = computed(() => lifecycleStages.value.find(s => s.status === 'in_progress'))

const progressPercentage = computed(() => {
  const total = lifecycleStages.value.length
  if (!total) return 0
  const completed = lifecycleStages.value.filter(s => s.status === 'completed').length
  return Math.round((completed / total) * 100)
})

const getTimeStatus = (stage: Stage): StageTimeStatus => validateStageTime(stage)

const selectedTimeStatus = computed<StageTimeStatus>(() =>
  selectedStage.value ? validateStageTime(selectedStage.value) : { valid: false }
)

const hasTrendData = computed(() => {
  if (!selectedStage.value || selectedStage.value.status === 'pending') return false
  return selectedStage.value.id in TREND_DATA
})

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    '生产中': 'success',
    '钻井中': 'primary',
    '待修井': 'warning',
    '关停井': 'danger',
    '待建档': 'info'
  }
  return map[status] || 'info'
}

const getStageStatusType = (status: string) => {
  const map: Record<string, string> = {
    completed: 'success',
    in_progress: 'primary',
    pending: 'info'
  }
  return map[status] || 'info'
}

const getStageStatusText = (status: string) => {
  const map: Record<string, string> = {
    completed: '已完成',
    in_progress: '进行中',
    pending: '待开始'
  }
  return map[status] || status
}

const getStageDuration = (stage: Stage) => {
  const days = getStageDays(stage)
  if (days === null) return stage.endDate ? '时间异常' : '进行中'
  return `${days} 天`
}

const persistView = () => {
  const view: LifecycleViewState = {
    wellId: selectedWellId.value,
    stageId: selectedStage.value?.id ?? null,
    activeTab: activeTab.value
  }
  saveViewState(view)
}

// 切换数据期间暂存的待恢复阶段 ID（来自持久化视图）
let pendingRestoreStageId: string | null = null

/** 切换井位：先清空上一口井的阶段结果，再加载新井数据，避免沿用旧结果 */
const handleWellChange = async () => {
  disposeCharts()
  selectedWell.value = wellList.value.find(w => w.id === selectedWellId.value) || null
  lifecycleStages.value = []
  selectedStage.value = null
  await loadLifecycleData()
  persistView()
}

const selectStage = (stage: Stage) => {
  selectedStage.value = stage
  activeTab.value = 'metrics'
  persistView()
  nextTick(() => setTimeout(initTrendChart, 50))
}

const handleTabChange = () => {
  persistView()
  if (activeTab.value === 'trend') {
    nextTick(() => setTimeout(initTrendChart, 50))
  }
}

const goCompare = () => {
  router.push('/lifecycle/compare')
}

/** 阶段数据加载（空数组即代表该井阶段数据为空） */
const loadLifecycleData = async () => {
  if (selectedWellId.value == null) return
  lifecycleStages.value = getMockLifecycleStages(selectedWellId.value)

  if (!lifecycleStages.value.length) {
    selectedStage.value = null
    return
  }

  const savedStageId = pendingRestoreStageId
  const stage =
    lifecycleStages.value.find(s => s.id === savedStageId) ??
    lifecycleStages.value.find(s => s.status === 'in_progress') ??
    lifecycleStages.value[Math.min(3, lifecycleStages.value.length - 1)]
  selectedStage.value = stage ?? null

  await nextTick()
  initDurationChart()
  initEventsChart()
  setTimeout(initTrendChart, 50)
}

const TREND_DATA: Record<string, { xData: string[]; series: Array<{ name: string; data: number[]; color: string }> }> = {
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

const initTrendChart = () => {
  if (!trendChart.value || !selectedStage.value || activeTab.value !== 'trend' || !hasTrendData.value) return
  if (!trendChartInstance) {
    trendChartInstance = echarts.init(trendChart.value)
  }

  const data = TREND_DATA[selectedStage.value.id]

  trendChartInstance.setOption(
    {
      tooltip: { trigger: 'axis' },
      legend: { data: data.series.map(s => s.name) },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: data.xData },
      yAxis: { type: 'value' },
      series: data.series.map(s => ({
        name: s.name,
        type: 'line',
        smooth: true,
        data: s.data,
        itemStyle: { color: s.color }
      }))
    },
    { notMerge: true }
  )
}

const initDurationChart = () => {
  if (!durationChart.value) return
  if (!durationChartInstance) {
    durationChartInstance = echarts.init(durationChart.value)
  }

  durationChartInstance.setOption({
    title: { text: '各阶段周期对比', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        const stage = lifecycleStages.value[p.dataIndex]
        if (stage && !validateStageTime(stage).valid) {
          return `${p.name}<br/><span style="color:#ef4444">时间边界异常：${validateStageTime(stage).message}</span>`
        }
        return p.value == null ? `${p.name}<br/>进行中` : `${p.name}<br/>周期：${p.value} 天`
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: lifecycleStages.value.map(s => s.name), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '天数' },
    series: [
      {
        type: 'bar',
        data: lifecycleStages.value.map(s => getStageDays(s)),
        itemStyle: {
          color: (params: any) => {
            const stage = lifecycleStages.value[params.dataIndex]
            if (stage && !validateStageTime(stage).valid) return '#ef4444'
            return STAGE_COLORS[params.dataIndex % STAGE_COLORS.length]
          }
        }
      }
    ]
  })
}

const initEventsChart = () => {
  if (!eventsChart.value) return
  if (!eventsChartInstance) {
    eventsChartInstance = echarts.init(eventsChart.value)
  }

  eventsChartInstance.setOption({
    title: { text: '各阶段关键事件数量', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: lifecycleStages.value.map(s => s.name), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '事件数', minInterval: 1 },
    series: [
      {
        type: 'bar',
        barWidth: 28,
        data: lifecycleStages.value.map(s => s.events?.length ?? 0),
        itemStyle: {
          color: (params: any) => STAGE_COLORS[params.dataIndex % STAGE_COLORS.length],
          borderRadius: [4, 4, 0, 0]
        },
        label: { show: true, position: 'top' }
      }
    ]
  })
}

const disposeCharts = () => {
  trendChartInstance?.dispose()
  durationChartInstance?.dispose()
  eventsChartInstance?.dispose()
  trendChartInstance = null
  durationChartInstance = null
  eventsChartInstance = null
}

const handleResize = () => {
  trendChartInstance?.resize()
  durationChartInstance?.resize()
  eventsChartInstance?.resize()
}

onMounted(async () => {
  wellList.value = getMockWellList()

  // 刷新或再次进入时恢复视图（井位 / 阶段 / Tab）；井位不存在时回退首口井
  const savedView = loadViewState()
  const savedWell = savedView?.wellId != null && wellList.value.some(w => w.id === savedView.wellId)
    ? savedView.wellId
    : wellList.value[0]?.id ?? null
  selectedWellId.value = savedWell
  selectedWell.value = wellList.value.find(w => w.id === selectedWellId.value) ?? null
  pendingRestoreStageId = savedView?.stageId ?? null
  activeTab.value = savedView?.activeTab || 'metrics'

  await loadLifecycleData()
  pendingRestoreStageId = null
  persistView()

  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  disposeCharts()
})
</script>

<style scoped lang="scss">
.lifecycle-container {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: #1e293b;
}

.timeline-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-warn-icon {
  color: #ef4444;
  vertical-align: -2px;
  margin-left: 4px;

  &.sm {
    font-size: 13px;
  }
}

.well-select-card {
  .well-selector {
    display: flex;
    align-items: center;
    gap: 20px;

    .well-info {
      display: flex;
      align-items: center;
      gap: 15px;

      .well-code {
        color: #64748b;
        font-size: 14px;
      }

      .well-block {
        color: #64748b;
        font-size: 14px;
      }
    }
  }
}

.timeline-card {
  .timeline-container {
    padding: 40px 20px;

    .timeline-track {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .timeline-progress {
        position: absolute;
        top: 19px;
        left: 4%;
        height: 4px;
        background: linear-gradient(90deg, #3b82f6, #22c55e);
        border-radius: 2px;
        transition: width 0.5s ease;
        z-index: 1;
      }

      .timeline-node {
        position: relative;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        z-index: 2;
        transition: transform 0.2s;

        &:hover {
          transform: scale(1.05);
        }

        .node-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e2e8f0;
          color: #94a3b8;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
        }

        &.active .node-icon {
          background: #22c55e;
          color: #fff;
        }

        &.current .node-icon {
          background: #3b82f6;
          color: #fff;
          animation: pulse 2s infinite;
        }

        .node-content {
          margin-top: 12px;
          text-align: center;

          .node-name {
            font-size: 14px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 4px;
          }

          .node-date {
            font-size: 12px;
            color: #64748b;
          }
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
}

.stage-list-card {
  height: 100%;

  .stage-nav {
    .stage-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 8px;

      &:hover {
        background: #f1f5f9;
      }

      &.active {
        background: #eff6ff;

        .stage-name {
          color: #3b82f6;
        }

        .stage-arrow {
          color: #3b82f6;
        }
      }

      .stage-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &.completed {
          background: #22c55e;
        }

        &.in_progress {
          background: #3b82f6;
        }

        &.pending {
          background: #94a3b8;
        }
      }

      .stage-info {
        flex: 1;

        .stage-name {
          font-size: 14px;
          font-weight: 500;
          color: #334155;
          margin-bottom: 2px;
        }

        .stage-duration {
          font-size: 12px;
          color: #64748b;
        }
      }

      .stage-arrow {
        color: #94a3b8;
      }
    }
  }
}

.stage-detail-card {
  .info-group {
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;

    .info-label {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 6px;
    }

    .info-value {
      font-size: 16px;
      font-weight: 500;
      color: #1e293b;
    }
  }

  .metric-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 12px;

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 22px;
    }

    .metric-content {
      flex: 1;

      .metric-value {
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 2px;
      }

      .metric-name {
        font-size: 13px;
        color: #64748b;
      }
    }
  }
}

.chart-container {
  width: 100%;
  height: 300px;
}

.mt-20 {
  margin-top: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

.comparison-card {
  .chart-container {
    height: 280px;
  }
}
</style>
