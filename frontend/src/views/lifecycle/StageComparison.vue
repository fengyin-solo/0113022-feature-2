<template>
  <el-card class="stage-comparison-card">
    <template #header>
      <div class="card-header">
        <div class="header-title">
          <el-icon><DataAnalysis /></el-icon>
          <span>阶段对比</span>
          <el-tag type="info" size="small">
            已选 {{ store.compareTargets.length }}/3 · 支持同井不同阶段、多井关键阶段
          </el-tag>
        </div>
        <div>
          <el-button
            v-if="store.compareTargets.length > 0"
            size="small"
            link
            type="danger"
            @click="clearAll"
          >清空选择</el-button>
          <el-button size="small" link @click="emit('close')">收起</el-button>
        </div>
      </div>
    </template>

    <!-- 对比目标选择 -->
    <div class="target-selectors">
      <div
        v-for="(target, index) in store.compareTargets"
        :key="`${target.wellId}-${target.stageId}-${index}`"
        class="target-row"
      >
        <div class="target-index" :class="`idx-${index + 1}`">{{ index + 1 }}</div>
        <el-select
          :model-value="target.wellId"
          placeholder="选择井位"
          class="well-select"
          @change="(v: number) => onWellChange(index, v)"
        >
          <el-option v-for="well in wellList" :key="well.id" :label="well.wellName" :value="well.id" />
        </el-select>
        <el-select
          :model-value="target.stageId"
          placeholder="选择阶段"
          class="stage-select"
          :disabled="getStages(target.wellId).length === 0"
          @change="(v: string) => onStageChange(index, v)"
        >
          <el-option
            v-for="stage in getStages(target.wellId)"
            :key="stage.id"
            :label="stage.name"
            :value="stage.id"
          >
            <span>{{ stage.name }}</span>
            <span class="stage-option-status">{{ getStageStatusText(stage.status) }}</span>
          </el-option>
        </el-select>
        <el-button link type="danger" :icon="Delete" @click="removeTarget(index)" />
      </div>

      <el-button
        v-if="store.compareTargets.length < 3"
        class="add-target-btn"
        :icon="Plus"
        plain
        @click="addTarget"
      >添加对比阶段</el-button>
    </div>

    <div class="compare-actions">
      <el-button
        type="primary"
        :icon="Switch"
        :disabled="store.compareTargets.length < 2"
        @click="runCompare"
      >
        开始对比{{ store.compareTargets.length < 2 ? `（还需选择 ${2 - store.compareTargets.length} 个阶段）` : '' }}
      </el-button>
      <span v-if="store.compareTargets.length >= 2" class="compare-tip">
        以第 1 个阶段为基准，展示完成度、关键指标与关键事件差异
      </span>
    </div>

    <el-empty
      v-if="store.compareTargets.length === 0"
      description="可在时间线节点或阶段详情中点击「加入对比」，也可直接在上方添加"
      :image-size="80"
    />

    <!-- 对比结果 -->
    <div v-if="showResult" class="compare-result">
      <!-- 基本信息与完成度 -->
      <div class="result-section">
        <div class="section-title">完成度与基本信息</div>
        <div class="compare-columns">
          <div v-for="(col, ci) in columns" :key="ci" class="compare-col">
            <template v-if="col.stage">
              <div class="col-header">
                <div class="col-well">{{ col.well?.wellName }}</div>
                <div class="col-stage">
                  {{ col.stage.name }}
                  <el-tag size="small" :type="getStageStatusType(col.stage.status)">
                    {{ getStageStatusText(col.stage.status) }}
                  </el-tag>
                </div>
                <el-button link type="primary" size="small" @click="emit('locate', col.wellId, col.stage.id)">
                  查看详情
                </el-button>
              </div>

              <el-alert
                v-for="issue in col.issues"
                :key="issue"
                :title="issue"
                type="error"
                :closable="false"
                show-icon
                class="col-alert"
              />

              <div class="progress-block">
                <el-progress
                  :percentage="col.stage.progress"
                  :status="col.stage.progress === 100 ? 'success' : ''"
                />
                <span v-if="ci > 0" class="delta-text" :class="progressDelta(ci).cls">
                  {{ progressDelta(ci).text }}
                </span>
              </div>

              <div class="info-line"><span>负责人</span><b>{{ col.stage.manager || '-' }}</b></div>
              <div class="info-line"><span>起止时间</span><b>{{ col.stage.startDate }} ~ {{ col.stage.endDate || '进行中' }}</b></div>
              <div class="info-line">
                <span>持续天数</span>
                <b :class="{ 'invalid-text': getStageDays(col.stage) === null && col.stage.endDate }">
                  {{ getStageDays(col.stage) === null
                    ? (col.stage.endDate ? '边界异常' : '进行中')
                    : `${getStageDays(col.stage)} 天` }}
                </b>
              </div>
            </template>
            <el-empty v-else :description="'该井阶段数据为空'" :image-size="60" />
          </div>
        </div>
      </div>

      <!-- 关键指标差异 -->
      <div class="result-section">
        <div class="section-title">关键指标差异</div>
        <el-table :data="metricRows" border size="small">
          <el-table-column prop="name" label="指标" width="140" fixed />
          <el-table-column v-for="(col, ci) in columns" :key="ci" :label="`${col.well?.wellName ?? '未知井'} · ${col.stage?.name ?? '-'}`">
            <template #default="{ row }">
              <template v-if="row.values[ci]">
                <span class="metric-value">{{ row.values[ci]!.value }}</span>
                <span v-if="ci > 0 && row.values[ci]!.delta" class="delta-text" :class="row.values[ci]!.delta!.cls">
                  {{ row.values[ci]!.delta!.text }}
                </span>
              </template>
              <span v-else class="no-data-text">无此指标</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 关键事件差异 -->
      <div class="result-section">
        <div class="section-title">关键事件差异</div>
        <div class="compare-columns">
          <div v-for="(col, ci) in columns" :key="ci" class="compare-col events-col">
            <template v-if="col.stage">
              <div class="events-summary">
                共 {{ col.events.length }} 起 ·
                独有 {{ col.events.filter(e => e.unique).length }} 起 ·
                共有 {{ col.events.filter(e => !e.unique).length }} 起
              </div>
              <el-empty v-if="col.events.length === 0" description="暂无关键事件" :image-size="50" />
              <el-timeline v-else class="events-timeline">
                <el-timeline-item
                  v-for="event in col.events"
                  :key="event.id"
                  :timestamp="event.time"
                  :type="event.type"
                  :color="event.color"
                >
                  <div class="event-title">
                    {{ event.title }}
                    <el-tag v-if="event.unique" size="small" type="warning">独有</el-tag>
                    <el-tag v-else size="small" type="info">共有</el-tag>
                  </div>
                  <div class="event-desc">{{ event.description }}</div>
                </el-timeline-item>
              </el-timeline>
            </template>
          </div>
        </div>
      </div>

      <!-- 文档资料入口 -->
      <div class="result-section">
        <div class="section-title">文档资料</div>
        <div class="compare-columns">
          <div v-for="(col, ci) in columns" :key="ci" class="compare-col">
            <template v-if="col.stage">
              <el-popover placement="bottom-start" :width="360" trigger="click">
                <template #reference>
                  <el-button plain :icon="Document">
                    文档 {{ col.stage.documents?.length ?? 0 }} 份
                  </el-button>
                </template>
                <div v-if="col.stage.documents?.length" class="doc-popover">
                  <div v-for="doc in col.stage.documents" :key="doc.name" class="doc-item">
                    <div class="doc-meta">
                      <span class="doc-name">{{ doc.name }}</span>
                      <span class="doc-sub">{{ doc.type }} · {{ doc.size }} · {{ doc.uploadTime }}</span>
                    </div>
                    <el-button type="primary" size="small" link>下载</el-button>
                  </div>
                </div>
                <el-empty v-else description="暂无文档" :image-size="40" />
              </el-popover>
              <span class="doc-hint">点击查看文档清单并下载（详情页「文档资料」入口同样可用）</span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus, Switch, Document } from '@element-plus/icons-vue'
