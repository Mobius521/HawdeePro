<template>
    <el-card>
        <h2>{{ assignment.title }}</h2>
        <p><strong>说明：</strong>{{ assignment.description }}</p>
        <p><strong>截止时间：</strong>{{ assignment.deadline }}</p>
        <p><strong>试卷：</strong>{{ assignment.examName }}</p>
    </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const assignment = ref({})

onMounted(async () => {
    const res = await axios.get(`/api/assignments/${route.params.id}`)
    assignment.value = res.data.data
})
</script>
  
