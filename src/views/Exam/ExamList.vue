<template>
  <el-card class="container-card">

    <!-- 上传模块 -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">📤 上传试卷</span>
      </div>
      <div class="el-upload-dragger" @click="uploadVisible = true">
        <div class="custom-upload-box">
          <div class="support-type-list">
            <span class="list-item word" />
            <span class="list-item pdf" />
            <span class="list-item excel" />
            <span class="list-item txt" />
          </div>
          <div class="upload-btn">
            <img class="upload-icon" src="https://cdn-img.daxuesoutijiang.com/dx-college/_nuxt/upload.BbYsCce3.svg" />
            <span>上传试卷</span>
          </div>
          <div class="support-type-tips">格式支持 doc、docx、pdf、xls、xlsx、txt，文件小于10MB</div>
        </div>
      </div>
    </div>

    <!-- 分割线 -->
    <el-divider border-style="dashed" />

    <!-- 试卷列表模块 -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">📚 试卷列表</span>
      </div>

      <el-table :data="exams" stripe border style="margin-top: 16px">
        <el-table-column prop="name" label="试卷名称" min-width="200" />
        <el-table-column prop="createdTime" label="上传时间" min-width="160" />
        <el-table-column label="操作" width="300">
          <template #default="scope">
            <el-button @click="download(scope.row)">下载</el-button>
            <el-button type="warning" @click="edit(scope.row)">编辑</el-button>
            <el-button type="danger" @click="remove(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 弹窗 -->
    <ExamUpload v-model:visible="uploadVisible" @refresh="loadData" />
    <ExamEditDialog v-model:visible="editVisible" :exam="currentExam" @refresh="loadData" />
  </el-card>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import ExamUpload from './ExamUpload.vue'
import ExamEditDialog from './ExamEditDialog.vue'
import request from '@/util/request.js'

const exams = ref([])
const uploadVisible = ref(false)
const editVisible = ref(false)
const currentExam = ref({})

const loadData = async () => {
  const res = await axios.get('/api/exams')
  exams.value = res.data.data
}

const download = (row) => {
  window.open(`/api/exams/${row.id}/download`)
}

const edit = (row) => {
  currentExam.value = { ...row }
  editVisible.value = true
}

const remove = (row) => {
  ElMessageBox.confirm('确认删除该试卷吗？', '提示').then(async () => {
    await axios.delete(`/api/exams/${row.id}`)
    ElMessage.success('删除成功')
    loadData()
  })
}