import { useLifecycleStore } from '@/store/modules/lifecycle'
import {
  getStageDays,
  parseMetricValue,
  validateStageBoundaries,
  type Stage,
  type StageEvent,
  type Well
} from './mockData'

const props = defineProps<{
  wellList: Well[]
  /** 已加载的各井阶段数据缓存：wellId -> stages（未加载或空数组表示该井无阶段数据） */
  stagesCache: Record<number, Stage[]>
}>()

const emit = defineEmits<{
  (e: 'locate', wellId: number, stageId: string): void
  (e: 'close'): void
}>()

const store = useLifecycleStore()
const showResult = ref(false)

const getStages = (wellId: number): Stage[] => props.stagesCache[wellId] ?? []

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

const isDuplicate = (wellId: number, stageId: string, exceptIndex?: number) =>
  store.compareTargets.some(
    (t, i) => i !== exceptIndex && t.wellId === wellId && t.stageId === stageId
  )

const onWellChange = (index: number, wellId: number) => {
  const stages = getStages(wellId)
  if (stages.length === 0) {
    ElMessage.warning('该井暂无阶段数据，无法参与对比')
    return
  }
  const stageId = stages[0].id
  if (isDuplicate(wellId, stageId, index)) {
    ElMessage.warning('该井的这个阶段已在对比列表中')
    return
  }
  store.updateCompareTarget(index, { wellId, stageId })
}

