<template>
    <el-dialog :model-value="visible" title="编辑试卷" width="500px" @update:modelValue="emit('update:visible', $event)">
        <el-form :model="localExam">
            <el-form-item label="试卷名称">
                <el-input v-model="localExam.name" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="emit('update:visible', false)">取消</el-button>
            <el-button type="primary" @click="save">保存</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 接收 props
const props = defineProps(['visible', 'exam'])
const emit = defineEmits(['update:visible', 'refresh'])

// 本地副本防止直接改 props.exam
const localExam = ref({})

// 监听 exam 变化，初始化本地副本
watch(
    () => props.exam,
    (val) => {
        localExam.value = { ...val }
    },
    { immediate: true }
)

// 保存请求
const save = async () => {
    await fetch(`/api/exams/${localExam.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localExam.value),
    })
    emit('update:visible', false)
    emit('refresh')
    ElMessage.success('修改成功')
}
</script>
  
