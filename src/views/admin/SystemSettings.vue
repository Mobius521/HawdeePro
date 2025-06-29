<template>
  <div class="system-settings">
    <div class="page-header">
      <h2>系统设置</h2>
    </div>

    <el-tabs v-model="activeTab" type="border-card">
      <!-- 基本设置 -->
      <el-tab-pane label="基本设置" name="basic">
        <el-form
          ref="basicFormRef"
          :model="basicForm"
          :rules="basicRules"
          label-width="120px"
          class="settings-form"
        >
          <el-form-item label="系统名称" prop="systemName">
            <el-input v-model="basicForm.systemName" placeholder="请输入系统名称" />
          </el-form-item>
          <el-form-item label="系统描述" prop="systemDescription">
            <el-input
              v-model="basicForm.systemDescription"
              type="textarea"
              :rows="3"
              placeholder="请输入系统描述"
            />
          </el-form-item>
          <el-form-item label="系统Logo" prop="systemLogo">
            <el-upload
              class="logo-uploader"
              action="#"
              :show-file-list="false"
              :before-upload="beforeLogoUpload"
            >
              <img v-if="basicForm.systemLogo" :src="basicForm.systemLogo" class="logo" />
              <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">建议尺寸：200x200px，支持 JPG、PNG 格式</div>
          </el-form-item>
          <el-form-item label="系统版本" prop="systemVersion">
            <el-input v-model="basicForm.systemVersion" disabled />
          </el-form-item>
          <el-form-item label="维护模式" prop="maintenanceMode">
            <el-switch
              v-model="basicForm.maintenanceMode"
              active-text="开启"
              inactive-text="关闭"
            />
            <div class="form-tip">开启后系统将进入维护模式，用户无法访问</div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveBasicSettings" :loading="basicLoading">
              保存设置
            </el-button>
            <el-button @click="resetBasicForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 安全设置 -->
      <el-tab-pane label="安全设置" name="security">
        <el-form
          ref="securityFormRef"
          :model="securityForm"
          :rules="securityRules"
          label-width="120px"
          class="settings-form"
        >
          <el-form-item label="密码最小长度" prop="minPasswordLength">
            <el-input-number
              v-model="securityForm.minPasswordLength"
              :min="6"
              :max="20"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="密码复杂度" prop="passwordComplexity">
            <el-checkbox-group v-model="securityForm.passwordComplexity">
              <el-checkbox label="uppercase">必须包含大写字母</el-checkbox>
              <el-checkbox label="lowercase">必须包含小写字母</el-checkbox>
              <el-checkbox label="number">必须包含数字</el-checkbox>
              <el-checkbox label="special">必须包含特殊字符</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="登录失败锁定" prop="loginLockEnabled">
            <el-switch
              v-model="securityForm.loginLockEnabled"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          <el-form-item label="失败次数限制" prop="maxLoginAttempts" v-if="securityForm.loginLockEnabled">
            <el-input-number
              v-model="securityForm.maxLoginAttempts"
              :min="3"
              :max="10"
              controls-position="right"
            />
            <span class="form-tip">次后锁定账户</span>
          </el-form-item>
          <el-form-item label="锁定时间" prop="lockDuration" v-if="securityForm.loginLockEnabled">
            <el-input-number
              v-model="securityForm.lockDuration"
              :min="5"
              :max="60"
              controls-position="right"
            />
            <span class="form-tip">分钟</span>
          </el-form-item>
          <el-form-item label="会话超时" prop="sessionTimeout">
            <el-input-number
              v-model="securityForm.sessionTimeout"
              :min="10"
              :max="480"
              controls-position="right"
            />
            <span class="form-tip">分钟</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveSecuritySettings" :loading="securityLoading">
              保存设置
            </el-button>
            <el-button @click="resetSecurityForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 邮件设置 -->
      <el-tab-pane label="邮件设置" name="email">
        <el-form
          ref="emailFormRef"
          :model="emailForm"
          :rules="emailRules"
          label-width="120px"
          class="settings-form"
        >
          <el-form-item label="SMTP服务器" prop="smtpServer">
            <el-input v-model="emailForm.smtpServer" placeholder="例如：smtp.gmail.com" />
          </el-form-item>
          <el-form-item label="SMTP端口" prop="smtpPort">
            <el-input-number
              v-model="emailForm.smtpPort"
              :min="1"
              :max="65535"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="发件人邮箱" prop="senderEmail">
            <el-input v-model="emailForm.senderEmail" placeholder="请输入发件人邮箱" />
          </el-form-item>
          <el-form-item label="发件人名称" prop="senderName">
            <el-input v-model="emailForm.senderName" placeholder="请输入发件人名称" />
          </el-form-item>
          <el-form-item label="邮箱密码" prop="emailPassword">
            <el-input
              v-model="emailForm.emailPassword"
              type="password"
              show-password
              placeholder="请输入邮箱密码或授权码"
            />
          </el-form-item>
          <el-form-item label="启用SSL" prop="enableSSL">
            <el-switch
              v-model="emailForm.enableSSL"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveEmailSettings" :loading="emailLoading">
              保存设置
            </el-button>
            <el-button @click="testEmailConnection" :loading="testLoading">
              测试连接
            </el-button>
            <el-button @click="resetEmailForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 存储设置 -->
      <el-tab-pane label="存储设置" name="storage">
        <el-form
          ref="storageFormRef"
          :model="storageForm"
          :rules="storageRules"
          label-width="120px"
          class="settings-form"
        >
          <el-form-item label="存储类型" prop="storageType">
            <el-radio-group v-model="storageForm.storageType">
              <el-radio label="local">本地存储</el-radio>
              <el-radio label="oss">阿里云OSS</el-radio>
              <el-radio label="cos">腾讯云COS</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <!-- 本地存储设置 -->
          <template v-if="storageForm.storageType === 'local'">
            <el-form-item label="存储路径" prop="localPath">
              <el-input v-model="storageForm.localPath" placeholder="请输入本地存储路径" />
            </el-form-item>
            <el-form-item label="最大文件大小" prop="maxFileSize">
              <el-input-number
                v-model="storageForm.maxFileSize"
                :min="1"
                :max="1000"
                controls-position="right"
              />
              <span class="form-tip">MB</span>
            </el-form-item>
          </template>

          <!-- 阿里云OSS设置 -->
          <template v-if="storageForm.storageType === 'oss'">
            <el-form-item label="AccessKey" prop="ossAccessKey">
              <el-input v-model="storageForm.ossAccessKey" placeholder="请输入AccessKey" />
            </el-form-item>
            <el-form-item label="SecretKey" prop="ossSecretKey">
              <el-input
                v-model="storageForm.ossSecretKey"
                type="password"
                show-password
                placeholder="请输入SecretKey"
              />
            </el-form-item>
            <el-form-item label="Bucket名称" prop="ossBucket">
              <el-input v-model="storageForm.ossBucket" placeholder="请输入Bucket名称" />
            </el-form-item>
            <el-form-item label="地域节点" prop="ossEndpoint">
              <el-input v-model="storageForm.ossEndpoint" placeholder="例如：oss-cn-hangzhou.aliyuncs.com" />
            </el-form-item>
          </template>

          <el-form-item>
            <el-button type="primary" @click="saveStorageSettings" :loading="storageLoading">
              保存设置
            </el-button>
            <el-button @click="resetStorageForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'SystemSettings',
  setup() {
    const activeTab = ref('basic')
    const basicFormRef = ref()
    const securityFormRef = ref()
    const emailFormRef = ref()
    const storageFormRef = ref()

    const basicLoading = ref(false)
    const securityLoading = ref(false)
    const emailLoading = ref(false)
    const storageLoading = ref(false)
    const testLoading = ref(false)

    // 基本设置表单
    const basicForm = reactive({
      systemName: '在线教学支持服务平台',
      systemDescription: '为教师提供全方位的在线教学支持服务',
      systemLogo: '',
      systemVersion: 'v1.0.0',
      maintenanceMode: false
    })

    // 安全设置表单
    const securityForm = reactive({
      minPasswordLength: 8,
      passwordComplexity: ['uppercase', 'lowercase', 'number'],
      loginLockEnabled: true,
      maxLoginAttempts: 5,
      lockDuration: 30,
      sessionTimeout: 120
    })

    // 邮件设置表单
    const emailForm = reactive({
      smtpServer: 'smtp.gmail.com',
      smtpPort: 587,
      senderEmail: '',
      senderName: '',
      emailPassword: '',
      enableSSL: true
    })

    // 存储设置表单
    const storageForm = reactive({
      storageType: 'local',
      localPath: '/uploads',
      maxFileSize: 50,
      ossAccessKey: '',
      ossSecretKey: '',
      ossBucket: '',
      ossEndpoint: ''
    })

    // 表单验证规则
    const basicRules = {
      systemName: [
        { required: true, message: '请输入系统名称', trigger: 'blur' }
      ],
      systemDescription: [
        { required: true, message: '请输入系统描述', trigger: 'blur' }
      ]
    }

    const securityRules = {
      minPasswordLength: [
        { required: true, message: '请设置密码最小长度', trigger: 'blur' }
      ],
      maxLoginAttempts: [
        { required: true, message: '请设置失败次数限制', trigger: 'blur' }
      ],
      lockDuration: [
        { required: true, message: '请设置锁定时间', trigger: 'blur' }
      ],
      sessionTimeout: [
        { required: true, message: '请设置会话超时时间', trigger: 'blur' }
      ]
    }

    const emailRules = {
      smtpServer: [
        { required: true, message: '请输入SMTP服务器地址', trigger: 'blur' }
      ],
      smtpPort: [
        { required: true, message: '请输入SMTP端口', trigger: 'blur' }
      ],
      senderEmail: [
        { required: true, message: '请输入发件人邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      senderName: [
        { required: true, message: '请输入发件人名称', trigger: 'blur' }
      ],
      emailPassword: [
        { required: true, message: '请输入邮箱密码', trigger: 'blur' }
      ]
    }

    const storageRules = {
      storageType: [
        { required: true, message: '请选择存储类型', trigger: 'change' }
      ],
      localPath: [
        { required: true, message: '请输入本地存储路径', trigger: 'blur' }
      ],
      maxFileSize: [
        { required: true, message: '请设置最大文件大小', trigger: 'blur' }
      ]
    }

    // Logo上传处理
    const beforeLogoUpload = (file) => {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG && !isPNG) {
        ElMessage.error('Logo只能是JPG或PNG格式!')
        return false
      }
      if (!isLt2M) {
        ElMessage.error('Logo大小不能超过2MB!')
        return false
      }

      // 模拟上传
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        basicForm.systemLogo = e.target.result
      }
      return false
    }

    // 保存基本设置
    const saveBasicSettings = async () => {
      if (!basicFormRef.value) return

      try {
        await basicFormRef.value.validate()
        basicLoading.value = true

        // 模拟API调用
        setTimeout(() => {
          ElMessage.success('基本设置保存成功')
          basicLoading.value = false
        }, 1000)
      } catch (error) {
        basicLoading.value = false
        console.error('表单验证失败:', error)
      }
    }

    // 保存安全设置
    const saveSecuritySettings = async () => {
      if (!securityFormRef.value) return

      try {
        await securityFormRef.value.validate()
        securityLoading.value = true

        // 模拟API调用
        setTimeout(() => {
          ElMessage.success('安全设置保存成功')
          securityLoading.value = false
        }, 1000)
      } catch (error) {
        securityLoading.value = false
        console.error('表单验证失败:', error)
      }
    }

    // 保存邮件设置
    const saveEmailSettings = async () => {
      if (!emailFormRef.value) return

      try {
        await emailFormRef.value.validate()
        emailLoading.value = true

        // 模拟API调用
        setTimeout(() => {
          ElMessage.success('邮件设置保存成功')
          emailLoading.value = false
        }, 1000)
      } catch (error) {
        emailLoading.value = false
        console.error('表单验证失败:', error)
      }
    }

    // 保存存储设置
    const saveStorageSettings = async () => {
      if (!storageFormRef.value) return

      try {
        await storageFormRef.value.validate()
        storageLoading.value = true

        // 模拟API调用
        setTimeout(() => {
          ElMessage.success('存储设置保存成功')
          storageLoading.value = false
        }, 1000)
      } catch (error) {
        storageLoading.value = false
        console.error('表单验证失败:', error)
      }
    }

    // 测试邮件连接
    const testEmailConnection = () => {
      testLoading.value = true
      
      // 模拟测试
      setTimeout(() => {
        ElMessage.success('邮件连接测试成功')
        testLoading.value = false
      }, 2000)
    }

    // 重置表单
    const resetBasicForm = () => {
      basicFormRef.value?.resetFields()
    }

    const resetSecurityForm = () => {
      securityFormRef.value?.resetFields()
    }

    const resetEmailForm = () => {
      emailFormRef.value?.resetFields()
    }

    const resetStorageForm = () => {
      storageFormRef.value?.resetFields()
    }

    onMounted(() => {
      // 加载设置数据
      console.log('加载系统设置...')
    })

    return {
      activeTab,
      basicFormRef,
      securityFormRef,
      emailFormRef,
      storageFormRef,
      basicLoading,
      securityLoading,
      emailLoading,
      storageLoading,
      testLoading,
      basicForm,
      securityForm,
      emailForm,
      storageForm,
      basicRules,
      securityRules,
      emailRules,
      storageRules,
      beforeLogoUpload,
      saveBasicSettings,
      saveSecuritySettings,
      saveEmailSettings,
      saveStorageSettings,
      testEmailConnection,
      resetBasicForm,
      resetSecurityForm,
      resetEmailForm,
      resetStorageForm
    }
  }
}
</script>

<style scoped>
.system-settings {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.settings-form {
  max-width: 600px;
  padding: 20px 0;
}

.logo-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-uploader:hover {
  border-color: #409eff;
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.logo {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}
</style> 