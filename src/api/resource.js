import request from '@/utils/request'
import { addLog } from '@/api/log'
import { useUserStore } from '@/stores/user'

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

  // 上传资源文件到OSS
  uploadResourceFile(file, teacherId, resourceType, resourceName, resourceSubscribe) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('teacherId', teacherId)
    formData.append('resourceType', resourceType)
    formData.append('resourceName', resourceName)
    formData.append('resourceSubscribe', resourceSubscribe)
    
    const promise = request({
      url: '/resource/upload/file',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    promise.then(() => {
      const userStore = useUserStore()
      addLog({
        staffId: teacherId || userStore.userInfo.id,
        operationContent: `上传资源：${resourceName}`
      })
    })
    return promise
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
    const promise = request({
      url: `/resource/delete/${resourceId}`,
      method: 'delete'
    })
    promise.then(() => {
      const userStore = useUserStore()
      addLog({
        staffId: userStore.userInfo.id,
        operationContent: `删除资源：${resourceId}`
      })
    })
    return promise
  },

  // 分享资源给其他教师
  shareResource(resourceId, targetTeacherId) {
    const promise = request({
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
    promise.then(() => {
      const userStore = useUserStore()
      addLog({
        staffId: userStore.userInfo.id,
        operationContent: `分享资源：${resourceId} 给 ${targetTeacherId}`
      })
    })
    return promise
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
      size: typeof backendData.size === 'string' ? parseInt(backendData.size, 10) || 0 : (backendData.size || 0),
      url: backendData.resourceUrl,
      courseName: backendData.courseName || '',
      courseId: backendData.courseId || '',
      downloads: backendData.downloads || 0,
      uploader: backendData.uploader || '未知',
      uploadTime: backendData.uploadTime,
      description: backendData.resourceSubscribe || '',
      teacherId: backendData.teacherId,
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
      resourceSubscribe: frontendData.description,
      courseId: frontendData.courseId,
      permission: frontendData.permission
    }
  },

  // 获取资源类型
  getResourceType(backendType) {
    const typeMap = {
      'document': 'document',
      'video': 'video',
      'ppt': 'ppt',
      'other': 'other'
    }
    return typeMap[backendType] || 'other'
  },

  // 获取后端资源类型
  getBackendResourceType(frontendType) {
    const typeMap = {
      'document': 'document',
      'video': 'video',
      'ppt': 'ppt',
      'other': 'other'
    }
    return typeMap[frontendType] || 'other'
  }
} 