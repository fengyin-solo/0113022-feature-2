/**
 * 全生命周期页面状态持久化。
 * - view：单井视图（井位 / 阶段 / Tab），刷新或再次进入时恢复
 * - comparison：阶段对比选择，返回单井视图或重新进入后保留
 */

/** 一个对比槽位：同一口井的不同阶段或不同井的阶段均可 */
export interface CompareSelection {
  wellId: number
  stageId: string
}

export interface LifecycleViewState {
  wellId: number | null
  stageId: string | null
  activeTab: string
}

const STORAGE_KEY = 'wlms-lifecycle-state-v1'

interface PersistedState {
  view?: LifecycleViewState
  comparison?: CompareSelection[]
}

const readStorage = (): PersistedState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PersistedState) : {}
  } catch {
    return {}
  }
}

const writeStorage = (state: PersistedState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 隐私模式等场景下 localStorage 可能不可用，忽略即可
  }
}

export const loadViewState = (): LifecycleViewState | null => {
  return readStorage().view ?? null
}

export const saveViewState = (view: LifecycleViewState) => {
  const state = readStorage()
  state.view = view
  writeStorage(state)
}

export const loadCompareSelections = (): CompareSelection[] => {
  return readStorage().comparison ?? []
}

export const saveCompareSelections = (selections: CompareSelection[]) => {
  const state = readStorage()
  state.comparison = selections
  writeStorage(state)
}
