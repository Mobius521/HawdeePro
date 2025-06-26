<template>
    <el-dialog :model-value="visible" title="上传试卷" width="500px" @update:modelValue="emit('update:visible', $event)">
        <el-form :model="form">
            <el-form-item label="试卷名称">
                <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="上传文件">
                <el-upload action="/api/exams/upload" :on-success="handleUploadSuccess" :auto-upload="true">
                    <el-button>选择文件</el-button>
                </el-upload>
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="emit('update:visible', false)">取消</el-button>
            <el-button type="primary" @click="submit">完成</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps(['visible'])
const emit = defineEmits(['update:visible', 'refresh'])

const form = ref({ name: '', fileUrl: '' })

const handleUploadSuccess = (res) => {
    form.value.fileUrl = res.url
    ElMessage.success('文件上传成功')
}

const submit = async () => {
    await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value),
    })
    emit('update:visible', false)
    emit('refresh')
    ElMessage.success('试卷添加成功')
}
</script>
  
