<template>
    <div class="live-course-list">
      <el-card>
        <div class="header">
          <h2>直播课管理</h2>
          <el-button type="primary" @click="showCreateDialog = true">
            创建直播课
          </el-button>
        </div>
  
        <el-table :data="courses" style="width: 100%" border>
          <el-table-column prop="title" label="课程名称" />
          <el-table-column prop="startTime" label="开始时间" />
          <el-table-column prop="status" label="状态" />
          <el-table-column label="操作" width="240">
            <template #default="scope">
              <el-button size="small" @click="editCourse(scope.$index)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteCourse(scope.$index)">删除</el-button>
              <el-button size="small" type="success" @click="enterLiveRoom(scope.row.id)">进入直播</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
  
      <!-- 创建直播课对话框 -->
      <el-dialog title="创建直播课" v-model="showCreateDialog" width="400px">
        <el-form :model="newCourse" :rules="rules" ref="createForm">
          <el-form-item label="课程名称" prop="title">
            <el-input v-model="newCourse.title" placeholder="请输入课程名称" />
          </el-form-item>
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="newCourse.startTime"
              type="datetime"
              placeholder="选择开始时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="createCourse">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useRouter } from 'vue-router'
const router = useRouter()
  
  // 直播课数据示例
  const courses = ref([
    { id: 1, title: '高等数学直播课', startTime: '2025-07-01 09:00', status: '未开始' },
    { id: 2, title: '英语口语训练', startTime: '2025-07-02 14:00', status: '直播中' }
  ])
  
  // 创建对话框控制
  const showCreateDialog = ref(false)
  
  // 新建直播课表单数据
  const newCourse = ref({
    title: '',
    startTime: ''
  })
  
  // 表单验证规则
  const rules = {
    title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
    startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }]
  }
  
  // 表单引用
  const createForm = ref(null)
  
  // 编辑直播课（这里简单示例，可扩展）
  const editCourse = (index) => {
    ElMessage.info(`编辑直播课：${courses.value[index].title}`)
  }
  
  // 删除直播课
  const deleteCourse = async (index) => {
    try {
      await ElMessageBox.confirm(`确定删除直播课《${courses.value[index].title}》吗？`, '确认删除', {
        type: 'warning'
      })
      courses.value.splice(index, 1)
      ElMessage.success('删除成功')
    } catch {
      ElMessage.info('已取消删除')
    }
  }
  
  const enterLiveRoom = (id, role = 'host') => {
  const uid = 'zzy'
  const token = '000eJxjYGBQOF8qpHv6kf7yxY1fF1Q5vxEusPA3X/PVOeJRbdnu5/6GixgYGDjyy6ssCorLjTISuh4XhiTuyUi8kwgUZ8nKzMoE0sxVVZUMjAyjYKgBAB/5HQM='
  const userName = (role === 'host' ? '主播' : '访客') + uid.slice(-3)
  const query = { uid, token, userName, role }

  if (role !== 'host') {
    query.hostId = 'zzy' // ✅ 主播 uid
  }

  router.push({
    name: 'LiveRoom',
    params: { id },
    query
  })
}

  

  
  // 创建直播课
  const createCourse = () => {
    createForm.value.validate(valid => {
      if (!valid) return
  
      // 简单添加新课程，ID用时间戳模拟
      courses.value.push({
        id: Date.now(),
        title: newCourse.value.title,
        startTime: newCourse.value.startTime,
        status: '未开始'
      })
  
      ElMessage.success('创建成功')
      showCreateDialog.value = false
      newCourse.value.title = ''
      newCourse.value.startTime = ''
    })
  }
  </script>
  
  <style scoped>
  .live-course-list .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  </style>
  