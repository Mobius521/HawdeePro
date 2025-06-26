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
    userAvatar: (state) => state.userInfo.avatar || '/default-avatar.png'
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
          if (credentials.username === 'teacher' && credentials.password === '123456') {
            resolve({
              token: 'mock-jwt-token-' + Date.now(),
              userInfo: {
                id: '1',
                name: '张老师',
                email: 'teacher@example.com',
                avatar: '',
                role: 'teacher',
                department: '计算机学院',
                phone: '13800138000'
              },
              permissions: ['course:read', 'course:write', 'student:read', 'grade:write']
            })
          } else {
            reject(new Error('用户名或密码错误'))
          }
        }, 1000)
      })
    },

    // 初始化用户信息
    initUserInfo() {
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        this.userInfo = JSON.parse(userInfo)
      }
    }
  }
})