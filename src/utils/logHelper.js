import { addLog } from '@/api/log'
import { useUserStore } from '@/stores/user'

/**
 * 记录操作日志的工具函数
 * @param {string} operationContent - 操作内容描述
 * @param {string} staffId - 操作人员编号（可选，默认从用户store获取）
 */
export const recordOperationLog = async (operationContent, staffId = null) => {
  try {
    const userStore = useUserStore()
    // 优先使用传入的staffId，其次使用用户store中的id或name
    const currentStaffId = staffId || userStore.userInfo?.id || userStore.userInfo?.name || 'unknown'
    
    if (!currentStaffId || currentStaffId === 'unknown') {
      console.warn('无法获取操作人员编号，跳过日志记录')
      return
    }

    const logData = {
      staffId: currentStaffId,
      operationContent: operationContent
    }

    const response = await addLog(logData)
    if (response.code === 0) {
      console.log('操作日志记录成功:', operationContent)
    } else {
      console.error('操作日志记录失败:', response.message)
    }
  } catch (error) {
    console.error('记录操作日志时发生错误:', error)
    // 不抛出错误，避免影响主要业务流程
  }
}

/**
 * 课程相关操作日志记录
 */
export const courseLogHelper = {
  // 创建课程
  createCourse: (courseName) => recordOperationLog(`创建课程：${courseName}`),
  
  // 修改课程
  updateCourse: (courseName) => recordOperationLog(`修改课程：${courseName}`),
  
  // 删除课程
  deleteCourse: (courseName) => recordOperationLog(`删除课程：${courseName}`),
  
  // 审核课程
  auditCourse: (courseName, result) => recordOperationLog(`审核课程：${courseName}，结果：${result}`)
}

/**
 * 资源相关操作日志记录
 */
export const resourceLogHelper = {
  // 上传资源
  uploadResource: (fileName) => recordOperationLog(`上传资源文件：${fileName}`),
  
  // 删除资源
  deleteResource: (fileName) => recordOperationLog(`删除资源文件：${fileName}`),
  
  // 分享资源
  shareResource: (fileName, targetTeacher) => recordOperationLog(`分享资源：${fileName} 给 ${targetTeacher}`)
}

/**
 * 用户相关操作日志记录
 */
export const userLogHelper = {
  // 用户登录
  login: (username) => recordOperationLog(`用户登录：${username}`),
  
  // 用户登出
  logout: (username) => recordOperationLog(`用户登出：${username}`),
  
  // 修改密码
  changePassword: () => recordOperationLog('修改密码'),
  
  // 更新个人信息
  updateProfile: () => recordOperationLog('更新个人信息')
}

/**
 * 系统管理相关操作日志记录
 */
export const systemLogHelper = {
  // 系统设置
  updateSettings: (settingName) => recordOperationLog(`更新系统设置：${settingName}`),
  
  // 用户管理
  manageUser: (action, username) => recordOperationLog(`${action}用户：${username}`),
  
  // 数据备份
  backupData: () => recordOperationLog('执行数据备份'),
  
  // 系统维护
  systemMaintenance: (action) => recordOperationLog(`系统维护：${action}`)
}

/**
 * 作业相关操作日志记录
 */
export const assignmentLogHelper = {
  // 创建作业
  createAssignment: (title) => recordOperationLog(`创建作业：${title}`),
  
  // 修改作业
  updateAssignment: (title) => recordOperationLog(`修改作业：${title}`),
  
  // 删除作业
  deleteAssignment: (title) => recordOperationLog(`删除作业：${title}`),
  
  // 提交作业
  submitAssignment: (title) => recordOperationLog(`提交作业：${title}`),
  
  // 批改作业
  gradeAssignment: (title) => recordOperationLog(`批改作业：${title}`)
}

/**
 * 考试相关操作日志记录
 */
export const examLogHelper = {
  // 创建考试
  createExam: (title) => recordOperationLog(`创建考试：${title}`),
  
  // 修改考试
  updateExam: (title) => recordOperationLog(`修改考试：${title}`),
  
  // 删除考试
  deleteExam: (title) => recordOperationLog(`删除考试：${title}`),
  
  // 参加考试
  takeExam: (title) => recordOperationLog(`参加考试：${title}`),
  
  // 批改考试
  gradeExam: (title) => recordOperationLog(`批改考试：${title}`)
}

export default {
  recordOperationLog,
  courseLogHelper,
  resourceLogHelper,
  userLogHelper,
  systemLogHelper,
  assignmentLogHelper,
  examLogHelper
} 