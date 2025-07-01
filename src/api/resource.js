import request from '@/utils/request'

// 资源管理API
export const resourceApi = {
  // 获取教师上传的所有资源
  getResourcesByTeacher(teacherId) {
    return request({
      url: `/resource/list/${teacherId}`,
      method: 'get'
    })
  },

  // 资源检索（模糊搜索）
  searchResources(keyword, teacherId) {
    return request({
      url: '/resource/search',
      method: 'get',
      params: {
        keyword,
        teacherId
      }
    })
  },

  // 上传资源（元信息记录）
  uploadResource(resourceData) {
    return request({
      url: '/resource/upload',
      method: 'post',
      data: resourceData
    })
  },

  // 下载资源（获取URL）
  downloadResource(resourceId) {
    return request({
      url: `/resource/download/${resourceId}`,
      method: 'get'
    })
  },

  // 删除资源
  deleteResource(resourceId) {
    return request({
      url: `/resource/delete/${resourceId}`,
      method: 'delete'
    })
  },

  // 分享资源给其他教师
  shareResource(resourceId, targetTeacherId) {
    return request({
      url: '/resource/share',
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: new URLSearchParams({
        resourceId,
        targetTeacherId
      })
    })
  }
}

// 资源数据转换工具
export const resourceUtils = {
  // 将后端数据转换为前端格式
  transformResourceData(backendData) {
    return {
      id: backendData.resourceId,
      name: backendData.resourceName || '未命名资源',
      type: resourceUtils.getResourceType(backendData.resourceType),
      size: backendData.size || 0,
      url: backendData.resourceUrl,
      courseName: backendData.courseName || '',
      courseId: backendData.courseId || '',
      downloads: backendData.downloads || 0,
      uploader: backendData.uploader || '未知',
      uploadTime: backendData.uploadTime,
      description: backendData.description || '',
      permission: backendData.permission || 'course'
    }
  },

  // 将前端数据转换为后端格式
  transformToBackendData(frontendData) {
    return {
      teacherId: frontendData.teacherId,
      resourceType: frontendData.type,
      resourceUrl: frontendData.url,
      uploadTime: frontendData.uploadTime || new Date().toISOString(),
      resourceName: frontendData.name,
      courseId: frontendData.courseId,
      description: frontendData.description,
      permission: frontendData.permission
    }
  },

  // 获取资源类型
  getResourceType(backendType) {
    const typeMap = {
      '文档': 'document',
      '视频': 'video',
      '音频': 'audio',
      '图片': 'image',
      '其他': 'other'
    }
    return typeMap[backendType] || 'other'
  },

  // 获取后端资源类型
  getBackendResourceType(frontendType) {
    const typeMap = {
      'document': '文档',
      'video': '视频',
      'audio': '音频',
      'image': '图片',
      'other': '其他'
    }
    return typeMap[frontendType] || '其他'
  }
} 