onMounted(() => loadData())
</script>
<style scoped>
.container-card {
  padding: 20px;
  background: #f9fbfc;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 模块整体结构 */
.section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}
.el-upload-dragger{
  background: #f5f7f9;
    border: 1px dashed #e5e5e5;
    border-radius: 16px;
    height: 225px;
}
.custom-upload-box{
  align-items: center;
    display: flex;
    flex-direction: column;
    margin-top:30px;
}
.support-type-list {
  display: flex;
  justify-content: center;
}
.support-type-list .list-item{
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAOCSURBVHic7Zw9TFNRFMf/tz6JBinGSJcOVhMQwsICiZsJIcFOGClxQXaFKJtuuBgTExkwrKZxAwws6CAmdXEog6hBCRKtiV1oYrB8mOBrr8NLo/TjUTn33Xep5zfed3Pe4Zdzbs9raQGGYRiGYRiGYRiG+b8QXgVu7ZMR27IjXsUvpjGIunO91svpAZHTdU9AscDm2G4HYI0L4KLKuNVwrA7ovSBefAnhkk6JAVWBzvfnbglYb/yQV+DEcfScXcfz2JQ8ouueSgS2XLH7pBDjKmJR0S1RTQUGAkbIK6BTIllgy4DdByBCT0UtuiTSKzAvOhTk4Qk6JJIFykCgUUUiXuG1RLJAIXFSRSJUcvnK17yUqGyM8ZtfNrC1U/m6VxJrRiAArH2Trte9kFhTAj+mgO9Z9z2qJdaUwFweWEhKfE6771Mp0aIGMI1dG3j9XuLdGhA65TwjV6AnlxIPAdyk3K/mBBbY+gls7VOJAILU+9RUC/sBCySitYXbIkDrmdL1zR1gYfHfYnW1A+HTpesrX51XY11oFdjdCYzESt/DTS4DC4vuM1wxI/0CXe2l6xPTUqtAbmEiLJAICyRi7Bw4FAWGos55OfvKOdtMxMgKDDcBwzGBcAgIh4DhmLNmIkYKvH9dIFi/d+3JmGcfYZMwTuBQFGXHk3BT+RHIb4wSWGjdSpjYykYJLNe6xZjWysYIrNS6xZjWykaMMQ317q1bzLWo8/xsAkYIbIuUX4/PO6KGY3vXg/XYt9V1YYTAciSXgXtxZ3ju7hQVJfuNMWfg32S3gduTf548bjyQSGd8TMgFIwXemdwrLJ3hR7mqic+Xf3N1NuFcMw2jBKYzwMRM5Uq7FzevlY0RmN0GBsckNrfd9w2OSWT32aMTYwQ+mq6uutIZZ68paB1jZhNA8kP5Pz65XH2c+DMnTkOZWTC9frDcDopWgekMlJ1hOj84csOYFj6ssEAiLJAICyTCAomwQCIskAgLJEL/oo3AhopE/EBF7vQKlEiRY/iEyOd/UGPQK1Dab6kxfCMgl8ghqAFs21qSOJRtnFqdsuaoQcgCU3NiQ8rcZWoc7eTzoyrCKHkVXps5moCQd1XE0oGQcnT1Kb36AMU/OtF6VUZyOfnYz99NcEMCCcAe/TRdRz77Cnj2PxLNMdkhpW3EV2Et20qtzImU33kwDMMwDMMwDMMwTC3wG2D7ErAxV5dPAAAAAElFTkSuQmCC) no-repeat 50% / 100% 100%;
  height: 40px;
  margin-right: 20px;
  width: 40px;
}
.support-type-list .list-item.pdf {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAASmSURBVHic7ZxfaFtVHMe/tx0dDYsOspdAC32w8XGxMG0U6mbpg4sFRWx9GoLdGCpswdf6IO51Zk9jaIbDp7a+CGv0QSJTcKkKWfsmt0OqKdyXBSrpUmFNrw+/hjW5f/Ln/G09H8hD7z393ZMP55zf75y0AQwGg8FgMBgMBoPBYPh/YYkK7F4eH8EuRkTF9xCNDiB1smDNfFOX9kxwFuhePJME+rKwcJZn3I44fhw4+8oPqD98XabEPl6B3EsvXYXV90CJvAaDg1Pof+57d+mdflmP5CLQvfTimwCyPGIxI1kipxFo6SGvgUSJzAL3R98Ie1c4I0kijxGY5BBDDBIkchBoPcseQyCCJbILtHCSQz/YqYdULgIlcitjlLO7CzyuBd8XJPHoCASAv8rh9wVIPFoCH/4JbP0T3oazxKMlcG8P+OVX4O/N8HYcJR5jDaAdT54ApTXgDxs4FQMGBoJaTqFufQ7gCsvj9BEYiwOTs0AqDUSidM0uAXc+AypO9/FqO+1HooVnug/cjB5TOBYHPr4JTL77VB4AJMaA+a/pvqboIXB6LlhSJAq894nc/nSBHgJPT4TfT4xpOwrVC4zFm6ctAGQ/BGrV5mvJNpIVoV5g5IT3mv0AWPmu+dpQQk5/ukS9wNq299rgCW/m9ROtAeoFVhzvdB0e9bZrneaaoF4gAGyuN/88nvYmjUc91IIS0EPg6k/NP6fOU+Y9SC/FtAT0EHg/753GQy3T2C7J608X6CFwZxsoLIa3Kdty+tIleggEgMKCdxQ2sEskWUP0EbizDSzd8L93Py+3L12gz2kMABTzdCIz3FI0JycoqZzy2c49cijB2CUl66Q+AodHSZJfvZd8Nfj3DrquVYG1n4G7OWlZW63AxBi9Xvap+3ohEqXzxNMTwHKufWLigBqBiTE6wmqt9XgRiQIzGdomFsWun3IFxuJ0ttepuFo1eAtXzNMOZjAKJF7wjzlzlYp0gRlcXhaenKXT5U7lFfNAZoqO9P1IpemEZr0EZD8C5t8G8reb20SiwPOCRvk+ckbg9Bzwxlzn7SsOJQKARNolOvJvXSdT5+lVcWg0KtjuiR+BqbS/vIpDI8bvTbd+kFRxgOsfBO9GYnFKHK/Neu+V173XOCJe4LSPvB8XSd65Ge+oWs7513MVB7h2obtP6ZbFlzNip7DfZxn523RgemHe276Yfzp1g2hM6eQEfYoXVP50EosDYgX6vbn0+/5ty3Zwwmil4lCNV1ikAnwoQc+KxYFNm6atpF2JWIGdTp/CQu+jpbwufJ0LQ+waaJfCC9laFVjK0iGCpqct7RBfxjQW/YOZuFbdn4ILh1ZcAzl14N0cvYZHaXul6fF8L8jdyilcq0Shz4HqIcUIZMQIZMQIZIRdoIstDv1QA4e+8xC4wRxDGW6bP+lvDweB1hpzDHWssgZgF7j77ypc9zBO4w3ri9++ZQ3CLNC6s7oFt+8t1jjycTM8onDJwlZu5R5gfcojliQyPEYfwPtLJy6Pj6DufqX0exPCcHEP2MtYX/7OvPY1EPe1JxfPJOH26/GvsMewYd1a2VDdDYPBYDAYDAaDwWAwGI4C/wFoiWBh82HpDQAAAABJRU5ErkJggg==);
}
.support-type-list .list-item.excel {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAARLSURBVHic7ZxPaxtHGId/a7v+B3Jlg3qxgwVxoJgUy4egnOy04IPbHpKW9GrcL6CqX0DoC3TRJxC+prSJobEPpq3SQ2kwVGsQaQ8RXYMdSBxcVYKshWVND0ZOcXZmV8zsjKK+z8nSzL47fjy/ndkVFkAQBEEQBEEQBEEQ/y+syCpv20kAycjqX+K98fHh5aXJH7+1vjjTdU4AGFJa7aGdsgYtG8AtpXVD4J2d4crJtZ277N6qTokDyipt2V9Zg1YZBuR1iI+Orlw5ubZ9l90b1HVONQK37NvWgGUrqSWJbolKBPaKvA46JcoL3LJvQ+NiERZdEuUFWkgpGEck6JCoQKD1roJxREbUElVcA+MKakhz2m5z26KUqG4bY5hmq4W/X73itr+WyJRK7BuBAPD74aGw/Vyio1RiXwn81XXxrF4X9lEtsa8EttptbOzuwtE4E9XeC/cAJ60W7lcq+LlaRXJyEuPDw7yuKy321zcAMjLn6zuBHWqeB8fzhH0YMCF7Hu0C16bnkRyNcds3nv0B1/O/jsWHRpCZ5e/bncZLbL6oSo+xG7QLfHR8gOLSOrc9OTaB9cqOb1tmNoXc3E3usR/ufic9vm7Rvoi4Xh356mNu+9r0PJJjbybrfPYtco8r7Jfx6PhAyRi7wcgqnH/6GzemAPD94qdvvJebSyP+zohvf9erI/+U/0eJEmPbmI8EcUvFElibnr94vRBLCGffemUHtVZT6fjCYkxgUJRzV9MXP9vvL3H7mYpuB6MbaVGUk2MTyM3dxPLUDG5Nzfj2qZ02jUW3g/E7EVGUc1fTwtlnMrodjAsMinIqlvB9v3R8oH3P54dxgUDwqnyZ2mkTX3L2irrpCYGAOMqXyVcfdyU8SnpGoOvVUQqxmjqNIxT2yxpGFI6eEShabf9LKpbAcoh+uugJgfGhERSvr4TuX7y+gviQ/12JbnpCYG4u7Xv/y+N8j5gO7qgB4wKXp2aEt2k8MrOLXUmPCqMCg6JbOj6A0zjitv904/MohtUVRgWKotvZ631W/oF7fOd2zyTGBAZFt7BfhuvVQz10MBllIwKDout6dRT2nYvXBbcs3DibjLIRgZnZlHDWXH5IUGs1hbPQZJS1C1yIJYS/7IMXVd/nexuHT7Bx+IR7nKkoaxdY/IAf3dppE1//+Qu3XTQLATNR1vqp3EIsgc3nVWw+938M5TReCq91rlfHemVH+LFocmxC64MGrQL3GkfYE+zrwiCKsQmM34m87ZBASUigJCRQEhIoCQmUhARKQgIlUSGwpqCGKaTHrkCg5crXMARj/8iWkBfI2nvSNUzB4AR3EiMv8AQO3s4Yu/g4+0C2iLzAO9kaY+yOdB3NsDbLqqijZhVezZYsxvJKammAtVlWxewDVH9rx7adtCyrCIPfmxBAiZ2xLD7JSl/7OkT3tScP7RQGeuNfYQG4WM26pgdBEARBEARBEARBEP3Av7zriski4HSGAAAAAElFTkSuQmCC);
}
.support-type-list .list-item.txt {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAKxSURBVHic7dy/axNhHMfxz3PX9lSwClIhTgk4tE75E3To4CDUodB0cbU6aHYX/wE7Ne3mpkURujmIGLJLKg6hWS6K1h8l0NBELvXueZxSxJI08n3uLsbPa732ew9vnsslTRqAiIiIiIiI6P+i4hrsry9lAWTjmv8n77Q3lbn147VSz6OkzgkAEzaH+WvLedc1qwa4anPuMKIoQlSdfWXM4vUkIzq2Bvmlwn3HNdU04vW43uR8VJ19aZ4tukmd00pAv1RYcBys2pgl5XqT89Hl5CJaCTgq8XqSjCgO6JcKC0jwZjGspCLKd6AyeQvriMVRRBNfRHFAR6lzNhYSl6MbS0wRLTwGmvPyGRZo0/dQnBGtPY1Jm440wuCw7/G4Io5NQABof20NPB5HxLEKePC5icN2MPBnbEccq4BGG3x//wGdb8ntRKuvhUeBDjWa9V20Pu7Bmz4DZ6pvo3nzaeYRgHuS841dwJ4w+IkwGLwTATMtPc9YXcJpYEChVC7hibMz8DJz1ud2v9QQHuxZnztIKgG9zBwuXLttfW7zzUbiAXkJCzGgEAMKMaAQAwqlchfu1Cvo1Ct9j1+88QCnLl05/ns7FTTLG3Eu7a9xBwoxoBADCjGgEAMKMaAQAwoxoBADCjGgEAMKMaAQAwoxoBADCjGg0Eh+tKP19gU6O8f/4Bq2k33LchgjGbC7W0MXtbSXMRRewkIMKMSAQgwoxIBCFgKqffmMtMjXbiNgQz4jHdqYkz4DfCJxQG30O+mM1Bi1LR0h34FBsA3gX7yMG7k7T7ekQ8QBc8WtfW3MTemcpGmNoo05Vu7CuZXNMox6aGNWErRG0cbuAyx/a4e/vpR1lXqc5vcmDKKAchSpYu7uE/Fj328z4+GvLefh6NH4V1igkVvZbKS9CCIiIiIiIqJx8AtMYNmAZycEyQAAAABJRU5ErkJggg==);
}
.upload-btn {
  background: #2e5fff;
  border-radius: 21px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  height: 40px;
  line-height: 40px;
  margin-bottom: 16px;
  margin-top: 24px;
  opacity: 1;
  width: 168px;
}
.support-type-tips{
  color: #626466;
  font-size: 12px;
}
.upload-btn .upload-icon {
  height: 24px;
  margin-right: 8px;
  width: 24px;
  outline: none;
 vertical-align: middle;
}
.el-table th {
  background-color: #f2f6fc;
  color: #606266;
  font-weight: 600;
}

.el-table td {
  color: #606266;
}
</style>
