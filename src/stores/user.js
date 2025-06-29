import { defineStore } from 'pinia'

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
    // 登录
    async login(credentials) {
      try {
        // 模拟登录API调用
        const response = await this.mockLogin(credentials)
        
        this.token = response.token
        this.userInfo = response.userInfo
        this.permissions = response.permissions
        
        localStorage.setItem('userToken', this.token)
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        
        return { success: true }
      } catch (error) {
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

    // 登出
    logout() {
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
    },

    // 更新用户信息
    updateUserInfo(info) {
      this.userInfo = { ...this.userInfo, ...info }
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    },

    // 模拟登录API
    mockLogin(credentials) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // 支持多角色登录
          const users = {
            'teacher': {
              id: '1',
              name: '张老师',
              email: 'teacher@example.com',
              avatar: '',
              role: 'teacher',
              department: '计算机学院',
              phone: '13800138000',
              permissions: ['course:read', 'course:write', 'student:read', 'grade:write', 'resource:manage']
            },
            'assistant': {
              id: '2',
              name: '李助教',
              email: 'assistant@example.com',
              avatar: '',
              role: 'assistant',
              department: '计算机学院',
              phone: '13800138001',
              permissions: ['course:read', 'student:read', 'grade:read', 'resource:read']
            },
            'admin': {
              id: '3',
              name: '王管理员',
              email: 'admin@example.com',
              avatar: '',
              role: 'admin',
              department: '信息中心',
              phone: '13800138002',
              permissions: ['system:manage', 'user:manage', 'course:audit', 'resource:audit']
            }
          }

          const user = users[credentials.username]
          if (user && credentials.password === '123456') {
            resolve({
              token: 'mock-jwt-token-' + Date.now(),
              userInfo: user,
              permissions: user.permissions
            })
          } else {
            reject(new Error('用户名或密码错误'))
          }
        }, 1000)
      })
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
      }
    }
  }
})