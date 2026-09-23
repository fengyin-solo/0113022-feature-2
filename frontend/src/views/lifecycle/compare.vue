<template>
  <div class="compare-container">
    <el-card class="compare-entry-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-button :icon="ArrowLeft" plain @click="goBack">返回</el-button>
            <span>阶段对比</span>
            <el-tag type="info">最多选择 {{ MAX_SLOTS }} 个阶段，支持同井不同阶段或多井对比</el-tag>
          </div>
        </div>
      </template>

      <el-row :gutter="16">
        <el-col v-for="(slot, index) in slots" :key="index" :span="slotColSpan">
          <div class="slot-box" :class="{ 'is-empty-slot': !slot.stageId }">
            <div class="slot-head">
              <span class="slot-index">对比 {{ index + 1 }}</span>
              <el-button
                v-if="slots.length > 1"
                type="danger"
                size="small"
                link
                :icon="Delete"
                @click="removeSlot(index)"
              >移除</el-button>
            </div>
            <el-select
              v-model="slot.wellId"
              placeholder="请选择井位"
              size="small"
              class="slot-select"
              @change="onSlotWellChange(index)"
            >
              <el-option v-for="well in wellList" :key="well.id" :label="`${well.wellName}（${well.blockName}）`" :value="well.id" />
            </el-select>
            <el-select
              v-model="slot.stageId"
              :placeholder="stagesOf(slot.wellId).length ? '请选择阶段' : '该井暂无阶段数据'"
              size="small"
              class="slot-select"
            >
              <el-option
                v-for="stage in stagesOf(slot.wellId)"
                :key="stage.id"
                :label="stage.name"
                :value="stage.id"
                :disabled="isOptionDisabled(index, slot.wellId, stage.id)"
              />
            </el-select>
            <el-tag v-if="!slot.stageId" type="info" size="small" class="slot-empty-tag">阶段数据为空</el-tag>
          </div>
        </el-col>
        <el-col v-if="slots.length < MAX_SLOTS" :span="slotColSpan">
          <div class="slot-add" @click="addSlot">
            <el-icon size="22"><Plus /></el-icon>
            <span>添加对比阶段</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <template v-if="validSlots.length">
      <el-card class="mt-20">
        <template #header>
          <div class="card-header">
            <span>完成度对比</span>
            <el-tag type="info">共 {{ validSlots.length }} 个阶段</el-tag>
          </div>
        </template>
        <div ref="progressChartRef" class="chart-container"></div>
      </el-card>

      <el-card class="mt-20">
        <template #header><span>基础信息</span></template>
        <div class="compare-grid">
          <div v-for="(rs, index) in resolvedSlots" :key="index" class="compare-col">
            <template v-if="rs.stage && rs.well">
              <div class="col-title">
                <span>{{ rs.well.wellName }} · {{ rs.stage.name }}</span>
                <el-tag size="small" :type="getStageStatusType(rs.stage.status)">{{ getStageStatusText(rs.stage.status) }}</el-tag>
              </div>
              <el-progress :percentage="rs.stage.progress" :status="rs.stage.progress === 100 ? 'success' : ''" />
              <div class="info-row"><span class="info-label">所属区块</span><span>{{ rs.well.blockName }}</span></div>
              <div class="info-row"><span class="info-label">负责人</span><span>{{ rs.stage.manager || '-' }}</span></div>
              <div class="info-row"><span class="info-label">开始时间</span><span>{{ rs.stage.startDate || '-' }}</span></div>
              <div class="info-row">
                <span class="info-label">结束时间</span>
                <span>{{ rs.stage.endDate || '进行中' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">持续时间</span>
                <span v-if="rs.days !== null" class="duration-value">{{ rs.days }} 天</span>
                <el-tooltip v-else-if="rs.stage.endDate" :content="rs.time.message || '时间边界不合法'" placement="top">
                  <el-tag type="danger" size="small">时间边界异常</el-tag>
                </el-tooltip>
                <el-tag v-else type="info" size="small">进行中</el-tag>
              </div>
              <div class="info-row">
                <span class="info-label">关键事件</span><span>{{ rs.stage.events?.length || 0 }} 项</span>
              </div>
              <div class="info-row">
                <span class="info-label">文档资料</span>
                <el-button link type="primary" size="small" :disabled="!rs.stage.documents?.length" @click="openDocs(rs)">
                  {{ rs.stage.documents?.length || 0 }} 份 · 查看
                </el-button>
              </div>
            </template>
            <el-empty v-else :description="rs.well ? `${rs.well.wellName}阶段数据为空` : '阶段数据为空'" :image-size="70" />
          </div>
        </div>
      </el-card>

      <el-card class="mt-20">
        <template #header>
          <div class="card-header">
            <span>关键指标差异</span>
            <el-tag type="info">差值以第 1 个有效阶段为基准，按同名指标对比</el-tag>
          </div>
        </template>
        <el-table :data="metricRows" border>
          <el-table-column label="指标" prop="name" width="170" fixed />
          <el-table-column
            v-for="(rs, index) in resolvedSlots"
            :key="index"
            min-width="180"
            :label="rs.well && rs.stage ? `${rs.well.wellName} · ${rs.stage.name}` : `对比 ${index + 1}`"
          >
            <template #default="scope">
              <template v-if="rs.stage">
                <div v-if="scope.row.values[index]" class="metric-cell">
                  <span class="metric-value">{{ scope.row.values[index] }}</span>
                  <span v-if="index > 0 && scope.row.deltas[index] !== null" class="metric-delta">
                    较基准 {{ formatDelta(scope.row.deltas[index] as number) }}
                  </span>
                </div>
                <span v-else class="metric-missing">—</span>
              </template>
              <span v-else class="metric-missing">—</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="mt-20">
        <template #header>
          <div class="card-header">
            <span>关键事件差异</span>
            <el-tag type="info">按时间线并列展示各阶段事件</el-tag>
          </div>
        </template>
        <div class="compare-grid event-grid">
          <div v-for="(rs, index) in resolvedSlots" :key="index" class="compare-col event-col">
            <template v-if="rs.stage && rs.well">
              <div class="col-title">
                <span>{{ rs.well.wellName }} · {{ rs.stage.name }}</span>
                <el-tag size="small">{{ rs.stage.events?.length || 0 }} 项</el-tag>
              </div>
              <el-timeline v-if="rs.stage.events?.length" class="event-timeline">
                <el-timeline-item
                  v-for="event in rs.stage.events"
                  :key="event.id"
                  :timestamp="event.time"
                  :type="(event.type as any)"
                  :color="event.color"
                >
                  <div class="event-title">{{ event.title }}</div>
                  <div class="event-desc">{{ event.description }}</div>
                </el-timeline-item>
              </el-timeline>
              <el-empty v-else description="暂无关键事件" :image-size="50" />
            </template>
            <el-empty v-else :description="rs.well ? `${rs.well.wellName}阶段数据为空` : '阶段数据为空'" :image-size="70" />
          </div>
        </div>
      </el-card>
    </template>

    <el-card v-else class="mt-20">
      <el-empty description="所选井位暂无阶段数据，无法生成对比结果，请添加其他井位的阶段">
        <el-button type="primary" :icon="Plus" @click="addSlot">添加对比阶段</el-button>
      </el-empty>
    </el-card>

    <el-dialog v-model="docsVisible" :title="`文档资料 · ${docsTitle}`" width="720px">
      <el-table :data="docsData" border>
        <el-table-column prop="name" label="文档名称" min-width="220" />
        <el-table-column prop="type" label="类型" width="90" />
        <el-table-column prop="size" label="大小" width="110" />
        <el-table-column prop="uploadTime" label="上传时间" width="130" />
        <el-table-column label="操作" width="90">
          <template #default>
            <el-button type="primary" size="small" link>下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Delete, Plus } from '@element-plus/icons-vue'
import {
  getMockWellList,
  getMockLifecycleStages,
  validateStageTime,
  getStageDays,
  parseMetricNumber,
  type Well,
  type Stage,
  type StageDocument,
  type StageTimeStatus
} from './data'
import { loadCompareSelections, saveCompareSelections, loadViewState, type CompareSelection } from './state'

const MAX_SLOTS = 4
const SLOT_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6']

const router = useRouter()

const wellList = ref<Well[]>([])
const stageMap = ref<Map<number, Stage[]>>(new Map())
const slots = ref<CompareSelection[]>([])

const progressChartRef = ref<HTMLElement>()
let progressChart: echarts.ECharts | null = null

const docsVisible = ref(false)
const docsTitle = ref('')
const docsData = ref<StageDocument[]>([])

interface ResolvedSlot {
  well: Well | null
  stage: Stage | null
  time: StageTimeStatus
  days: number | null
}

const stagesOf = (wellId: number): Stage[] => stageMap.value.get(wellId) ?? []

const resolvedSlots = computed<ResolvedSlot[]>(() =>
  slots.value.map(slot => {
    const well = wellList.value.find(w => w.id === slot.wellId) ?? null
    const stage = stagesOf(slot.wellId).find(s => s.id === slot.stageId) ?? null
    return {
      well,
      stage,
      time: stage ? validateStageTime(stage) : { valid: false },
      days: stage ? getStageDays(stage) : null
    }
  })
)

const validSlots = computed(() => resolvedSlots.value.filter(rs => rs.stage !== null))

const slotColSpan = computed(() => {
  const count = Math.min(slots.value.length + (slots.value.length < MAX_SLOTS ? 1 : 0), MAX_SLOTS)
  return Math.floor(24 / Math.max(count, 2))
})

interface MetricRow {
  name: string
  values: (string | undefined)[]
  deltas: (number | null)[]
}

/** 同名指标合并为一行，指标顺序按各阶段出现先后排列 */
const metricRows = computed<MetricRow[]>(() => {
  const names: string[] = []
  resolvedSlots.value.forEach(rs => {
    rs.stage?.metrics?.forEach(m => {
      if (!names.includes(m.name)) names.push(m.name)
    })
  })

  const baselineIndex = resolvedSlots.value.findIndex(rs => rs.stage !== null)

  return names.map(name => {
    const values = resolvedSlots.value.map(rs => rs.stage?.metrics?.find(m => m.name === name)?.value)
    const baseValue = baselineIndex >= 0 ? parseMetricNumber(values[baselineIndex] ?? '') : null
    const deltas = values.map((v, i) => {
      if (i === baselineIndex || v === undefined || baseValue === null) return null
      const num = parseMetricNumber(v)
      return num === null ? null : num - baseValue
    })
    return { name, values, deltas }
  })
})

const getStageStatusType = (status: string) => {
  const map: Record<string, string> = { completed: 'success', in_progress: 'primary', pending: 'info' }
  return map[status] || 'info'
}

const getStageStatusText = (status: string) => {
  const map: Record<string, string> = { completed: '已完成', in_progress: '进行中', pending: '待开始' }
  return map[status] || status
}

const formatDelta = (delta: number) => {
  const text = Math.abs(delta).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  if (delta > 0) return `+${text}`
  if (delta < 0) return `-${text}`
  return '0'
}

const isOptionDisabled = (slotIndex: number, wellId: number, stageId: string) => {
  return slots.value.some((s, i) => i !== slotIndex && s.wellId === wellId && s.stageId === stageId)
}

const isSelected = (wellId: number, stageId: string) =>
  slots.value.some(s => s.wellId === wellId && s.stageId === stageId)

const onSlotWellChange = (index: number) => {
  // 切换井位后阶段列表整体更换，不能沿用上一口井的选择
  const stages = stagesOf(slots.value[index].wellId)
  slots.value[index].stageId = stages[0]?.id ?? ''
}

const addSlot = () => {
  if (slots.value.length >= MAX_SLOTS) {
    ElMessage.warning(`最多只能对比 ${MAX_SLOTS} 个阶段`)
    return
  }
  for (const well of wellList.value) {
    const stage = stagesOf(well.id).find(s => !isSelected(well.id, s.id))
    if (stage) {
      slots.value.push({ wellId: well.id, stageId: stage.id })
      return
    }
  }
  ElMessage.info('所有可用阶段均已添加到对比列表')
}

const removeSlot = (index: number) => {
  slots.value.splice(index, 1)
}

const openDocs = (rs: ResolvedSlot) => {
  if (!rs.well || !rs.stage || !rs.stage.documents?.length) return
  docsTitle.value = `${rs.well.wellName} · ${rs.stage.name}`
  docsData.value = rs.stage.documents
  docsVisible.value = true
}

const goBack = () => {
  router.push('/lifecycle')
}

/** 无历史选择时的默认对比项：优先取单井视图保存的井位与阶段 */
const buildDefaultSelections = (): CompareSelection[] => {
  const view = loadViewState()
  const preferredWellIds = [
    ...(view?.wellId ? [view.wellId] : []),
    ...wellList.value.map(w => w.id)
  ]
  for (const wellId of preferredWellIds) {
    const stages = stagesOf(wellId)
    if (!stages.length) continue
    const current =
      stages.find(s => s.id === view?.stageId) ??
      stages.find(s => s.status === 'in_progress') ??
      stages[0]
    const other = stages.find(s => s.id !== current.id)
    return other
      ? [{ wellId, stageId: current.id }, { wellId, stageId: other.id }]
      : [{ wellId, stageId: current.id }]
  }
  return []
}

/** 恢复保存的选择时逐项校验，井位或阶段已不存在则回退到该井首个阶段 */
const normalizeSelections = (raw: CompareSelection[]): CompareSelection[] => {
  const result: CompareSelection[] = []
  for (const item of raw) {
    if (!wellList.value.some(w => w.id === item.wellId)) continue
    const stages = stagesOf(item.wellId)
    const stageId = stages.some(s => s.id === item.stageId) ? item.stageId : (stages[0]?.id ?? '')
    if (!result.some(r => r.wellId === item.wellId && r.stageId === stageId)) {
      result.push({ wellId: item.wellId, stageId })
    }
  }
  return result.slice(0, MAX_SLOTS)
}

const renderProgressChart = () => {
  if (!progressChartRef.value) return

  if (!validSlots.value.length) {
    progressChart?.dispose()
    progressChart = null
    return
  }

  if (!progressChart) {
    progressChart = echarts.init(progressChartRef.value)
  }
  const withIndex = resolvedSlots.value
    .map((rs, i) => ({ rs, i }))
    .filter(item => item.rs.stage !== null)

  progressChart.setOption(
    {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params
          return `${p.name}<br/>完成度：${p.value}%`
        }
      },
      grid: { left: '3%', right: '6%', bottom: '3%', top: '8%', containLabel: true },
      xAxis: { type: 'value', max: 100, name: '完成度（%）' },
      yAxis: {
        type: 'category',
        inverse: true,
        data: withIndex.map(item => `${item.rs.well?.wellName} · ${item.rs.stage?.name}`),
        axisLabel: { width: 140, overflow: 'truncate' }
      },
      series: [
        {
          type: 'bar',
          barWidth: 22,
          data: withIndex.map(item => ({
            value: item.rs.stage?.progress ?? 0,
            itemStyle: { color: SLOT_COLORS[item.i % SLOT_COLORS.length] }
          })),
          label: { show: true, position: 'right', formatter: '{c}%' }
        }
      ]
    },
    { notMerge: true }
  )
}

