import request from '@/utils/request'

// 课程管理API
export const courseApi = {
  // 添加课程
  addCourse(courseData) {
    return request({
      url: '/course/add',
      method: 'post',
      data: courseData
    })
  },

  // 修改课程
  updateCourse(courseData) {
    return request({
      url: '/course/update',
      method: 'put',
      data: courseData
    })
  },

  // 删除课程
  deleteCourse(courseId) {
    return request({
      url: `/course/delete/${courseId}`,
      method: 'delete'
    })
  },

  // 根据课程编号获取课程信息
  getCourseById(courseId) {
    return request({
      url: `/course/get/${courseId}`,
      method: 'get'
    })
  },

  // 查询所有课程
  getAllCourses() {
    return request({
      url: '/course/list',
      method: 'get'
    })
  },

  // 根据教师编号查询课程
  getCoursesByTeacher(teacherId) {
    return request({
      url: `/course/teacher/${teacherId}`,
      method: 'get'
    })
  }
}

// 课程数据转换工具
export const courseUtils = {
  // 将后端数据转换为前端格式
  transformCourseData(backendData) {
    return {
      id: backendData.courseId,
      name: backendData.subjectId, // 假设subjectId对应课程名称
      code: backendData.courseId,
      description: backendData.evaluation || '暂无描述',
      status: this.getStatusFromEvaluation(backendData.evaluation),
      semester: this.getSemesterFromTime(backendData.time),
      credits: 3, // 默认值，后端可能需要添加
      duration: 48, // 默认值，后端可能需要添加
      studentCount: 0, // 默认值，后端可能需要添加
      progress: 0, // 默认值，后端可能需要添加
      createTime: new Date().toISOString().split('T')[0],
      classroom: backendData.classroom,
      time: backendData.time,
      teacherId: backendData.teacherId,
      chapterCount: 0,
      resourceCount: 0,
      homeworkCount: 0
    }
  },

  // 将前端数据转换为后端格式
  transformToBackendData(frontendData) {
    return {
      courseId: frontendData.code || frontendData.id,
      teacherId: frontendData.teacherId || 'T123', // 从用户store获取
      subjectId: frontendData.name,
      time: frontendData.time || '周一第1-2节',
      evaluation: frontendData.description || '良好',
      classroom: frontendData.classroom || '教室A101'
    }
  },

  // 根据评价获取状态
  getStatusFromEvaluation(evaluation) {
    if (!evaluation) return 'pending'
    if (evaluation.includes('优秀')) return 'active'
    if (evaluation.includes('良好')) return 'active'
    if (evaluation.includes('一般')) return 'finished'
    return 'pending'
  },

  // 根据时间获取学期
  getSemesterFromTime(time) {
    if (!time) return '2024春季'
    // 这里可以根据实际的时间格式进行解析
    return '2024春季'
  }
} 