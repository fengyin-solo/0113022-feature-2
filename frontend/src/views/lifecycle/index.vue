<template>
  <div class="lifecycle-container">
    <el-card class="well-select-card">
      <template #header>
        <div class="card-header">
          <span>井位选择</span>
        </div>
      </template>
      <div class="well-selector">
        <el-select v-model="selectedWellId" placeholder="请选择井位" style="width: 300px">
          <el-option v-for="well in wellList" :key="well.id" :label="well.wellName" :value="well.id" />
        </el-select>
        <div v-if="selectedWell" class="well-info">
          <el-tag size="small" :type="getStatusType(selectedWell.status)">{{ selectedWell.status }}</el-tag>
          <span class="well-code">{{ selectedWell.wellCode }}</span>
          <span class="well-block">{{ selectedWell.blockName }}</span>
        </div>
      </div>
    </el-card>

    <!-- 时间边界异常提示 -->
    <el-alert
      v-for="issue in timeIssues"
      :key="issue.stageId"
      class="mt-20"
      type="error"
      show-icon
      :closable="false"
      :title="`阶段「${getStageName(issue.stageId)}」时间边界不合法：${issue.reason}`"
    />

    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card class="timeline-card">
          <template #header>
            <div class="card-header">
              <span>全生命周期时间线</span>
              <div class="timeline-header-right">
                <el-button
                  type="primary"
                  plain
                  size="small"
                  :icon="Switch"
                  :disabled="!selectedStage"
                  @click="addCurrentToCompare"
                >加入对比</el-button>
                <el-tag type="info">当前阶段: {{ currentStage?.name || '-' }}</el-tag>
              </div>
            </div>
          </template>
          <el-empty v-if="lifecycleStages.length === 0" description="该井暂无生命周期阶段数据" />
          <div v-else class="timeline-container">
            <div class="timeline-track">
              <div class="timeline-progress" :style="{ width: `${progressPercentage}%` }"></div>
              <div
                v-for="(stage, index) in lifecycleStages"
                :key="stage.id"
                class="timeline-node"
                :class="{
                  active: stage.status === 'completed',
                  current: stage.status === 'in_progress',
                  selected: selectedStage?.id === stage.id,
                  invalid: stageIssueMap[stage.id]
                }"
                @click="selectStage(stage)"
              >
                <div class="node-icon">
                  <el-icon v-if="stage.status === 'completed'" size="20"><CircleCheck /></el-icon>
                  <el-icon v-else-if="stage.status === 'in_progress'" size="20"><Loading /></el-icon>
                  <el-icon v-else size="20"><CircleClose /></el-icon>
                </div>
                <div class="node-content">
                  <div class="node-name">
                    {{ stage.name }}
                    <el-tooltip
                      v-for="issue in stageIssueMap[stage.id]"
                      :key="issue.reason"
                      :content="issue.reason"
                      placement="top"
                    >
                      <el-icon class="invalid-mark"><WarningFilled /></el-icon>
                    </el-tooltip>
                  </div>
                  <div class="node-date">{{ stage.startDate }} ~ {{ stage.endDate || '进行中' }}</div>
                </div>
                <el-button
                  class="node-compare-btn"
                  size="small"
                  link
                  type="primary"
                  @click.stop="addStageToCompare(stage)"
                >+ 对比</el-button>
                <div class="node-line" v-if="index < lifecycleStages.length - 1"></div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="6">
        <el-card class="stage-list-card">
          <template #header>
            <span>阶段详情</span>
          </template>
          <el-empty v-if="lifecycleStages.length === 0" description="暂无阶段" :image-size="60" />
          <div v-else class="stage-nav">
            <div
              v-for="stage in lifecycleStages"
              :key="stage.id"
              class="stage-item"
              :class="{ active: selectedStage?.id === stage.id, invalid: stageIssueMap[stage.id] }"
              @click="selectStage(stage)"
            >
              <div class="stage-indicator" :class="stage.status"></div>
              <div class="stage-info">
                <div class="stage-name">
                  {{ stage.name }}
                  <el-icon v-if="stageIssueMap[stage.id]" class="invalid-mark"><WarningFilled /></el-icon>
                </div>
                <div class="stage-duration">持续: {{ getStageDuration(stage) }}</div>
              </div>
              <el-icon class="stage-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card v-if="selectedStage" class="stage-detail-card">
          <template #header>
            <div class="card-header">
              <span>{{ selectedStage.name }} - 详细信息</span>
              <div class="detail-header-right">
                <el-button type="primary" plain size="small" :icon="Switch" @click="addStageToCompare(selectedStage)">
                  加入对比
                </el-button>
                <el-tag :type="getStageStatusType(selectedStage.status)">{{ getStageStatusText(selectedStage.status) }}</el-tag>
              </div>
            </div>
          </template>

          <el-alert
            v-for="issue in stageIssueMap[selectedStage.id]"
            :key="issue.reason"
            class="mb-20"
            type="error"
            :closable="false"
            show-icon
            :title="`时间边界不合法：${issue.reason}`"
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

          <el-tabs v-model="activeTab">
            <el-tab-pane label="关键指标" name="metrics">
              <el-empty v-if="!selectedStage.metrics || selectedStage.metrics.length === 0" description="暂无关键指标" :image-size="60" />
              <el-row v-else :gutter="20">
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
            </el-tab-pane>
            <el-tab-pane label="数据趋势" name="trend">
              <div ref="trendChart" class="chart-container"></div>
            </el-tab-pane>
            <el-tab-pane label="关键事件" name="events">
              <el-empty
                v-if="!selectedStage.events || selectedStage.events.length === 0"
                description="暂无关键事件"
              />
              <el-timeline v-else>
                <el-timeline-item v-for="event in selectedStage.events" :key="event.id" :timestamp="event.time" :type="event.type" :color="event.color">
                  <el-card>
                    <h4>{{ event.title }}</h4>
                    <p>{{ event.description }}</p>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </el-tab-pane>
            <el-tab-pane label="文档资料" name="docs">
              <el-table :data="selectedStage.documents || []" style="width: 100%">
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
            </el-tab-pane>
          </el-tabs>
        </el-card>
        <el-card v-else class="stage-detail-card">
          <el-empty description="请选择左侧阶段查看详情；该井暂无阶段数据" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 阶段对比入口 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card v-if="!comparePanelVisible" class="comparison-entry-card">
          <div class="comparison-entry">
            <div class="entry-desc">
              <el-icon class="entry-icon"><DataAnalysis /></el-icon>
              <div>
                <div class="entry-title">阶段对比</div>
                <div class="entry-sub">
                  将同一口井的不同阶段或多口井的关键阶段放在一起，对比完成度、关键指标与事件差异
                  <span v-if="lifecycleStore.compareTargets.length > 0">
                    · 已选 {{ lifecycleStore.compareTargets.length }} 个阶段
                  </span>
                </div>
              </div>
            </div>
            <el-button type="primary" :icon="Switch" @click="openComparePanel">
              {{ lifecycleStore.compareTargets.length >= 2 ? '查看对比结果' : '开始阶段对比' }}
            </el-button>
          </div>
        </el-card>
        <StageComparison
          v-else
          :well-list="wellList"
          :stages-cache="stagesCache"
          @locate="handleLocate"
          @close="comparePanelVisible = false"
        />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card class="comparison-card">
          <template #header>
            <div class="card-header">
              <span>各阶段对比分析</span>
            </div>
          </template>
          <el-empty v-if="lifecycleStages.length === 0" description="暂无阶段数据" :image-size="60" />
          <el-row v-else :gutter="20">
            <el-col :span="12">
              <div ref="durationChart" class="chart-container"></div>
            </el-col>
            <el-col :span="12">
              <div ref="costChart" class="chart-container"></div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { Switch, WarningFilled } from '@element-plus/icons-vue'
