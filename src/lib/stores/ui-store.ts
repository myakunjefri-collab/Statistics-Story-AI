import { create } from 'zustand'
import type { FilterJenis } from '@/lib/types'

export interface UIState {
  // 1. Sidebar UI state for mobile responsive drawer
  isSidebarOpen: boolean
  setSidebarOpen: (isOpen: boolean) => void
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void

  // 2. Analysis method filter state for dashboard
  selectedAnalysisFilter: FilterJenis
  setSelectedAnalysisFilter: (filter: FilterJenis) => void

  // 3. Search query string state for dashboard analysis filtering
  analysisSearchQuery: string
  setAnalysisSearchQuery: (query: string) => void

  // 4. Modal form dialog state for creating/editing analysis
  isAnalysisFormOpen: boolean
  setAnalysisFormOpen: (isOpen: boolean) => void

  // 5. Editing analysis ID state for identifying active record
  editingAnalysisId: string | null
  setEditingAnalysisId: (id: string | null) => void

  // Combined helpers for common UI flows
  openCreateForm: () => void
  openEditForm: (id: string) => void
  closeAnalysisForm: () => void
  resetDashboardFilters: () => void
}

/**
 * Zustand Store exclusively dedicated to Client UI State.
 * Strictly decoupled from server state, API cache, and domain data.
 */
export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),

  selectedAnalysisFilter: 'Semua',
  setSelectedAnalysisFilter: (selectedAnalysisFilter) => set({ selectedAnalysisFilter }),

  analysisSearchQuery: '',
  setAnalysisSearchQuery: (analysisSearchQuery) => set({ analysisSearchQuery }),

  isAnalysisFormOpen: false,
  setAnalysisFormOpen: (isAnalysisFormOpen) => set({ isAnalysisFormOpen }),

  editingAnalysisId: null,
  setEditingAnalysisId: (editingAnalysisId) => set({ editingAnalysisId }),

  openCreateForm: () => set({ editingAnalysisId: null, isAnalysisFormOpen: true }),
  openEditForm: (id) => set({ editingAnalysisId: id, isAnalysisFormOpen: true }),
  closeAnalysisForm: () => set({ editingAnalysisId: null, isAnalysisFormOpen: false }),
  resetDashboardFilters: () => set({ selectedAnalysisFilter: 'Semua', analysisSearchQuery: '' }),
}))
