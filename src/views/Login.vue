<template>
  <div class="login-container">
    <div class="login-bg" style="width: 75%;">
      <div class="bg-content">
        <h2 class="animated-text" :class="{ 'show': showTitle }">智慧教学，从这里开始</h2>
        <p class="animated-text" :class="{ 'show': showSubtitle }">为教师提供全方位的在线教学支持服务</p>
        <ul class="feature-list">
          <li class="animated-text" :class="{ 'show': showFeatures[0] }"><el-icon><Check /></el-icon>课程管理</li>
          <li class="animated-text" :class="{ 'show': showFeatures[1] }"><el-icon><Check /></el-icon>资源共享</li>
          <li class="animated-text" :class="{ 'show': showFeatures[2] }"><el-icon><Check /></el-icon>在线测评</li>
          <li class="animated-text" :class="{ 'show': showFeatures[3] }"><el-icon><Check /></el-icon>成绩分析</li>
        </ul>
      </div>
    </div>
    <div class="login-box" style="width: 25%;">
      <div class="login-header">
        <h1 class="login-title">在线教学支持服务平台</h1>
        <p class="login-subtitle">教师中心系统</p>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-link type="primary" @click="goToRegister">没有账号？去注册</el-link>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <p class="demo-info">
          <el-icon><InfoFilled /></el-icon>
          演示账号: teacher/123456, assistant/123456, admin/123456
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { login } from '@/api/auth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    const loginFormRef = ref()
    const loading = ref(false)

    const loginForm = reactive({
      username: 'teacher',
      password: '123456',
      remember: false
    })

    const loginRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ]
    }

    const handleLogin = async () => {
      if (!loginFormRef.value) return

      try {
        await loginFormRef.value.validate()
        loading.value = true

        const result = await userStore.login({
          username: loginForm.username,
          password: loginForm.password
        })

        if (result.success) {
          ElMessage.success('登录成功')

          // 记住密码
          if (loginForm.remember) {
            localStorage.setItem('rememberedUsername', loginForm.username)
            localStorage.setItem('rememberedPassword', loginForm.password)
          } else {
            localStorage.removeItem('rememberedUsername')
            localStorage.removeItem('rememberedPassword')
          }

          // 跳转到首页
          router.push('/dashboard/home')
        } else {
          ElMessage.error(result.message || '登录失败')
        }
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 初始化记住的密码
    const initRememberedCredentials = () => {
      const rememberedUsername = localStorage.getItem('rememberedUsername')
      const rememberedPassword = localStorage.getItem('rememberedPassword')

      if (rememberedUsername && rememberedPassword) {
        loginForm.username = rememberedUsername
        loginForm.password = rememberedPassword
        loginForm.remember = true
      }
    }

    initRememberedCredentials()

    const goToRegister = () => {
      router.push('/register');
    }

    const showTitle = ref(false)
    const showSubtitle = ref(false)
    const showFeatures = ref([false, false, false, false])

    onMounted(() => {
      setTimeout(() => {
        showTitle.value = true
        setTimeout(() => {
          showSubtitle.value = true
          showFeatures.value.forEach((_, index) => {
            setTimeout(() => {
              showFeatures.value[index] = true
            }, index * 200)
          })
        }, 500)
      }, 500)
    })

    return {
      loginFormRef,
      loading,
      loginForm,
      loginRules,
      handleLogin,
      goToRegister,
      showTitle,
      showSubtitle,
      showFeatures
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 40px;
  margin: auto;
  position: relative;
  z-index: 2;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.login-form {
  width: 100%;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.login-footer {
  margin-top: 30px;
  text-align: center;
}

.demo-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  margin: 0;
}

.login-bg {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  position: relative;
  overflow: hidden;
  background: linear-gradient(270deg, #667eea, #764ba2, #ac63ed);
  background-size: 600% 600%;
  animation: GradientAnimation 15s ease infinite;
}

@keyframes GradientAnimation {
  0%{background-position:0% 50%}
  50%{background-position:100% 50%}
  100%{background-position:0% 50%}
}

.login-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="50" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="30" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.bg-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 500px;
  padding: 0 40px;
}

.bg-content h2 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.bg-content p {
  font-size: 18px;
  margin-bottom: 40px;
  opacity: 0; /* 修改为初始不可见 */
  transform: translateY(20px); /* 修改为初始向下偏移 */
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.feature-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  opacity: 0; /* 修改为初始不可见 */
  transform: translateY(20px); /* 修改为初始向下偏移 */
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.animated-text {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.animated-text.show {
  opacity: 1;
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  .login-bg, .login-box {
    width: 100%;
  }
  .login-box {
    max-width: 400px;
    margin: 20px auto;
  }
  .login-bg {
    min-height: 200px;
  }
  .bg-content {
    padding: 0 20px;
  }
  .bg-content h2 {
    font-size: 24px;
  }
  .bg-content p {
    font-size: 16px;
  }
  .feature-list {
    grid-template-columns: 1fr;
  }
}
</style>