import { useLifecycleStore } from '@/store/modules/lifecycle'
import StageComparison from './StageComparison.vue'
import {
  fetchWellList,
  fetchLifecycleStages,
  validateStageBoundaries,
  getStageDays,
  trendDataMap,
  type Stage,
  type StageTimeIssue,
  type Well
} from './mockData'

const lifecycleStore = useLifecycleStore()

const wellList = ref<Well[]>([])
const selectedWellId = ref<number | null>(lifecycleStore.selectedWellId)
const selectedWell = ref<Well | null>(null)
const lifecycleStages = ref<Stage[]>([])
const selectedStage = ref<Stage | null>(null)
const activeTab = ref('metrics')
const comparePanelVisible = ref(lifecycleStore.comparePanelVisible)
// 已加载过的各井阶段数据（对比面板跨井取数用）；未加载的键不放入
const stagesCache = reactive<Record<number, Stage[]>>({})

const trendChart = ref<HTMLElement>()
const durationChart = ref<HTMLElement>()
const costChart = ref<HTMLElement>()
let trendChartInstance: echarts.ECharts | null = null
let durationChartInstance: echarts.ECharts | null = null
let costChartInstance: echarts.ECharts | null = null

const currentStage = computed(() => lifecycleStages.value.find(s => s.status === 'in_progress'))