const onStageChange = (index: number, stageId: string) => {
  const target = store.compareTargets[index]
  if (!target) return
  if (isDuplicate(target.wellId, stageId, index)) {
    ElMessage.warning('该阶段已在对比列表中')
    return
  }
  store.updateCompareTarget(index, { wellId: target.wellId, stageId })
}

const addTarget = () => {
  if (store.compareTargets.length >= 3) {
    ElMessage.warning('最多选择 3 个阶段进行对比')
    return
  }
  const candidates: Array<{ wellId: number; stageId: string }> = []
  if (store.selectedWellId != null && store.selectedStageId) {
    candidates.push({ wellId: store.selectedWellId, stageId: store.selectedStageId })
  }
  props.wellList.forEach(w => {
    getStages(w.id).forEach(s => candidates.push({ wellId: w.id, stageId: s.id }))
  })
  const candidate = candidates.find(c => !isDuplicate(c.wellId, c.stageId))
  if (!candidate) {
    ElMessage.warning('可选阶段均已加入对比')
    return
  }
  store.addCompareTarget(candidate)
}

const removeTarget = (index: number) => {
  store.removeCompareTarget(index)
}

const clearAll = () => {
  store.clearCompareTargets()
  showResult.value = false
}

const runCompare = () => {
  const valid = store.compareTargets.filter(
    t => getStages(t.wellId).some(s => s.id === t.stageId)
  )
  if (valid.length < 2) {
    ElMessage.warning('请至少选择 2 个存在数据的阶段')
    return
  }
  store.setComparePanelVisible(true)
  showResult.value = true
}

interface CompareColumn {
  wellId: number
  well?: Well
  stage?: Stage
  issues: string[]
  events: Array<StageEvent & { unique: boolean }>
}

const normalizeTitle = (title: string) => title.replace(/\s+/g, '')

const columns = computed<CompareColumn[]>(() => {
  const cols = store.compareTargets.map(target => {
    const well = props.wellList.find(w => w.id === target.wellId)
    const wellStages = getStages(target.wellId)
    const stage = wellStages.find(s => s.id === target.stageId)
    const issues = stage
      ? validateStageBoundaries(wellStages)
          .filter(i => i.stageId === stage.id)
          .map(i => i.reason)
      : []
    return {
      wellId: target.wellId,
      well,
      stage,
      issues,
      events: [] as CompareColumn['events']
    }
  })
  // 事件标题归一化后判断「独有 / 共有」
  cols.forEach(col => {
    if (!col.stage) return
    const otherTitles = new Set(
      cols
        .filter(c => c !== col && c.stage)
        .flatMap(c => (c.stage?.events ?? []).map(e => normalizeTitle(e.title)))
    )
    col.events = (col.stage.events ?? []).map(event => ({
      ...event,
      unique: !otherTitles.has(normalizeTitle(event.title))
    }))
  })
  return cols
})

const progressDelta = (ci: number) => {
  const base = columns.value[0]?.stage
  const cur = columns.value[ci]?.stage
  if (!base || !cur) return { text: '', cls: '' }
  const diff = cur.progress - base.progress
  if (diff === 0) return { text: '与基准持平', cls: 'delta-flat' }
  return {
    text: `${diff > 0 ? '▲' : '▼'} 较基准 ${Math.abs(diff)} 个百分点`,
    cls: diff > 0 ? 'delta-up' : 'delta-down'
  }
}

interface MetricCell {
  value: string
  delta?: { text: string; cls: string }
}