const handleResize = () => progressChart?.resize()

watch(
  slots,
  val => {
    saveCompareSelections(val)
    nextTick(renderProgressChart)
  },
  { deep: true }
)

onMounted(async () => {
  wellList.value = getMockWellList()
  stageMap.value = new Map(wellList.value.map(w => [w.id, getMockLifecycleStages(w.id)]))

  const saved = normalizeSelections(loadCompareSelections())
  slots.value = saved.length ? saved : buildDefaultSelections()
  saveCompareSelections(slots.value)

  await nextTick()
  renderProgressChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  progressChart?.dispose()
  progressChart = null
})
</script>

<style scoped lang="scss">
.compare-container {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: #1e293b;

  .header-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.slot-box {
  height: 100%;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;

  &.is-empty-slot {
    border-style: dashed;
    border-color: #cbd5e1;
  }

  .slot-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    .slot-index {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
    }
  }

  .slot-select {
    width: 100%;
    margin-bottom: 8px;
  }

  .slot-empty-tag {
    margin-top: 2px;
  }
}

.slot-add {
  height: 100%;
  min-height: 118px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px dashed #94a3b8;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #eff6ff;
  }
}

.compare-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 16px;
}

.compare-col {
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;

  .col-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
    font-weight: 600;
    color: #1e293b;
  }

  .info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 10px;
    font-size: 13px;
    color: #334155;

    .info-label {
      color: #64748b;
      flex-shrink: 0;
    }
  }
}

.metric-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .metric-value {
    font-weight: 600;
    color: #1e293b;
  }

  .metric-delta {
    font-size: 12px;
    color: #64748b;
  }
}

.metric-missing {
  color: #94a3b8;
}

.event-grid {
  align-items: start;
}

.event-col {
  .event-timeline {
    padding-left: 4px;
  }

  .event-title {
    font-weight: 600;
    color: #334155;
    margin-bottom: 4px;
  }

  .event-desc {
    font-size: 13px;
    color: #64748b;
  }
}

.chart-container {
  width: 100%;
  height: 300px;
}

.mt-20 {
  margin-top: 20px;
}
</style>
