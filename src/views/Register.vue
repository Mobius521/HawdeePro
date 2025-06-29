<template>
  <div class="register-container">
    <div class="register-bg" style="width: 75%;">
      <div class="bg-content">
        <h2 class="animated-text" :class="{ 'show': showTitle }">开启智慧教学之旅</h2>
        <p class="animated-text" :class="{ 'show': showSubtitle }">为教师提供全方位的在线教学支持服务</p>
        <ul class="feature-list">
          <li class="animated-text" :class="{ 'show': showFeatures[0] }"><el-icon><Check /></el-icon>课程管理</li>
          <li class="animated-text" :class="{ 'show': showFeatures[1] }"><el-icon><Check /></el-icon>资源共享</li>
          <li class="animated-text" :class="{ 'show': showFeatures[2] }"><el-icon><Check /></el-icon>在线测评</li>
          <li class="animated-text" :class="{ 'show': showFeatures[3] }"><el-icon><Check /></el-icon>成绩分析</li>
        </ul>
      </div>
    </div>
    <div class="register-box" style="width: 25%;">
      <div class="register-header">
        <h1 class="register-title">在线教学支持服务平台</h1>
        <p class="register-subtitle">教师中心系统 - 注册</p>
      </div>
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        @keyup.enter="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item prop="realName">
          <el-input
            v-model="registerForm.realName"
            placeholder="请输入真实姓名"
            size="large"
            prefix-icon="UserFilled"
            clearable
          />
        </el-form-item>
        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入电话号码"
            size="large"
            prefix-icon="Phone"
            clearable
          />
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            size="large"
            prefix-icon="Mail"
            clearable
          />
        </el-form-item>
        <el-form-item prop="role">
          <el-select
            v-model="registerForm.role"
            placeholder="请选择身份"
            size="large"
            style="width: 100%"
          >
            <el-option label="教师" value="teacher" />
            <el-option label="助教" value="assistant" />
            <el-option label="系统管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="register-button"
            :loading="loading"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '注册' }}
          </el-button>
        </el-form-item>
        <el-form-item class="login-link-center">
          <el-link type="primary" @click="goToLogin">已有账号？去登录</el-link>
        </el-form-item>
      </el-form>
      <div class="register-footer">
        <p class="demo-info">
          <el-icon><InfoFilled /></el-icon>
          注册后即可享受更多服务
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { validateEmail } from '@/utils/index';

export default {
  name: 'Register',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();

    const registerFormRef = ref();
    const loading = ref(false);

    const registerForm = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      realName: '',
      phone: '',
      email: '',
      role: 'teacher',
    });

    const registerRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' },
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
      ],
      confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== registerForm.password) {
              callback(new Error('两次输入的密码不一致'));
            } else {
              callback();
            }
          },
          trigger: 'blur',
        },
      ],
      realName: [
        { required: true, message: '请输入真实姓名', trigger: 'blur' },
      ],
      phone: [
        { required: true, message: '请输入电话号码', trigger: 'blur' },
        { pattern: /^1[0-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' },
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { validator: (rule, value, callback) => {
            if (validateEmail(value)) {
              callback();
            } else {
              callback(new Error('请输入有效的邮箱地址'));
            }
          }, trigger: 'blur' },
      ],
      role: [
        { required: true, message: '请选择身份', trigger: 'change' },
      ],
    };

    const handleRegister = async () => {
      if (!registerFormRef.value) return;

      try {
        await registerFormRef.value.validate();
        loading.value = true;

        const result = await userStore.register({
          username: registerForm.username,
          password: registerForm.password,
          realName: registerForm.realName,
          phone: registerForm.phone,
          email: registerForm.email,
          role: registerForm.role,
        });

        if (result.success) {
          ElMessage.success('注册成功，请登录');
          router.push('/login');
        } else {
          ElMessage.error(result.message || '注册失败，请稍后重试');
        }
      } catch (error) {
        console.error('注册失败:', error);
        ElMessage.error(error.message);
      } finally {
        loading.value = false;
      }
    };

    const goToLogin = () => {
      router.push('/login');
    };

    const showTitle = ref(false);
    const showSubtitle = ref(false);
    const showFeatures = ref([false, false, false, false]);

    onMounted(() => {
      setTimeout(() => {
        showTitle.value = true;
        setTimeout(() => {
          showSubtitle.value = true;
          showFeatures.value.forEach((_, index) => {
            setTimeout(() => {
              showFeatures.value[index] = true;
            }, index * 200);
          });
        }, 500);
      }, 500);
    });

    return {
      registerFormRef,
      loading,
      registerForm,
      registerRules,
      handleRegister,
      goToLogin,
      showTitle,
      showSubtitle,
      showFeatures,
    };
  },
};
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-box {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 40px;
  margin: auto;
  position: relative;
  z-index: 2;
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.register-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.register-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.register-form {
  width: 100%;
}

.register-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.register-footer {
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

.register-bg {
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

.register-bg::before {
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
  .register-container {
    flex-direction: column;
  }
  .register-bg, .register-box {
    width: 100%;
  }
  .register-box {
    max-width: 400px;
    margin: 20px auto;
  }
  .register-bg {
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