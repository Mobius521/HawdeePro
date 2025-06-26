<template>
    <el-card>
      <!-- 顶部筛选栏 -->
      <div class="toolbar">
        <el-input v-model="searchKeyword" placeholder="搜索作业标题" style="width: 200px" clearable />
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="截止日期"
          style="width: 300px"
        />
        <el-button @click="loadAssignments">查询</el-button>
      </div>
      <!-- 操作按钮栏 -->
      <div class="actions">
        <el-button type="danger" @click="batchDelete">批量删除</el-button>
      </div>
  
      <!-- 表格展示作业记录 -->
      <el-table :data="filteredAssignments" border @selection-change="handleSelection">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="title" label="作业标题" />
        <el-table-column prop="examName" label="试卷名称" />
        <el-table-column prop="beginTime" label="开始时间" />
        <el-table-column prop="deadline" label="截止时间" />
        <el-table-column label="操作" width="240">
          <template #default="scope">
            <el-button size="small" @click="edit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="remove(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- 编辑对话框 -->
      <el-dialog v-model="editVisible" title="编辑作业" width="500px">
  <el-form :model="form" label-width="100px">
    <el-form-item label="作业标题">
      <el-input v-model="form.title" />
    </el-form-item>
    <el-form-item label="作业说明">
      <el-input type="textarea" v-model="form.description" rows="4" />
    </el-form-item>
    <el-form-item label="开始时间">
      <el-date-picker v-model="form.startTime" type="datetime" placeholder="请选择开始时间" style="width: 100%;" />
    </el-form-item>
    <el-form-item label="截止时间">
      <el-date-picker v-model="form.deadline" type="datetime" placeholder="请选择截止时间" style="width: 100%;" />
    </el-form-item>
    <el-form-item label="试卷选择">
      <el-select v-model="form.examId" placeholder="请选择试卷">
        <el-option v-for="exam in exams" :key="exam.id" :label="exam.name" :value="exam.id" />
      </el-select>
    </el-form-item>
  </el-form>
  <template #footer>
    <el-button @click="editVisible = false">取消</el-button>
    <el-button type="primary" @click="submit">保存</el-button>
  </template>
</el-dialog>

    </el-card>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import axios from 'axios'
  import { ElMessage, ElMessageBox } from 'element-plus'
  
  const assignments = ref([])
  const exams = ref([])
  const searchKeyword = ref('')
  const dateRange = ref([])
  const selected = ref([])
  const form = ref({})
  const editVisible = ref(false)
  
  const loadAssignments = async () => {
    const res = await axios.get('/api/assignments')
    assignments.value = res.data.data
  }
  
  const loadExams = async () => {
    const res = await axios.get('/api/exams')
    exams.value = res.data.data
  }
  
  const filteredAssignments = computed(() => {
    return assignments.value.filter(a => {
      const matchesTitle = a.title.includes(searchKeyword.value)
      const inRange = dateRange.value.length === 2
        ? new Date(a.createdTime) >= new Date(dateRange.value[0]) && new Date(a.createdTime) <= new Date(dateRange.value[1])
        : true
      return matchesTitle && inRange
    })
  })
  
  const edit = (row) => {
    form.value = { ...row }
    editVisible.value = true
  }
  
  const submit = async () => {
    await axios.put(`/api/assignments/${form.value.id}`, form.value)
    ElMessage.success('修改成功')
    editVisible.value = false
    await loadAssignments()
  }
  
  const remove = async (row) => {
    ElMessageBox.confirm('确认删除该作业？', '提示').then(async () => {
      await axios.delete(`/api/assignments/${row.id}`)
      ElMessage.success('删除成功')
      await loadAssignments()
    })
  }
  
  const batchDelete = async () => {
    ElMessageBox.confirm('确认批量删除选中的作业？', '提示').then(async () => {
      const ids = selected.value.map(item => item.id)
      await axios.post('/api/assignments/deleteBatch', ids)
      ElMessage.success('批量删除成功')
      await loadAssignments()
    })
  }
  
  const handleSelection = (val) => {
    selected.value = val
  }
  
  onMounted(() => {
    loadAssignments()
    loadExams()
  })
  </script>
  
  <style scoped>
  .toolbar,
  .actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }
  </style>
  