const progressPercentage = computed(() => {
  const total = lifecycleStages.value.length
  if (total === 0) return 0
  const completed = lifecycleStages.value.filter(s => s.status === 'completed').length
  return Math.round((completed / total) * 100)
})

const timeIssues = computed<StageTimeIssue[]>(() => validateStageBoundaries(lifecycleStages.value))

const stageIssueMap = computed<Record<string, StageTimeIssue[]>>(() => {
  const map: Record<string, StageTimeIssue[]> = {}
  timeIssues.value.forEach(issue => {
    if (!map[issue.stageId]) map[issue.stageId] = []
    map[issue.stageId].push(issue)
  })
  return map
})

const getStageName = (stageId: string) =>
  lifecycleStages.value.find(s => s.id === stageId)?.name || stageId

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    '生产中': 'success',
    '钻井中': 'primary',
    '待修井': 'warning',
    '关停井': 'danger'
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

const selectStage = (stage: Stage) => {
  selectedStage.value = stage
  activeTab.value = 'metrics'
  lifecycleStore.setStage(stage.id)
  setTimeout(() => initTrendChart(), 100)
}

const addStageToCompare = (stage: Stage, wellId: number | null = selectedWellId.value) => {
  if (wellId === null) return
  if (lifecycleStore.compareTargets.length >= 3) {
    ElMessage.warning('最多选择 3 个阶段进行对比')
    return
  }
  const ok = lifecycleStore.addCompareTarget({ wellId, stageId: stage.id })
  if (!ok) {
    ElMessage.info('该阶段已在对比列表中')
    return
  }
  ElMessage.success(`已将「${stage.name}」加入对比（共 ${lifecycleStore.compareTargets.length} 个）`)
  lifecycleStore.setComparePanelVisible(true)
  comparePanelVisible.value = true
}

const addCurrentToCompare = () => {
  if (selectedStage.value) addStageToCompare(selectedStage.value)
}

const openComparePanel = () => {
  comparePanelVisible.value = true
  lifecycleStore.setComparePanelVisible(true)
}

// 从对比结果跳转：先切井再定位到阶段，避免沿用上一口井的详情
let pendingLocateStageId: string | null = null
const handleLocate = (wellId: number, stageId: string) => {
  if (wellId === selectedWellId.value) {
    const stage = lifecycleStages.value.find(s => s.id === stageId)
    if (stage) selectStage(stage)
  } else {
    // 由 selectedWellId 的 watcher 统一执行切井加载，避免重复请求
    pendingLocateStageId = stageId
    selectedWellId.value = wellId
  }
}

const switchWell = async (wellId: number | null, preferredStageId?: string | null) => {
  // 切换井位时立即清空上一口井的详情与时间线，不沿用旧结果
  selectedStage.value = null
  lifecycleStages.value = []
  disposeCharts()

  if (wellId === null) {
    selectedWell.value = null
    lifecycleStore.setWell(null, null)
    return
  }

  selectedWell.value = wellList.value.find(w => w.id === wellId) || null

  // 每次切井都重新拉取该井数据；空数据不会回退到其他井缓存
  const stages = await fetchLifecycleStages(wellId)
  // 拉取过程中用户又切换了井，丢弃过期结果
  if (selectedWellId.value !== wellId) return

  stagesCache[wellId] = stages
  lifecycleStages.value = stages
  // 仅裁剪「已加载井」上的失效目标；尚未加载的井保留，待其加载后再校验
  lifecycleStore.pruneCompareTargets(id => {
    if (id === wellId) return stages.map(s => s.id)
    return Object.prototype.hasOwnProperty.call(stagesCache, id)
      ? stagesCache[id].map(s => s.id)
      : undefined
  })

  const target =
    stages.find(s => s.id === preferredStageId) ||
    stages.find(s => s.status === 'in_progress') ||
    stages[0] ||
    null
  selectedStage.value = target
  lifecycleStore.setWell(wellId, target?.id ?? null)

  if (stages.length === 0) {
    ElMessage.warning('该井暂无生命周期阶段数据')
  } else {
    const issues = validateStageBoundaries(stages)
    if (issues.length > 0) {
      ElMessage.warning(`该井存在 ${issues.length} 处阶段时间边界异常，请查看时间线上的红色标记`)
    }
  }

  await nextTick()
  initCharts()
}

watch(selectedWellId, (newId, oldId) => {
  if (newId !== oldId) {
    const preferred = pendingLocateStageId
    pendingLocateStageId = null
    switchWell(newId, preferred)
  }
})

