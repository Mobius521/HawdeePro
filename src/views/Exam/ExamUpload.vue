<template>
    <div class="paper-upload">
        <div class="header">
            <h2>上传试卷</h2>
            <el-button @click="goBack">
                <el-icon>
                    <ArrowLeft />
                </el-icon>
                返回试卷列表
            </el-button>
        </div>

        <!-- 步骤条 -->
        <el-steps :active="currentStep" finish-status="success" style="margin-bottom: 30px;">
            <el-step title="上传文件" description="选择试卷文件并上传" />
            <el-step title="识别解析" description="系统自动识别试卷内容" />
            <el-step title="确认信息" description="确认试卷信息和题目" />
            <el-step title="完成上传" description="保存试卷到系统" />
        </el-steps>

        <!-- 第一步：文件上传 -->
        <el-card v-if="currentStep === 0" class="upload-card">
            <template #header>
                <span>上传试卷文件</span>
            </template>

            <div class="upload-section">
                <el-upload ref="uploadRef" class="upload-dragger" drag :auto-upload="false"
                    :on-change="handleFileChange" :before-upload="beforeUpload" accept=".doc,.docx,.pdf,.txt" :limit="1"
                    :file-list="fileList">
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">
                        将文件拖到此处，或<em>点击上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            支持 Word文档(.doc/.docx)、PDF文件(.pdf)、文本文件(.txt)，文件大小不超过10MB
                        </div>
                    </template>
                </el-upload>

                <div v-if="uploadedFile" class="file-info">
                    <h3>已选择文件：</h3>
                    <div class="file-item">
                        <el-icon>
                            <Document />
                        </el-icon>
                        <span>{{ uploadedFile.name }}</span>
                        <span class="file-size">({{ formatFileSize(uploadedFile.size) }})</span>
                        <el-button size="small" type="danger" @click="removeFile">删除</el-button>
                    </div>
                </div>

                <div class="upload-actions">
                    <el-button type="primary" size="large" @click="startParsing" :disabled="!uploadedFile"
                        :loading="parsing">
                        <el-icon>
                            <MagicStick />
                        </el-icon>
                        开始解析
                    </el-button>
                </div>
            </div>
        </el-card>

        <!-- 第二步：解析进度 -->
        <el-card v-if="currentStep === 1" class="upload-card">
            <template #header>
                <span>正在解析试卷内容...</span>
            </template>

            <div class="parsing-section">
                <el-progress :percentage="parseProgress" :status="parseProgress === 100 ? 'success' : ''"
                    :stroke-width="8" />
                <div class="parsing-status">
                    <p>{{ parseStatusText }}</p>
                </div>

                <div v-if="parseProgress === 100" class="parse-result">
                    <el-alert title="解析完成！" :description="`成功识别 ${questions.length} 道题目`" type="success" show-icon
                        :closable="false" />

                    <div class="result-actions">
                        <el-button type="primary" @click="nextStep">下一步：确认信息</el-button>
                        <el-button @click="reParse">重新解析</el-button>
                    </div>
                </div>
            </div>
        </el-card>

        <!-- 第三步：确认信息 -->
        <el-card v-if="currentStep === 2" class="upload-card">
            <template #header>
                <span>确认试卷信息</span>
            </template>

            <el-form :model="paperForm" :rules="paperRules" ref="paperFormRef" label-width="120px">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="试卷名称" prop="title">
                            <el-input v-model="paperForm.title" placeholder="请输入试卷名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="科目" prop="subject">
                            <el-select v-model="paperForm.subject" placeholder="请选择科目" style="width: 100%;">
                                <el-option label="数学" value="数学" />
                                <el-option label="语文" value="语文" />
                                <el-option label="英语" value="英语" />
                                <el-option label="物理" value="物理" />
                                <el-option label="化学" value="化学" />
                                <el-option label="计算机" value="计算机" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="难度等级" prop="difficulty">
                            <el-select v-model="paperForm.difficulty" placeholder="请选择难度" style="width: 100%;">
                                <el-option label="简单" value="简单" />
                                <el-option label="中等" value="中等" />
                                <el-option label="困难" value="困难" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="总分">
                            <el-input-number v-model="paperForm.totalScore" :min="50" :max="200" :step="10"
                                style="width: 100%;" />
                            <span style="margin-left: 10px; color: #909399;">
                                (当前题目总分: {{ totalQuestionScore }})
                            </span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="预计用时">
                            <el-input-number v-model="paperForm.estimatedTime" :min="30" :max="300" :step="15"
                                style="width: 100%;" />
                            <span style="margin-left: 10px;">分钟</span>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="试卷描述">
                    <el-input v-model="paperForm.description" type="textarea" :rows="3" placeholder="请输入试卷描述（选填）" />
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 题目预览区域 -->
        <el-card v-if="currentStep === 2 && questions.length > 0" class="upload-card">
            <template #header>
                <div class="card-header">
                    <span>题目预览 (共 {{ questions.length }} 题)</span>
                    <div class="view-mode-switch">
                        <el-radio-group v-model="viewMode" size="small">
                            <el-radio-button label="complete">完整试卷</el-radio-button>
                            <el-radio-button label="single">逐题查看</el-radio-button>
                        </el-radio-group>
                    </div>
                </div>
            </template>

            <!-- 完整试卷查看模式 -->
            <div v-if="viewMode === 'complete'" class="complete-view">
                <div class="paper-header">
                    <h2>{{ paperForm.title || '试卷预览' }}</h2>
                    <div class="paper-info">
                        <span>科目：{{ paperForm.subject || '未设置' }}</span>
                        <span>总分：{{ paperForm.totalScore }}分</span>
                        <span>时间：{{ paperForm.estimatedTime }}分钟</span>
                    </div>
                </div>

                <div class="questions-list">
                    <div v-for="(question, index) in questions" :key="question.id" class="question-item">
                        <div class="question-header">
                            <span class="question-number">{{ index + 1 }}.</span>
                            <span class="question-type">[{{ question.type }}]</span>
                            <span class="question-score">({{ question.score }}分)</span>
                            <div class="question-actions">
                                <el-button size="small" @click="editQuestion(index)">
                                    <el-icon>
                                        <Edit />
                                    </el-icon>
                                    编辑
                                </el-button>
                                <el-button size="small" type="danger" @click="deleteQuestion(index)">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                    删除
                                </el-button>
                            </div>
                        </div>
                        <div class="question-content">{{ question.content }}</div>
                        <div v-if="question.options && question.options.length > 0" class="question-options">
                            <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
                                {{ String.fromCharCode(65 + optIndex) }}. {{ option }}
                            </div>
                        </div>
                        <div v-if="question.answer" class="question-answer">
                            <strong>参考答案：</strong>{{ question.answer }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 逐题查看模式 -->
            <div v-if="viewMode === 'single'" class="single-view">
                <div class="question-navigation">
                    <el-button @click="prevQuestion" :disabled="currentQuestionIndex === 0" size="small">
                        <el-icon>
                            <ArrowLeft />
                        </el-icon>
                        上一题
                    </el-button>

                    <span class="question-counter">
                        第 {{ currentQuestionIndex + 1 }} 题 / 共 {{ questions.length }} 题
                    </span>

                    <el-button @click="nextQuestion" :disabled="currentQuestionIndex === questions.length - 1"
                        size="small">
                        下一题
                        <el-icon>
                            <ArrowRight />
                        </el-icon>
                    </el-button>
                </div>

                <div v-if="currentQuestion" class="current-question">
                    <div class="question-card-single">
                        <div class="question-header-single">
                            <div class="question-info">
                                <el-tag type="primary">{{ currentQuestion.type }}</el-tag>
                                <el-tag type="warning">{{ currentQuestion.score }}分</el-tag>
                            </div>
                            <div class="question-actions">
                                <el-button size="small" @click="editQuestion(currentQuestionIndex)">
                                    <el-icon>
                                        <Edit />
                                    </el-icon>
                                    编辑此题
                                </el-button>
                                <el-button size="small" type="danger" @click="deleteQuestion(currentQuestionIndex)">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                    删除此题
                                </el-button>
                            </div>
                        </div>

                        <div class="question-content-single">
                            <h3>题目内容：</h3>
                            <p>{{ currentQuestion.content }}</p>

                            <div v-if="currentQuestion.options && currentQuestion.options.length > 0">
                                <h4>选项：</h4>
                                <div class="options-list">
                                    <div v-for="(option, optIndex) in currentQuestion.options" :key="optIndex"
                                        class="option-item-single">
                                        {{ String.fromCharCode(65 + optIndex) }}. {{ option }}
                                    </div>
                                </div>
                            </div>

                            <div v-if="currentQuestion.answer">
                                <h4>参考答案：</h4>
                                <div class="answer-content">{{ currentQuestion.answer }}</div>
                            </div>

                            <div v-if="currentQuestion.explanation">
                                <h4>解析：</h4>
                                <div class="explanation-content">{{ currentQuestion.explanation }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 题目缩略图导航 -->
                <div class="question-thumbnails">
                    <div v-for="(question, index) in questions" :key="question.id" class="thumbnail-item"
                        :class="{ active: index === currentQuestionIndex }" @click="currentQuestionIndex = index">
                        <span class="thumbnail-number">{{ index + 1 }}</span>
                        <span class="thumbnail-type">{{ question.type }}</span>
                    </div>
                </div>
            </div>
        </el-card>

        <!-- 操作按钮 -->
        <div class="form-actions">
            <el-button v-if="currentStep > 0" @click="prevStep" size="large">上一步</el-button>
            <el-button v-if="currentStep === 2" @click="saveDraft" size="large">保存草稿</el-button>
            <el-button v-if="currentStep === 2" type="primary" size="large" @click="submitPaper" :loading="submitting">
                发布试卷
            </el-button>
        </div>

        <!-- 编辑题目对话框 -->
        <el-dialog v-model="showQuestionDialog" title="编辑题目" width="800px">
            <el-form :model="questionForm" :rules="questionRules" ref="questionFormRef" label-width="100px">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="题目类型" prop="type">
                            <el-select v-model="questionForm.type" placeholder="请选择题目类型" @change="onQuestionTypeChange">
                                <el-option label="选择题" value="选择题" />
                                <el-option label="填空题" value="填空题" />
                                <el-option label="判断题" value="判断题" />
                                <el-option label="简答题" value="简答题" />
                                <el-option label="计算题" value="计算题" />
                                <el-option label="证明题" value="证明题" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="分值" prop="score">
                            <el-input-number v-model="questionForm.score" :min="1" :max="50" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="题目内容" prop="content">
                    <el-input v-model="questionForm.content" type="textarea" :rows="4" placeholder="请输入题目内容" />
                </el-form-item>

                <!-- 选择题选项 -->
                <div v-if="questionForm.type === '选择题'">
                    <el-form-item label="选项设置">
                        <div v-for="(option, index) in questionForm.options" :key="index" class="option-input">
                            <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                            <el-input v-model="questionForm.options[index]" placeholder="请输入选项内容" />
                            <el-button v-if="questionForm.options.length > 2" size="small" type="danger"
                                @click="removeOption(index)">
                                删除
                            </el-button>
                        </div>
                        <el-button v-if="questionForm.options.length < 6" size="small" type="primary"
                            @click="addOption">
                            添加选项
                        </el-button>
                    </el-form-item>

                    <el-form-item label="正确答案" prop="answer">
                        <el-select v-model="questionForm.answer" placeholder="请选择正确答案">
                            <el-option v-for="(option, index) in questionForm.options" :key="index"
                                :label="`${String.fromCharCode(65 + index)}. ${option}`"
                                :value="String.fromCharCode(65 + index)" />
                        </el-select>
                    </el-form-item>
                </div>

                <!-- 判断题 -->
                <div v-if="questionForm.type === '判断题'">
                    <el-form-item label="正确答案" prop="answer">
                        <el-radio-group v-model="questionForm.answer">
                            <el-radio label="正确">正确</el-radio>
                            <el-radio label="错误">错误</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </div>

                <!-- 其他题型的答案 -->
                <div v-if="['填空题', '简答题', '计算题', '证明题'].includes(questionForm.type)">
                    <el-form-item label="参考答案" prop="answer">
                        <el-input v-model="questionForm.answer" type="textarea" :rows="3" placeholder="请输入参考答案" />
                    </el-form-item>
                </div>

                <el-form-item label="解析说明">
                    <el-input v-model="questionForm.explanation" type="textarea" :rows="2" placeholder="请输入解析说明（选填）" />
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showQuestionDialog = false">取消</el-button>
                    <el-button type="primary" @click="saveQuestion">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    ArrowLeft, ArrowRight, Edit, Delete, Document,
    UploadFilled, MagicStick
} from '@element-plus/icons-vue'

// 响应式数据
const submitting = ref(false)
const parsing = ref(false)
const showQuestionDialog = ref(false)
const editingIndex = ref(-1)
const currentStep = ref(0)
const parseProgress = ref(0)
const parseStatusText = ref('')
const uploadedFile = ref(null)
const fileList = ref([])
const viewMode = ref('complete')
const currentQuestionIndex = ref(0)

// 表单引用
const paperFormRef = ref()
const questionFormRef = ref()
const uploadRef = ref()

// 试卷表单
const paperForm = reactive({
    title: '',
    subject: '',
    difficulty: '',
    totalScore: 100,
    estimatedTime: 90,
    description: ''
})

// 题目列表
const questions = ref([])

// 题目表单
const questionForm = reactive({
    type: '',
    score: 5,
    content: '',
    options: ['', ''],
    answer: '',
    explanation: ''
})

// 表单验证规则
const paperRules = {
    title: [
        { required: true, message: '请输入试卷名称', trigger: 'blur' }
    ],
    subject: [
        { required: true, message: '请选择科目', trigger: 'change' }
    ],
    difficulty: [
        { required: true, message: '请选择难度等级', trigger: 'change' }
    ]
}

const questionRules = {
    type: [
        { required: true, message: '请选择题目类型', trigger: 'change' }
    ],
    score: [
        { required: true, message: '请输入分值', trigger: 'blur' }
    ],
    content: [
        { required: true, message: '请输入题目内容', trigger: 'blur' }
    ],
    answer: [
        { required: true, message: '请输入答案', trigger: 'blur' }
    ]
}

// 计算属性
const totalQuestionScore = computed(() => {
    return questions.value.reduce((sum, question) => sum + question.score, 0)
})

const currentQuestion = computed(() => {
    return questions.value[currentQuestionIndex.value] || null
})

// 方法
const goBack = () => {
    ElMessage.info('返回试卷列表')
}

const formatFileSize = (size) => {
    if (size < 1024) return size + ' B'
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
    return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

const beforeUpload = (file) => {
    const isValidType = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf', 'text/plain'].includes(file.type)
    const isLt10M = file.size / 1024 / 1024 < 10

    if (!isValidType) {
        ElMessage.error('只能上传 Word、PDF 或文本文件!')
        return false
    }
    if (!isLt10M) {
        ElMessage.error('文件大小不能超过 10MB!')
        return false
    }
    return false // 阻止自动上传
}

const handleFileChange = (file) => {
    uploadedFile.value = file.raw
    fileList.value = [file]

    // 自动提取文件名作为试卷标题
    const fileName = file.name.replace(/\.[^/.]+$/, "")
    paperForm.title = fileName
}

const removeFile = () => {
    uploadedFile.value = null
    fileList.value = []
    uploadRef.value?.clearFiles()
}

const startParsing = () => {
    if (!uploadedFile.value) {
        ElMessage.warning('请先选择文件')
        return
    }

    parsing.value = true
    currentStep.value = 1
    parseProgress.value = 0

    // 模拟解析过程
    const parseSteps = [
        { progress: 20, text: '正在读取文件内容...' },
        { progress: 40, text: '正在识别文档结构...' },
        { progress: 60, text: '正在提取题目信息...' },
        { progress: 80, text: '正在分析题目类型...' },
        { progress: 100, text: '解析完成！' }
    ]

    let stepIndex = 0
    const timer = setInterval(() => {
        if (stepIndex < parseSteps.length) {
            parseProgress.value = parseSteps[stepIndex].progress
            parseStatusText.value = parseSteps[stepIndex].text
            stepIndex++
        } else {
            clearInterval(timer)
            parsing.value = false

            // 模拟解析结果
            questions.value = [
                {
                    id: 1,
                    type: '选择题',
                    score: 5,
                    content: '下列哪个选项是正确的？',
                    options: ['选项A', '选项B', '选项C', '选项D'],
                    answer: 'A',
                    explanation: '这是解析说明'
                },
                {
                    id: 2,
                    type: '填空题',
                    score: 8,
                    content: '请填写正确答案：______',
                    answer: '正确答案',
                    explanation: '填空题解析'
                },
                {
                    id: 3,
                    type: '简答题',
                    score: 15,
                    content: '请简述相关概念。',
                    answer: '这是简答题的参考答案...',
                    explanation: '简答题解析说明'
                }
            ]

            // 自动计算总分
            paperForm.totalScore = totalQuestionScore.value

            // 根据题目数量估算时间
            paperForm.estimatedTime = Math.max(30, questions.value.length * 3)
        }
    }, 800)
}

const reParse = () => {
    parseProgress.value = 0
    currentStep.value = 0
    questions.value = []
}

const nextStep = () => {
    currentStep.value++
}

const prevStep = () => {
    currentStep.value--
}

const prevQuestion = () => {
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--
    }
}

const nextQuestion = () => {
    if (currentQuestionIndex.value < questions.value.length - 1) {
        currentQuestionIndex.value++
    }
}

const editQuestion = (index) => {
    editingIndex.value = index
    const question = questions.value[index]
    Object.assign(questionForm, {
        type: question.type,
        score: question.score,
        content: question.content,
        options: question.options ? [...question.options] : ['', ''],
        answer: question.answer,
        explanation: question.explanation || ''
    })
    showQuestionDialog.value = true
}

const deleteQuestion = async (index) => {
    try {
        await ElMessageBox.confirm(
            '确定要删除这道题目吗？',
            '确认删除',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )

        questions.value.splice(index, 1)

        // 调整当前题目索引
        if (currentQuestionIndex.value >= questions.value.length) {
            currentQuestionIndex.value = Math.max(0, questions.value.length - 1)
        }

        // 重新计算总分
        paperForm.totalScore = totalQuestionScore.value

        ElMessage.success('删除成功')
    } catch {
        ElMessage.info('已取消删除')
    }
}

const onQuestionTypeChange = (type) => {
    if (type === '选择题') {
        questionForm.options = ['', '']
        questionForm.answer = ''
    } else if (type === '判断题') {
        questionForm.options = []
        questionForm.answer = ''
    } else {
        questionForm.options = []
        questionForm.answer = ''
    }
}

const addOption = () => {
    if (questionForm.options.length < 6) {
        questionForm.options.push('')
    }
}

const removeOption = (index) => {
    if (questionForm.options.length > 2) {
        questionForm.options.splice(index, 1)
        // 如果删除的选项是正确答案，清空答案
        const answerIndex = questionForm.answer.charCodeAt(0) - 65
        if (answerIndex === index) {
            questionForm.answer = ''
        } else if (answerIndex > index) {
            // 如果正确答案在删除选项之后，需要调整
            questionForm.answer = String.fromCharCode(answerIndex + 64)
        }
    }
}

const resetQuestionForm = () => {
    Object.assign(questionForm, {
        type: '',
        score: 5,
        content: '',
        options: ['', ''],
        answer: '',
        explanation: ''
    })
}

const saveQuestion = async () => {
    if (!questionFormRef.value) return

    await questionFormRef.value.validate((valid) => {
        if (valid) {
            const questionData = {
                id: editingIndex.value >= 0 ? questions.value[editingIndex.value].id : Date.now(),
                type: questionForm.type,
                score: questionForm.score,
                content: questionForm.content,
                options: questionForm.type === '选择题' ? [...questionForm.options] : null,
                answer: questionForm.answer,
                explanation: questionForm.explanation
            }

            if (editingIndex.value >= 0) {
                questions.value[editingIndex.value] = questionData
                ElMessage.success('题目修改成功')
            } else {
                questions.value.push(questionData)
                ElMessage.success('题目添加成功')
            }

            // 重新计算总分
            paperForm.totalScore = totalQuestionScore.value

            showQuestionDialog.value = false
            resetQuestionForm()
        }
    })
}

const saveDraft = async () => {
    if (!paperFormRef.value) return

    await paperFormRef.value.validate((valid) => {
        if (valid) {
            if (questions.value.length === 0) {
                ElMessage.warning('请至少有一道题目')
                return
            }

            ElMessage.success('草稿保存成功')
        }
    })
}

const submitPaper = async () => {
    if (!paperFormRef.value) return

    await paperFormRef.value.validate((valid) => {
        if (valid) {
            if (questions.value.length === 0) {
                ElMessage.warning('请至少有一道题目')
                return
            }

            submitting.value = true

            // 模拟提交
            setTimeout(() => {
                submitting.value = false
                ElMessage.success('试卷发布成功')
                // 这里可以跳转回试卷列表
            }, 2000)
        }
    })
}
</script>

<style scoped>
.paper-upload {
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header h2 {
    margin: 0;
    color: #303133;
}

.upload-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 文件上传样式 */
.upload-section {
    text-align: center;
}

.upload-dragger {
    width: 100%;
}

.file-info {
    margin-top: 20px;
    text-align: left;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 6px;
    margin-top: 10px;
}

.file-size {
    color: #909399;
    font-size: 12px;
}

.upload-actions {
    margin-top: 30px;
}

/* 解析进度样式 */
.parsing-section {
    text-align: center;
    padding: 40px 20px;
}

.parsing-status {
    margin: 20px 0;
}

.parsing-status p {
    font-size: 16px;
    color: #606266;
}

.parse-result {
    margin-top: 30px;
}

.result-actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 15px;
}

/* 查看模式切换 */
.view-mode-switch {
    display: flex;
    align-items: center;
}

/* 完整试卷查看模式 */
.complete-view {
    max-height: 600px;
    overflow-y: auto;
}

.paper-header {
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #dcdfe6;
}

.paper-header h2 {
    margin: 0 0 10px 0;
    color: #303133;
}

.paper-info {
    display: flex;
    justify-content: center;
    gap: 30px;
    color: #606266;
    font-size: 14px;
}

.questions-list {
    padding: 0 20px;
}

.question-item {
    margin-bottom: 25px;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-item .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    background: none;
    border: none;
    padding: 0;
}

.question-number {
    font-weight: bold;
    color: #409eff;
    font-size: 16px;
    margin-right: 10px;
}

.question-type {
    background-color: #e1f3d8;
    color: #67c23a;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    margin-right: 10px;
}

.question-score {
    color: #f56c6c;
    font-size: 14px;
    margin-right: auto;
}

.question-actions {
    display: flex;
    gap: 5px;
}

.question-content {
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 15px;
    color: #303133;
}

.question-options {
    margin: 15px 0;
}

.option-item {
    padding: 5px 0;
    color: #606266;
    font-size: 14px;
}

.question-answer {
    margin-top: 15px;
    padding: 12px;
    background-color: #f0f9ff;
    border-left: 4px solid #409eff;
    border-radius: 4px;
    font-size: 14px;
    color: #303133;
}

/* 逐题查看模式 */
.single-view {
    padding: 20px;
}

.question-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 8px;
}

