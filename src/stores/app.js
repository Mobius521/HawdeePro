import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 侧边栏状态
    sidebarCollapsed: false,
    
    // 主题设置
    theme: 'light',
    
    // 语言设置
    language: 'zh-CN',
    
    // 面包屑导航
    breadcrumbs: [],
    
    // 加载状态
    loading: false,
    
    // 系统设置
    settings: {
      showBreadcrumb: true,
      showTagsView: true,
      fixedHeader: true,
      sidebarLogo: true
    }
  }),

  getters: {
    sidebarWidth: (state) => state.sidebarCollapsed ? '64px' : '200px',
    isDarkTheme: (state) => state.theme === 'dark'
  },

  actions: {
    // 切换侧边栏
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
      localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed)
    },

    // 设置侧边栏状态
    setSidebarCollapsed(collapsed) {
      this.sidebarCollapsed = collapsed
      localStorage.setItem('sidebarCollapsed', collapsed)
    },

    // 切换主题
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', this.theme)
      this.applyTheme()
    },

    // 应用主题
    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.theme)
    },

    // 设置面包屑
    setBreadcrumbs(breadcrumbs) {
      this.breadcrumbs = breadcrumbs
    },

    // 设置加载状态
    setLoading(loading) {
      this.loading = loading
    },

    // 更新设置
    updateSettings(settings) {
      this.settings = { ...this.settings, ...settings }
      localStorage.setItem('appSettings', JSON.stringify(this.settings))
    },

    // 初始化应用状态
    initApp() {
      // 恢复侧边栏状态
      const sidebarCollapsed = localStorage.getItem('sidebarCollapsed')
      if (sidebarCollapsed !== null) {
        this.sidebarCollapsed = JSON.parse(sidebarCollapsed)
      }

      // 恢复主题设置
      const theme = localStorage.getItem('theme')
      if (theme) {
        this.theme = theme
        this.applyTheme()
      }

      // 恢复应用设置
      const settings = localStorage.getItem('appSettings')
      if (settings) {
        this.settings = { ...this.settings, ...JSON.parse(settings) }
      }
    }
  }
})