const disposeCharts = () => {
  trendChartInstance?.dispose()
  durationChartInstance?.dispose()
  costChartInstance?.dispose()
  trendChartInstance = null
  durationChartInstance = null
  costChartInstance = null
}

const initTrendChart = () => {
  if (!trendChart.value || !selectedStage.value) return
  trendChartInstance?.dispose()
  const chart = echarts.init(trendChart.value)
  trendChartInstance = chart

  const data = trendDataMap[selectedStage.value.id] || trendDataMap.production

  chart.setOption({
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
  })
}

const initDurationChart = () => {
  if (!durationChart.value || lifecycleStages.value.length === 0) return
  durationChartInstance?.dispose()
  const chart = echarts.init(durationChart.value)
  durationChartInstance = chart

  chart.setOption({
    title: { text: '各阶段周期对比', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: lifecycleStages.value.map(s => s.name), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '天数' },
    series: [{
      type: 'bar',
      data: lifecycleStages.value.map(s => {
        const days = getStageDays(s)
        // 进行中的阶段按已持续天数估算；边界非法不绘制
        if (days !== null) return days
        return s.endDate ? 0 : 80
      }),
      itemStyle: {
        color: (params: { dataIndex: number }) => {
          const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e', '#06b6d4', '#64748b']
          return colors[params.dataIndex]
        }
      }
    }]
  })
}

const initCostChart = () => {
  if (!costChart.value || lifecycleStages.value.length === 0) return
  costChartInstance?.dispose()
  const chart = echarts.init(costChart.value)
  costChartInstance = chart

  chart.setOption({
    title: { text: '各阶段费用占比', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: {
        label: { show: true, fontSize: 16, fontWeight: 'bold' }
      },
      labelLine: { show: false },
      data: [
        { value: 200, name: '勘探规划', itemStyle: { color: '#3b82f6' } },
        { value: 1200, name: '钻井施工', itemStyle: { color: '#8b5cf6' } },
        { value: 300, name: '完井测试', itemStyle: { color: '#f59e0b' } },
        { value: 800, name: '生产运营', itemStyle: { color: '#22c55e' } },
        { value: 150, name: '修井作业', itemStyle: { color: '#06b6d4' } },
        { value: 50, name: '废弃处置', itemStyle: { color: '#64748b' } }
      ]
    }]
  })
}

const initCharts = () => {
  initTrendChart()
  initDurationChart()
  initCostChart()
}

const handleResize = () => {
  trendChartInstance?.resize()
  durationChartInstance?.resize()
  costChartInstance?.resize()
}

onMounted(async () => {
  wellList.value = await fetchWellList()
  // 预加载全部井的阶段数据，供跨井阶段对比使用（空数据井也会缓存为空数组）
  await Promise.all(
    wellList.value.map(async w => {
      stagesCache[w.id] = await fetchLifecycleStages(w.id)
    })
  )
  // 恢复的井位已不存在时回退到第一口井
  if (selectedWellId.value === null || !wellList.value.some(w => w.id === selectedWellId.value)) {
    selectedWellId.value = wellList.value[0]?.id ?? null
  }
  // 清理恢复后已失效的对比目标
  lifecycleStore.pruneCompareTargets(id => stagesCache[id]?.map(s => s.id))
  window.addEventListener('resize', handleResize)
  // 首次加载：恢复刷新/再次进入前选择的井位与阶段
  await switchWell(selectedWellId.value, lifecycleStore.selectedStageId)
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

.timeline-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
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

          .node-compare-btn {
            opacity: 1;
          }
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

        &.selected {
          .node-icon {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.25);
          }
        }

        &.invalid .node-icon {
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.45);
        }

        .node-content {
          margin-top: 12px;
          text-align: center;

          .node-name {
            font-size: 14px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          }

          .node-date {
            font-size: 12px;
            color: #64748b;
          }
        }

        .node-compare-btn {
          opacity: 0;
          transition: opacity 0.2s;
          margin-top: 2px;
          font-size: 12px;
        }

        .node-line {
          display: none;
        }
      }
    }
  }
}

.invalid-mark {
  color: #dc2626;
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

      &.invalid .stage-name {
        color: #dc2626;
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
          display: flex;
          align-items: center;
          gap: 4px;
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
  .detail-header-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

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

.comparison-entry-card {
  .comparison-entry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    .entry-desc {
      display: flex;
      align-items: center;
      gap: 14px;

      .entry-icon {
        font-size: 32px;
        color: #3b82f6;
      }

      .entry-title {
        font-size: 15px;
        font-weight: 600;
        color: #1e293b;
      }

      .entry-sub {
        font-size: 13px;
        color: #64748b;
        margin-top: 2px;
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