.question-counter {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
}

.current-question {
    margin-bottom: 30px;
}

.question-card-single {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.question-header-single {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #dcdfe6;
}

.question-info {
    display: flex;
    gap: 10px;
}

.question-content-single {
    padding: 30px;
}

.question-content-single h3 {
    margin: 0 0 15px 0;
    color: #303133;
    font-size: 18px;
}

.question-content-single h4 {
    margin: 20px 0 10px 0;
    color: #409eff;
    font-size: 16px;
}

.question-content-single p {
    font-size: 16px;
    line-height: 1.8;
    color: #303133;
    margin-bottom: 20px;
}

.options-list {
    margin-left: 20px;
}

.option-item-single {
    padding: 8px 0;
    font-size: 15px;
    color: #606266;
    line-height: 1.6;
}

.answer-content {
    padding: 15px;
    background-color: #f0f9ff;
    border-left: 4px solid #409eff;
    border-radius: 6px;
    font-size: 15px;
    line-height: 1.6;
    color: #303133;
}

.explanation-content {
    padding: 15px;
    background-color: #f9f9f9;
    border-left: 4px solid #67c23a;
    border-radius: 6px;
    font-size: 15px;
    line-height: 1.6;
    color: #606266;
}

/* 题目缩略图导航 */
.question-thumbnails {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 8px;
}

.thumbnail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    background-color: #fff;
    border: 2px solid #dcdfe6;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    min-width: 60px;
}

.thumbnail-item:hover {
    border-color: #409eff;
    transform: translateY(-2px);
}

.thumbnail-item.active {
    border-color: #409eff;
    background-color: #ecf5ff;
}

.thumbnail-number {
    font-weight: bold;
    color: #409eff;
    font-size: 14px;
}

.thumbnail-type {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
}

/* 表单相关样式 */
.form-actions {
    text-align: center;
    padding: 30px 0;
    border-top: 1px solid #dcdfe6;
    margin-top: 20px;
}

.form-actions .el-button {
    margin: 0 10px;
}

.option-input {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.option-label {
    width: 30px;
    font-weight: bold;
    color: #409eff;
}

.option-input .el-input {
    flex: 1;
    margin: 0 10px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .paper-info {
        flex-direction: column;
        gap: 10px;
    }

    .question-navigation {
        flex-direction: column;
        gap: 15px;
    }

    .question-thumbnails {
        justify-content: center;
    }

    .question-header-single {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
    }
}
</style>