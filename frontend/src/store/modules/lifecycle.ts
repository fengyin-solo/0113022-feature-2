import { defineStore } from 'pinia'

/** 一个对比目标 = 某口井的某个阶段（支持同井不同阶段、不同井关键阶段对比） */
export interface CompareTarget {
  wellId: number
  stageId: string
}

interface LifecycleViewState {
  selectedWellId: number | null
  selectedStageId: string | null
  compareTargets: CompareTarget[]
  comparePanelVisible: boolean
}

const STORAGE_KEY = 'lifecycle-view-state'

const defaultState: LifecycleViewState = {
  selectedWellId: null,
  selectedStageId: null,
  compareTargets: [],
  comparePanelVisible: false
}

const loadState = (): LifecycleViewState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultState }
    const parsed = JSON.parse(raw) as Partial<LifecycleViewState>
    return {
      selectedWellId: typeof parsed.selectedWellId === 'number' ? parsed.selectedWellId : null,
      selectedStageId: typeof parsed.selectedStageId === 'string' ? parsed.selectedStageId : null,
      compareTargets: Array.isArray(parsed.compareTargets)
        ? parsed.compareTargets.filter(
            t => t && typeof t.wellId === 'number' && typeof t.stageId === 'string'
          )
        : [],
      comparePanelVisible: Boolean(parsed.comparePanelVisible)
    }
  } catch {
    return { ...defaultState }
  }
}

const persist = (state: LifecycleViewState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 存储不可用时静默降级为仅内存态
  }
}

export const useLifecycleStore = defineStore('lifecycle', {
  state: (): LifecycleViewState => loadState(),

  actions: {
    setWell(wellId: number | null, stageId: string | null) {
      this.selectedWellId = wellId
      this.selectedStageId = stageId
      persist(this.$state)
    },

    setStage(stageId: string | null) {
      this.selectedStageId = stageId
      persist(this.$state)
    },

    addCompareTarget(target: CompareTarget) {
      if (this.compareTargets.length >= 3) return false
      const exists = this.compareTargets.some(
        t => t.wellId === target.wellId && t.stageId === target.stageId
      )
      if (exists) return false
      this.compareTargets.push(target)
      persist(this.$state)
      return true
    },

    updateCompareTarget(index: number, target: CompareTarget | null) {
      if (index < 0 || index >= this.compareTargets.length) return
      if (target === null) {
        this.compareTargets.splice(index, 1)
      } else {
        this.compareTargets[index] = target
      }
      persist(this.$state)
    },

    removeCompareTarget(index: number) {
      this.updateCompareTarget(index, null)
    },

    clearCompareTargets() {
      this.compareTargets = []
      persist(this.$state)
    },

    setComparePanelVisible(visible: boolean) {
      this.comparePanelVisible = visible
      persist(this.$state)
    },

    /** 阶段数据加载完成后清理失效目标（井不存在或该井已无此阶段、无阶段数据） */
    pruneCompareTargets(resolver: (wellId: number) => string[] | undefined) {
      const before = this.compareTargets.length
      this.compareTargets = this.compareTargets.filter(t =>
        (resolver(t.wellId) ?? []).includes(t.stageId)
      )
      if (this.compareTargets.length !== before) persist(this.$state)
    }
  }
})
