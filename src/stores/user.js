import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      id: '',
      name: '',
      email: '',
      avatar: '',
      role: 'teacher',
      department: '',
      phone: ''
    },
    token: localStorage.getItem('userToken') || '',
    permissions: []
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.userInfo.name || '未知用户',
    userAvatar: (state) => state.userInfo.avatar || '/default-avatar.png',
    userRole: (state) => state.userInfo.role || 'teacher',
    isTeacher: (state) => state.userInfo.role === 'teacher',
    isAssistant: (state) => state.userInfo.role === 'assistant',
    isAdmin: (state) => state.userInfo.role === 'admin'
  },

  actions: {
    // 登录 - 调用真实后端API
    async login(credentials) {
        try {
            const response = await loginApi(credentials)
            console.log('后端返回的完整响应:', response)
        
            // 兼容后端data为字符串的情况
            let dataObj = response.data
            if (typeof dataObj === 'string') {
              // 用正则提取 token
              let token = ''
              let userInfo = {}
              const tokenMatch = dataObj.match(/token=([^,}]+)/)
              if (tokenMatch) token = tokenMatch[1].trim()
              const userInfoMatch = dataObj.match(/userInfo=\{([^}]+)\}/)
              if (userInfoMatch) {
                userInfoMatch[1].split(',').forEach(pair => {
                  const [key, value] = pair.split('=').map(s => s.trim())
                  userInfo[key] = value
                })
              }
              dataObj = { token, userInfo }
              console.log('兼容解析后的data对象:', dataObj)
            } else {
              console.log('解析后的data对象:', dataObj)
            }
        
            if (!dataObj) {
              console.error('data对象为空')
              return { success: false, message: '服务器返回数据格式错误' }
            }
            if (!dataObj.token) {
              console.error('token为空')
              return { success: false, message: '服务器未返回token' }
            }
            this.token = dataObj.token
            if (dataObj.userInfo) {
              this.userInfo = {
                id: dataObj.userInfo.id || '',
                name: dataObj.userInfo.name || '',
                email: dataObj.userInfo.email || '',
                avatar: dataObj.userInfo.avatar || '',
                role: dataObj.userInfo.role || 'teacher',
                department: dataObj.userInfo.department || '',
                phone: dataObj.userInfo.phone || ''
              }
            } else {
              this.userInfo = {
                id: '',
                name: credentials.username || '',
                email: '',
                avatar: '',
                role: 'teacher',
                department: '',
                phone: ''
              }
            }
            this.permissions = this.getPermissionsByRole(this.userInfo.role)
            localStorage.setItem('userToken', this.token)
            localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
            return { success: true }
          } catch (error) {
            console.error('登录失败:', error)
            return { success: false, message: error.message }
          }
    },

    // 注册
    async register(userData) {
      try {
        // 模拟注册API调用
        const response = await this.mockRegister(userData)
        
        return { success: true, message: '注册成功' }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },

    // 登出 - 调用真实后端API
    async logout() {
      try {
        await logoutApi()
      } catch (error) {
        console.error('登出API调用失败:', error)
      } finally {
        // 无论API是否成功，都清除本地数据
        this.token = ''
        this.userInfo = {
          id: '',
          name: '',
          email: '',
          avatar: '',
          role: 'teacher',
          department: '',
          phone: ''
        }
        this.permissions = []
        
        localStorage.removeItem('userToken')
        localStorage.removeItem('userInfo')
      }
    },

    // 更新用户信息
    updateUserInfo(info) {
      this.userInfo = { ...this.userInfo, ...info }
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    },

    // 根据角色获取权限
    getPermissionsByRole(role) {
      const permissions = {
        'teacher': ['course:read', 'course:write', 'student:read', 'grade:write', 'resource:manage'],
        'assistant': ['course:read', 'student:read', 'grade:read', 'resource:read'],
        'admin': ['system:manage', 'user:manage', 'course:audit', 'resource:audit']
      }
      return permissions[role] || []
    },

    // 模拟注册API
    mockRegister(userData) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // 模拟注册成功
          console.log('注册用户数据:', userData)
          resolve({
            success: true,
            message: '注册成功'
          })
        }, 1000)
      })
    },

    // 初始化用户信息
    initUserInfo() {
      const userInfo = localStorage.getItem('userInfo')
      const token = localStorage.getItem('userToken')
      if (userInfo && token) {
        this.userInfo = JSON.parse(userInfo)
        this.token = token
        this.permissions = this.getPermissionsByRole(this.userInfo.role)
      }
    }
  }
})