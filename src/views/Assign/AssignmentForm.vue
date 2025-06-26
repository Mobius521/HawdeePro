<template>
    <el-dialog :model-value="visible"  @update:modelValue="emit('update:visible',$event)" :title="isEdit ? '修改作业' : '发布作业'" width="600px">
        <el-form :model="form" label-width="100px">
            <el-form-item label="作业标题">
                <el-input v-model="form.title" />
            </el-form-item>
            <el-form-item label="作业说明">
                <el-input type="textarea" rows="5" v-model="form.description" />
            </el-form-item>
            <el-form-item label="截止时间">
                <el-date-picker v-model="form.deadline" type="datetime" />
            </el-form-item>
            <el-form-item label="选择试卷">
                <el-select v-model="form.examId" placeholder="请选择试卷">
                    <el-option v-for="exam in exams" :key="exam.id" :label="exam.name" :value="exam.id" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="$emit('update:visible', false)">取消</el-button>
            <el-button type="primary" @click="submit">保存</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const props = defineProps({
    visible: Boolean,
    editData: Object
})
const emit = defineEmits(['update:visible', 'refresh'])

const form = ref({ title: '', description: '', deadline: '', examId: '' })
const exams = ref([])
const isEdit = ref(false)

watch(() => props.editData, (val) => {
    isEdit.value = !!val
    form.value = val ? { ...val } : { title: '', description: '', deadline: '', examId: '' }
})

const loadExams = async () => {
    const res = await axios.get('/api/exams')
    exams.value = res.data.data
}

const submit = async () => {
    if (isEdit.value) {
        await axios.put(`/api/assignments/${form.value.id}`, form.value)
        ElMessage.success('修改成功')
    } else {
        await axios.post('/api/assignments', form.value)
        ElMessage.success('发布成功')
    }
    emit('update:visible', false)
    emit('refresh')
}

onMounted(loadExams)
</script>
  
