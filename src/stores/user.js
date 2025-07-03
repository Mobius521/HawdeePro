import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, register as registerApi, getProfile as getProfileApi, updateProfile as updateProfileApi, changePassword as changePasswordApi } from '@/api/auth'

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
    userAvatar: (state) => state.userInfo.avatar || '/image.png',
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
                role: dataObj.userInfo.role || dataObj.userInfo.roleType || 'teacher',
                phone: dataObj.userInfo.phone || ''
              }
            } else {
              this.userInfo = {
                id: '',
                name: credentials.username || '',
                email: '',
                role: 'teacher',
                phone: ''
              }
            }
            
            // 登录成功后，立即获取完整的用户信息
            if (this.userInfo.id) {
              try {
                const profileResult = await this.getProfile(this.userInfo.id)
                if (profileResult.success && profileResult.data) {
                  // 更新用户信息为完整的个人信息
                  this.userInfo = {
                    id: profileResult.data.staffId || profileResult.data.id || this.userInfo.id,
                    name: profileResult.data.name || this.userInfo.name,
                    email: profileResult.data.email || this.userInfo.email,
                    role: profileResult.data.roleType || profileResult.data.role || this.userInfo.role,
                    phone: profileResult.data.phone || this.userInfo.phone,
                    signTime: profileResult.data.signTime || ''
                  }
                  localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
                }
              } catch (error) {
                console.error('获取完整用户信息失败:', error)
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

    // 注册 - 调用真实后端API
    async register(userData) {
      try {
        console.log('用户store开始注册，数据:', userData);
        const response = await registerApi(userData)
        console.log('注册API响应:', response)
        console.log('响应状态码:', response.code);
        console.log('响应消息:', response.message);
        console.log('响应数据:', response.data);
        
        // 检查多种可能的成功状态码
        if (response.code === 200 || response.code === 0 || response.status === 200) {
          console.log('注册成功，返回成功结果');
          return { success: true, message: response.message || '注册成功' }
        } else {
          console.log('注册失败，返回失败结果:', response.message);
          return { success: false, message: response.message || '注册失败' }
        }
      } catch (error) {
        console.error('注册API调用失败:', error)
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
          role: 'teacher',
          phone: ''
        }
        this.permissions = []
        
        localStorage.removeItem('userToken')
        localStorage.removeItem('userInfo')
      }
    },

    // 获取个人信息
    async getProfile(staffId) {
      try {
        const response = await getProfileApi(staffId)
        console.log('获取个人信息响应:', response)
        
        if ((response.code === 200 || response.code === 0) && response.data) {
          const profileData = response.data
          this.userInfo = {
            id: profileData.staffId || profileData.id || '',
            name: profileData.name || '',
            email: profileData.email || '',
            role: profileData.roleType || profileData.role || 'teacher',
            phone: profileData.phone || '',
            signTime: profileData.signTime || ''
          }
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          return { success: true, data: profileData }
        } else {
          return { success: false, message: response.message || '获取个人信息失败' }
        }
      } catch (error) {
        console.error('获取个人信息失败:', error)
        return { success: false, message: error.message }
      }
    },

    // 更新个人信息
    async updateProfile(staffId, profileData) {
      try {
        const response = await updateProfileApi(staffId, profileData)
        console.log('更新个人信息响应:', response)
        
        if (response.code === 200 || response.code === 0) {
          // 更新本地用户信息
          this.userInfo = { 
            ...this.userInfo, 
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone
          }
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          return { success: true, message: response.message || '更新成功' }
        } else {
          return { success: false, message: response.message || '更新失败' }
        }
      } catch (error) {
        console.error('更新个人信息失败:', error)
        return { success: false, message: error.message }
      }
    },

    // 修改密码
    async changePassword(staffId, passwordData) {
      try {
        const response = await changePasswordApi(staffId, passwordData)
        if (response.code === 200) {
          return { success: true, message: response.message || '密码修改成功' }
        } else {
          return { success: false, message: response.message || '密码修改失败' }
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        return { success: false, message: error.message }
      }
    },

    // 更新用户信息（本地更新）
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