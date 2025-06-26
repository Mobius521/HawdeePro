<template>
    <el-card>
        <h2>提交统计</h2>
        <p>提交人数：{{ stats.submittedCount }}</p>
        <p>未提交人数：{{ stats.unsubmittedCount }}</p>
        <p>平均分：{{ stats.averageScore }}</p>
    </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const stats = ref({})
const route = useRoute()

onMounted(async () => {
    const res = await axios.get(`/api/assignments/${route.params.id}/statistics`)
    stats.value = res.data.data
})
</script>
  
