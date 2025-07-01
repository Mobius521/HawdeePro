<template>
    <div class="live-room">
      <el-card>
        <div class="live-header">
          <h2>直播教室 - {{ courseTitle }}</h2>
          <div class="actions">
            <el-button type="primary" @click="startScreenShare">开始屏幕共享</el-button>
            <el-button type="warning" @click="openVoteDialog">投票互动</el-button>
            <el-button type="success" @click="startRecording" :disabled="recording">
              {{ recording ? '录制中...' : '开始录制' }}
            </el-button>
            <el-button type="info" @click="stopRecording" :disabled="!recording">停止录制</el-button>
            <el-button type="primary" @click="openVideoEditor" :disabled="!recordedVideoUrl">剪辑课程视频</el-button>
            <el-button type="success" @click="saveVideo" :disabled="!editedVideoUrl">保存课程视频</el-button>
          </div>
        </div>
  
        <div class="live-content">
          <div class="video-area">
            <!-- 直播视频占位 -->
            <div class="video-placeholder">直播视频区域</div>
          </div>
  
          <div class="interaction-area">
            <el-card class="question-panel" header="互动问答">
              <div class="question-list">
                <div v-for="(q, idx) in questions" :key="idx" class="question-item">
                  <strong>{{ q.user }}:</strong> {{ q.content }}
                </div>
              </div>
              <el-input
                v-model="newQuestion"
                placeholder="输入你的问题"
                @keyup.enter.native="sendQuestion"
                clearable
              />
              <el-button type="primary" @click="sendQuestion" :disabled="!newQuestion.trim()">发送</el-button>
            </el-card>
          </div>
        </div>
      </el-card>
  
      <!-- 投票互动弹窗 -->
      <el-dialog title="投票互动" v-model="showVoteDialog" width="400px">
        <el-form :model="voteForm" label-width="80px">
          <el-form-item label="问题">
            <el-input v-model="voteForm.question" placeholder="请输入投票问题" />
          </el-form-item>
          <el-form-item label="选项">
            <el-input
              v-for="(option, index) in voteForm.options"
              :key="index"
              v-model="voteForm.options[index]"
              placeholder="投票选项"
              style="margin-bottom: 8px;"
            />
            <el-button size="small" @click="addVoteOption" :disabled="voteForm.options.length >= 6">添加选项</el-button>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showVoteDialog = false">取消</el-button>
          <el-button type="primary" @click="submitVote">提交</el-button>
        </template>
      </el-dialog>
  
      <!-- 视频剪辑弹窗（简单占位） -->
      <el-dialog title="课程视频剪辑" v-model="showVideoEditor" width="600px">
        <div>这里放视频剪辑相关功能</div>
        <template #footer>
          <el-button @click="showVideoEditor = false">关闭</el-button>
          <el-button type="primary" @click="confirmEdit">确认保存剪辑</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref,defineProps, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
})
  // 课程名可以通过props或路由参数传入，这里简单模拟
  const courseTitle = ref('高等数学直播课')
  
  // 互动问答数据
  const questions = ref([
    { user: '学生A', content: '老师，请问这个公式怎么证明？' },
    { user: '学生B', content: '直播课什么时候结束？' }
  ])
  const newQuestion = ref('')
  
  // 投票弹窗控制
  const showVoteDialog = ref(false)
  const voteForm = ref({
    question: '',
    options: ['', '']
  })
  
  // 视频剪辑弹窗控制
  const showVideoEditor = ref(false)
  
  // 录制相关状态
  const recording = ref(false)
  const recordedVideoUrl = ref(null)
  const editedVideoUrl = ref(null)
  
  const startScreenShare = () => {
    ElMessage.info('开始屏幕共享（需集成具体实现）')
  }
  
  const openVoteDialog = () => {
    showVoteDialog.value = true
  }
  
  const addVoteOption = () => {
    if (voteForm.value.options.length < 6) voteForm.value.options.push('')
  }
  
  const submitVote = () => {
    if (!voteForm.value.question.trim()) {
      ElMessage.warning('请输入投票问题')
      return
    }
    if (voteForm.value.options.some(opt => !opt.trim())) {
      ElMessage.warning('请填写所有投票选项')
      return
    }
    ElMessage.success('投票创建成功（需后端支持）')
    showVoteDialog.value = false
    voteForm.value.question = ''
    voteForm.value.options = ['', '']
  }
  
  const sendQuestion = () => {
    const content = newQuestion.value.trim()
    if (!content) return
    questions.value.push({ user: '老师', content })
    newQuestion.value = ''
  }
  
  const startRecording = () => {
    if (recording.value) {
      ElMessage.warning('录制已开始')
      return
    }
    recording.value = true
    ElMessage.success('开始录制课程视频（需集成具体实现）')
  }
  
  const stopRecording = () => {
    if (!recording.value) {
      ElMessage.warning('还未开始录制')
      return
    }
    recording.value = false
    recordedVideoUrl.value = 'mocked_video_url.mp4' // 模拟录制后的视频地址
    ElMessage.success('停止录制，视频已保存')
  }
  
  const openVideoEditor = () => {
    if (!recordedVideoUrl.value) {
      ElMessage.warning('请先录制视频')
      return
    }
    showVideoEditor.value = true
  }
  
  const confirmEdit = () => {
    editedVideoUrl.value = recordedVideoUrl.value + '?edited=true' // 模拟剪辑后的视频
    showVideoEditor.value = false
    ElMessage.success('视频剪辑保存成功')
  }
  
  const saveVideo = () => {
    if (!editedVideoUrl.value) {
      ElMessage.warning('请先完成视频剪辑')
      return
    }
    ElMessage.success('课程视频保存成功（需后端支持）')
  }
  </script>
  
  <style scoped>
  .live-room .live-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .live-content {
    display: flex;
    gap: 20px;
  }
  .video-area {
    flex: 3;
    background: #f0f0f0;
    height: 360px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #888;
    font-size: 18px;
  }
  .interaction-area {
    flex: 1;
  }
  .question-list {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 10px;
  }
  .question-item {
    padding: 5px 0;
    border-bottom: 1px solid #eee;
  }
  </style>
  