<template>
    <el-card>
        <div class="toolbar">
            <el-button type="primary" @click="openCreate">发布作业</el-button>
        </div>

        <el-table :data="assignments" style="margin-top: 20px">
            <el-table-column prop="title" label="作业标题" />
            <el-table-column prop="deadline" label="截止时间" />
            <el-table-column prop="publishTime" label="发布时间" />
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button @click="viewDetail(scope.row)">详情</el-button>
                    <el-button @click="viewStats(scope.row)">统计</el-button>
                    <el-button type="warning" @click="edit(scope.row)">编辑</el-button>
                    <el-button type="danger" @click="remove(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <AssignmentForm v-model:visible="formVisible" :editData="currentEdit" @refresh="loadAssignments" />
    </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import AssignmentForm from './AssignmentForm.vue'
import { useRouter } from 'vue-router'

const assignments = ref([])
const formVisible = ref(false)
const currentEdit = ref(null)
const router = useRouter()

const loadAssignments = async () => {
    const res = await axios.get('/api/assignments')
    assignments.value = res.data.data
}

const openCreate = () => {
    currentEdit.value = null
    formVisible.value = true
}

const edit = (row) => {
    currentEdit.value = row
    formVisible.value = true
}

const remove = (row) => {
    ElMessageBox.confirm('确认删除该作业？', '提示').then(async () => {
        await axios.delete(`/api/assignments/${row.id}`)
        ElMessage.success('删除成功')
        loadAssignments()
    })
}

const viewDetail = (row) => router.push(`/assignment/detail/${row.id}`)
const viewStats = (row) => router.push(`/assignment/stats/${row.id}`)

onMounted(loadAssignments)
</script>
  