const metricRows = computed(() => {
  const names: string[] = []
  columns.value.forEach(col => {
    col.stage?.metrics?.forEach(m => {
      if (!names.includes(m.name)) names.push(m.name)
    })
  })
  return names.map(name => {
    const values: Array<MetricCell | null> = columns.value.map(col => {
      const metric = col.stage?.metrics?.find(m => m.name === name)
      return metric ? { value: metric.value } : null
    })
    const baseMetric = columns.value[0]?.stage?.metrics?.find(m => m.name === name)
    const baseParsed = baseMetric ? parseMetricValue(baseMetric.value) : null
    values.forEach((cell, ci) => {
      if (!cell || ci === 0 || !baseParsed || baseParsed.num === null) return
      const cur = parseMetricValue(cell.value)
      if (cur.num !== null && cur.unit === baseParsed.unit) {
        const diff = cur.num - baseParsed.num
        if (diff === 0) {
          cell.delta = { text: '持平', cls: 'delta-flat' }
        } else {
          cell.delta = {
            text: `${diff > 0 ? '▲' : '▼'} ${Math.abs(diff)}${cur.unit ? ' ' + cur.unit : ''}`,
            cls: diff > 0 ? 'delta-up' : 'delta-down'
          }
        }
      }
    })
    return { name, values }
  })
})

// 进入页面时若恢复了已选对比目标（刷新/再次进入），自动还原对比结果
if (store.comparePanelVisible && store.compareTargets.length >= 2) {
  showResult.value = true
}
</script>

<style scoped lang="scss">
.stage-comparison-card {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
    color: #1e293b;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .target-selectors {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .target-row {
    display: flex;
    align-items: center;
    gap: 10px;

    .target-index {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 13px;
      flex-shrink: 0;

      &.idx-1 { background: #3b82f6; }
      &.idx-2 { background: #22c55e; }
      &.idx-3 { background: #f59e0b; }
    }

    .well-select { width: 200px; }
    .stage-select { flex: 1; }

    .stage-option-status {
      float: right;
      color: #94a3b8;
      font-size: 12px;
      margin-right: 8px;
    }
  }

  .add-target-btn {
    align-self: flex-start;
  }

  .compare-actions {
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 12px;

    .compare-tip {
      font-size: 12px;
      color: #94a3b8;
    }
  }

  .compare-result {
    margin-top: 20px;
  }

  .result-section {
    margin-bottom: 24px;

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 12px;
      padding-left: 8px;
      border-left: 3px solid #3b82f6;
    }
  }

  .compare-columns {
    display: flex;
    gap: 16px;
  }

  .compare-col {
    flex: 1;
    min-width: 0;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px;
    background: #f8fafc;

    .col-header {
      margin-bottom: 10px;

      .col-well {
        font-size: 13px;
        color: #64748b;
      }

      .col-stage {
        font-size: 15px;
        font-weight: 600;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 2px 0;
      }
    }

    .col-alert {
      margin-bottom: 10px;
    }

    .progress-block {
      margin-bottom: 12px;
    }

    .info-line {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      font-size: 13px;
      line-height: 24px;

      span {
        color: #64748b;
        flex-shrink: 0;
      }

      b {
        color: #1e293b;
        font-weight: 500;
        text-align: right;
      }
    }

    &.events-col {
      background: #fff;
    }
  }

  .events-summary {
    font-size: 12px;
    color: #64748b;
    margin-bottom: 8px;
  }

  .events-timeline {
    .event-title {
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .event-desc {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }
  }

  .metric-value {
    font-weight: 600;
    color: #1e293b;
    margin-right: 8px;
  }

  .delta-text {
    font-size: 12px;

    &.delta-up { color: #16a34a; }
    &.delta-down { color: #dc2626; }
    &.delta-flat { color: #94a3b8; }
  }

  .no-data-text {
    color: #cbd5e1;
  }

  .invalid-text {
    color: #dc2626;
  }

  .doc-hint {
    display: block;
    font-size: 12px;
    color: #94a3b8;
    margin-top: 8px;
  }

  .doc-popover {
    .doc-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 6px 0;
      border-bottom: 1px solid #f1f5f9;

      .doc-meta {
        min-width: 0;

        .doc-name {
          display: block;
          font-size: 13px;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .doc-sub {
          font-size: 12px;
          color: #94a3b8;
        }
      }
    }
  }
}
</style>
