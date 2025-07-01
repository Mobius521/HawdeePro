<template>
    <el-card class="assignment-card" shadow="hover">
      <div class="card-header">
        <h2 class="card-title">发布新作业</h2>
      </div>
      <el-form :model="form" label-width="100px" class="assignment-form">
        <el-form-item label="作业标题">
          <el-input v-model="form.title" placeholder="请输入作业标题" />
        </el-form-item>
        <el-form-item label="作业说明">
          <el-input type="textarea" v-model="form.description" rows="5" placeholder="填写简要说明" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="截止时间">
          <el-date-picker
            v-model="form.deadline"
            type="datetime"
            placeholder="选择截止时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="选择试卷">
          <el-select v-model="form.examId" placeholder="请选择关联试卷" filterable>
            <el-option
              v-for="exam in exams"
              :key="exam.id"
              :label="exam.name"
              :value="exam.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="form-buttons">
          <el-button type="primary" @click="submit" :icon="Check">发布作业</el-button>
          <el-button @click="reset" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  import { Check, Refresh } from '@element-plus/icons-vue'
  
  const form = ref({
    title: '',
    description: '',
    startTime: '',
    deadline: '',
    examId: ''
  })
  const exams = ref([])
  const router = useRouter()
  
  const loadExams = async () => {
    try {
      const res = await axios.get('/api/exams')
      exams.value = res.data.data
    } catch (error) {
      ElMessage.error('加载试卷失败，请稍后重试')
      console.error('加载试卷失败:', error)
    }
  }
  
  const submit = async () => {
    if (!form.value.title || !form.value.startTime || !form.value.deadline || !form.value.examId) {
      ElMessage.warning('请填写完整信息')
      return
    }
  
    if (form.value.startTime >= form.value.deadline) {
      ElMessage.warning('开始时间必须早于截止时间')
      return
    }
  
    try {
      await axios.post('/api/assignments', form.value)
      ElMessage.success('发布成功')
      router.push('/assignment/edit')
    } catch (error) {
      ElMessage.error('发布失败，请稍后重试')
      console.error('发布失败:', error)
    }
  }
  
  const reset = () => {
    form.value = {
      title: '',
      description: '',
      startTime: '',
      deadline: '',
      examId: ''
    }
  }
  
  onMounted(loadExams)
  </script>
  
  <style scoped>
  .assignment-card {
    margin: 40px auto;
    max-width: 700px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .card-header {
    margin-bottom: 20px;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 15px;
  }
  
  .card-title {
    font-size: 1.5rem;
    color: #409EFF;
    margin: 0;
    text-align: center;
  }
  
  .assignment-form {
    max-width: 600px;
    margin: auto;
  }
  
  .form-buttons {
    margin-top: 30px;
    display: flex;
    justify-content: center;
  }
  
  .el-button {
    padding: 12px 20px;
    margin: 0 10px;
  }
  
  .el-form-item {
    margin-bottom: 22px;
  }
  
  :deep(.el-input__inner) {
    border-radius: 4px;
  }
  
  :deep(.el-textarea__inner) {
    border-radius: 4px;
  }
  
  /* 确保日期选择器样式一致 */
  :deep(.el-date-editor.el-input) {
    width: 100%;
  }
  </style>