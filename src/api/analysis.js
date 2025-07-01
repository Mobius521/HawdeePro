import request from '@/utils/request'

// 学情分析API
export const analysisApi = {
  // 获取课程学生列表
  getStudentsByCourse(courseId) {
    return request({
      url: `/student/analysis/students/${courseId}`,
      method: 'get'
    })
  },

  // 获取学生学习记录
  getStudyRecords(studentId) {
    return request({
      url: `/student/analysis/records/${studentId}`,
      method: 'get'
    })
  },

  // 获取学生作业情况
  getHomeworkRecords(studentId) {
    return request({
      url: `/student/analysis/homework/${studentId}`,
      method: 'get'
    })
  },

  // 获取学生个性化建议
  getAdvice(studentId) {
    return request({
      url: `/student/analysis/advice/${studentId}`,
      method: 'get'
    })
  },

  // 添加个性化建议
  addAdvice(adviceData) {
    return request({
      url: '/student/analysis/advice/add',
      method: 'put',
      data: adviceData
    })
  },

  // 删除个性化建议
  deleteAdvice(adviceId) {
    return request({
      url: `/student/analysis/advice/${adviceId}`,
      method: 'delete'
    })
  },

  // 更新个性化建议
  updateAdvice(adviceData) {
    return request({
      url: '/student/analysis',
      method: 'put',
      data: adviceData
    })
  }
}

// 学情分析数据转换工具
export const analysisUtils = {
  // 将后端学生数据转换为前端格式
  transformStudentData(backendData) {
    return {
      id: backendData.studentId || backendData.id,
      name: backendData.studentName || backendData.name,
      avgScore: backendData.avgScore || 0,
      studyTime: backendData.studyTime || 0,
      status: getStudentStatus(backendData.avgScore),
      courseId: backendData.courseId,
      courseName: backendData.courseName
    }
  },

  // 将后端学习记录数据转换为前端格式
  transformStudyRecordData(backendData) {
    return {
      id: backendData.recordId || backendData.id,
      time: backendData.watchTime || backendData.time,
      title: backendData.courseTitle || backendData.title,
      description: backendData.courseDescription || backendData.description,
      duration: backendData.watchDuration || backendData.duration,
      courseId: backendData.courseId,
      studentId: backendData.studentId
    }
  },

  // 将后端作业数据转换为前端格式
  transformHomeworkData(backendData) {
    return {
      id: backendData.progressId || backendData.id,
      courseId: backendData.courseId,
      studentId: backendData.studentId,
      homeworkTitle: backendData.homeworkTitle || backendData.title,
      status: backendData.status || 'pending',
      score: backendData.score || 0,
      submitTime: backendData.submitTime,
      dueTime: backendData.dueTime
    }
  },

  // 将后端建议数据转换为前端格式
  transformAdviceData(backendData) {
    return {
      id: backendData.adviceId || backendData.id,
      title: backendData.title || '学习建议',
      content: backendData.content,
      createTime: backendData.createTime,
      studentId: backendData.studentId,
      recordId: backendData.recordId
    }
  },

  // 将前端建议数据转换为后端格式
  transformToBackendAdviceData(frontendData) {
    return {
      adviceId: frontendData.id,
      content: frontendData.content,
      title: frontendData.title,
      studentId: frontendData.studentId,
      recordId: frontendData.recordId
    }
  },

  // 根据成绩获取学生状态
  getStudentStatus(score) {
    if (score >= 90) return 'excellent'
    if (score >= 80) return 'good'
    if (score >= 60) return 'normal'
    return 'warning'
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      excellent: '优秀',
      good: '良好',
      normal: '一般',
      warning: '需改进'
    }
    return statusMap[status] || '未知'
  },

  // 计算作业统计
  calculateHomeworkStats(homeworkList) {
    const stats = {
      completed: 0,
      pending: 0,
      overdue: 0,
      total: homeworkList.length
    }

    homeworkList.forEach(homework => {
      switch (homework.status) {
        case 'completed':
          stats.completed++
          break
        case 'pending':
          stats.pending++
          break
        case 'overdue':
          stats.overdue++
          break
      }
    })

    return stats
  },

  // 计算学习统计
  calculateStudyStats(students) {
    if (students.length === 0) {
      return {
        totalStudents: 0,
        avgScore: 0,
        avgStudyTime: 0,
        completionRate: 0
      }
    }

    const totalScore = students.reduce((sum, student) => sum + (student.avgScore || 0), 0)
    const totalStudyTime = students.reduce((sum, student) => sum + (student.studyTime || 0), 0)

    return {
      totalStudents: students.length,
      avgScore: Math.round(totalScore / students.length),
      avgStudyTime: Math.round(totalStudyTime / students.length),
      completionRate: Math.round(Math.random() * 20 + 80) // 模拟完成率
    }
  }
}

function getStudentStatus(score) {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 60) return 'normal'
  return 'warning'
} 