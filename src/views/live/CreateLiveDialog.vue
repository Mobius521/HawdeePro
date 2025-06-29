<template>
  <div class="live-room">
    <div class="video-area">
      <div id="video-container" class="video-box"></div>
    </div>

    <div class="top-bar">
      <el-button type="danger" @click="leaveChannel" :disabled="!joined">离开直播间</el-button>
      <el-button @click="toggleToolbox">{{ toolboxCollapsed ? '展开工具栏' : '收起工具栏' }}</el-button>
    </div>

    <transition name="fade">
      <div v-if="!toolboxCollapsed && isHost" class="toolbox">
        <el-button @click="startScreenShare">屏幕共享</el-button>
        <el-button @click="toggleRecording">{{ isRecording ? '停止录制' : '开始录制' }}</el-button>
        <el-button @click="openVoteDialog">发起投票</el-button>
      </div>
    </transition>

    <div class="chat-box" ref="chatBox" @mousedown="startDrag" :style="{ top: chatPosition.top + 'px', left: chatPosition.left + 'px' }">
      <div class="chat-header">实时消息</div>
      <div class="chat-content">
        <div class="chat-messages">
          <div v-for="msg in messageList" :key="msg.id" class="chat-message">
            <strong>{{ msg.userName || msg.uid }}：</strong>{{ msg.text }}
          </div>
        </div>
        <div class="chat-input">
          <el-input v-model="messageText" placeholder="输入消息" @keyup.enter="sendMessage" />
          <el-button @click="sendMessage">发送</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import DingRTC from 'dingrtc'
import RTM from '@dingrtc/rtm'
import { ElMessage } from 'element-plus'

const route = useRoute()
const uid = route.query.uid
const token = route.query.token
const userName = route.query.userName
const isHost = route.query.role === 'host'
const hostId = isHost ? uid : route.query.hostId || null
if (!isHost && !hostId) {
  ElMessage.error('未提供 hostId，无法进入直播间')
  throw new Error('Missing hostId')
}

const joined = ref(false)
const isRecording = ref(false)
const toolboxCollapsed = ref(false)
const chatPosition = reactive({ top: 100, left: window.innerWidth - 320 })
const messageText = ref('')
const messageList = ref([])
let messageCounter = 0
let client = null
let cameraTrack = null
let micTrack = null
let screenTrack = null
let mediaRecorder = null
let recordedChunks = []

const sessionId = 'lesson-session'
const rtm = new RTM()

function appendTrackToContainer(track) {
  const el = document.getElementById('video-container')
  if (el) {
    el.innerHTML = ''
    track.play(el)
  }
}

async function joinChannel() {
  try {
    client = DingRTC.createClient()
    client.register(rtm)

    rtm.on('message', (data) => {
      const decoder = new TextDecoder()
      const msgString = decoder.decode(data.message)
      try {
        const parsed = JSON.parse(msgString)
        messageList.value.push({ id: messageCounter++, ...parsed })
      } catch {
        messageList.value.push({ id: messageCounter++, uid: data.uid, userName: data.uid, text: msgString })
      }
    })

    await client.join({ appId: 'owz8psw2', token, uid, channel: 'channel1', userName })
    await rtm.joinSession(sessionId)

    if (isHost) {
      cameraTrack = await DingRTC.createCameraVideoTrack({ frameRate: 15, dimension: 'VD_1280x720' })
      micTrack = await DingRTC.createMicrophoneAudioTrack()
      appendTrackToContainer(cameraTrack)
      await client.publish([cameraTrack, micTrack])
    } else {
      const videoTrack = await client.subscribe(hostId, 'video')
      appendTrackToContainer(videoTrack)
      const audioTrack = await client.subscribe('mcu', 'audio')
      audioTrack.play()
    }

    joined.value = true

    client.on('user-unpublished', () => {
      const el = document.getElementById('video-container')
      if (el) el.innerHTML = ''
    })

  } catch (error) {
    console.error('加入失败:', error)
  }
}

async function leaveChannel() {
  if (!joined.value) return
  try {
    await rtm.leaveSession(sessionId)
    await client.unpublish([cameraTrack, micTrack, screenTrack].filter(Boolean))
    ;[cameraTrack, micTrack, screenTrack].forEach(track => track?.stop?.() && track?.close?.())
    await client.leave()
    joined.value = false
    const el = document.getElementById('video-container')
    if (el) el.innerHTML = ''
  } catch (error) {
    console.error('离开失败:', error)
  }
}

async function startScreenShare() {
  try {
    [screenTrack] = await DingRTC.createScreenVideoTrack({ frameRate: 15, dimension: 'VD_1280x720' })
    await client.publish(screenTrack)
    appendTrackToContainer(screenTrack)
  } catch (error) {
    console.error('屏幕共享失败:', error)
  }
}

function toggleRecording() {
  const stream = document.querySelector('video')?.captureStream?.()
  if (!stream) return alert('无法获取视频流')
  if (!isRecording.value) {
    recordedChunks = []
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data) }
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lesson-${Date.now()}.webm`
      a.click()
    }
    mediaRecorder.start()
    isRecording.value = true
  } else {
    mediaRecorder.stop()
    isRecording.value = false
  }
}

function sendMessage() {
  if (!messageText.value) return
  const encoder = new TextEncoder()
  const message = JSON.stringify({ uid, userName, text: messageText.value })
  rtm.publish(sessionId, encoder.encode(message))
  messageText.value = ''
}

function openVoteDialog() {
  alert('TODO: 弹出投票对话框')
}

function toggleToolbox() {
  toolboxCollapsed.value = !toolboxCollapsed.value
}

const chatBox = ref(null)
let dragging = false
let dragStart = { x: 0, y: 0 }
let chatStart = { top: 0, left: 0 }

function startDrag(e) {
  if (e.target !== chatBox.value.querySelector('.chat-header')) return
  dragging = true
  dragStart = { x: e.clientX, y: e.clientY }
  chatStart = { ...chatPosition }
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', endDrag)
}

function onDrag(e) {
  if (!dragging) return
  const dx = e.clientX - dragStart.x
  const dy = e.clientY - dragStart.y
  chatPosition.top = Math.min(Math.max(chatStart.top + dy, 10), window.innerHeight - 320)
  chatPosition.left = Math.min(Math.max(chatStart.left + dx, 10), window.innerWidth - 310)
}

function endDrag() {
  dragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', endDrag)
}

onMounted(() => { joinChannel() })
onBeforeUnmount(() => { leaveChannel() })
</script>

<style scoped>
.live-room {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
}

.video-area {
  width: 100%;
  height: 100%;
  position: relative;
}

.video-box {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #000;
}

.top-bar {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 10px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px;
  border-radius: 8px;
  align-items: center;
}

.toolbox {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px;
  border-radius: 8px;
}

.chat-box {
  position: absolute;
  right: 10px;
  bottom: 10px;
  width: 320px;
  height: 350px;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 0 15px rgba(0,0,0,0.5);
  z-index: 10;
  cursor: default;
  user-select: none;
}

.chat-header {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 8px;
  cursor: move;
  user-select: none;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #222;
}

.chat-message {
  margin-bottom: 6px;
}

.chat-input {
  display: flex;
  gap: 5px;
  margin-top: 5px;
}
</style>
