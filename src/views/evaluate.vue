<template>
    <div class="p-4 space-y-6">

        <!-- 发布测评 -->
        <el-card>
            <h2 class="text-lg font-bold mb-2">发布测评</h2>
            <el-form :model="newSurvey" label-width="100px">
                <el-form-item label="标题">
                    <el-input v-model="newSurvey.title" />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input v-model="newSurvey.description" type="textarea" />
                </el-form-item>
                <el-form-item label="截止时间">
                    <el-date-picker v-model="newSurvey.deadline" type="datetime" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="createSurvey">发布</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 测评列表 -->
        <el-card>
            <h2 class="text-lg font-bold mb-2">测评记录</h2>
            <el-table :data="surveyList" style="width: 100%">
                <el-table-column prop="title" label="标题" />
                <el-table-column prop="createdAt" label="发布时间" />
                <el-table-column prop="deadline" label="截止时间" />
                <el-table-column label="操作">
                    <template #default="{ row }">
                        <el-button size="small" @click="viewDetail(row)">详情</el-button>
                        <el-button size="small" @click="viewStats(row)">统计</el-button>
                        <el-button size="small" type="danger" @click="deleteSurvey(row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 测评详情弹窗 -->
        <el-dialog v-model="detailVisible" title="测评详情" width="500px">
            <p><strong>标题：</strong>{{ selectedSurvey.title }}</p>
            <p><strong>描述：</strong>{{ selectedSurvey.description }}</p>
            <p><strong>截止时间：</strong>{{ selectedSurvey.deadline }}</p>
        </el-dialog>

        <!-- 测评统计弹窗 -->
        <el-dialog v-model="statsVisible" title="测评统计结果" width="600px">
            <div ref="chartContainer" style="height: 400px;"></div>
        </el-dialog>

    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'

const newSurvey = ref({
    title: '',
    description: '',
    deadline: ''
})

const surveyList = ref([])
const detailVisible = ref(false)
const statsVisible = ref(false)
const selectedSurvey = ref({})
const chartContainer = ref(null)
let chartInstance = null

const fetchSurveys = async () => {
    const res = await axios.get('/api/surveys')
    surveyList.value = res.data
}

const createSurvey = async () => {
    await axios.post('/api/surveys', newSurvey.value)
    await fetchSurveys()
}

const deleteSurvey = async (id) => {
    await axios.delete(`/api/surveys/${id}`)
    await fetchSurveys()
}

const viewDetail = (survey) => {
    selectedSurvey.value = survey
    detailVisible.value = true
}

const viewStats = async (survey) => {
    selectedSurvey.value = survey
    statsVisible.value = true
    await nextTick()
    if (!chartInstance) {
        chartInstance = echarts.init(chartContainer.value)
    }
    const res = await axios.get(`/api/surveys/${survey.id}/stats`)
    const option = {
        title: { text: '测评统计' },
        tooltip: {},
        xAxis: { type: 'category', data: res.data.labels },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: res.data.values }]
    }
    chartInstance.setOption(option)
}

onMounted(fetchSurveys)
</script>