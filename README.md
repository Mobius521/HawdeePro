# API 使用说明

本文档介绍了智能化在线教学平台的前端API使用方法。

## 目录结构

```
src/api/
├── index.js          # 统一导出文件
├── course.js         # 课程管理API
├── resource.js       # 课程资源管理API
├── log.js           # 操作日志管理API
├── assignment.js    # 作业管理API
├── student.js       # 学生学情分析API
├── auth.js          # 认证API
└── README.md        # 本文档
```

## 快速开始

### 1. 导入API

```javascript
// 方式1：导入特定模块
import { courseApi, courseUtils } from '@/api/course'
import { resourceApi, resourceUtils } from '@/api/resource'

// 方式2：统一导入
import { courseApi, resourceApi, logApi, assignmentApi, studentApi } from '@/api'
```

### 2. 基本使用

```javascript
// 获取课程列表
const loadCourses = async () => {
  try {
    const response = await courseApi.getAllCourses()
    if (response.code === 0) {
      const courses = response.data.map(courseUtils.transformCourseData)
      return courses
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('加载课程失败:', error)
    throw error
  }
}
```

## API 模块详解

### 课程管理 (course.js)

#### API 方法
- `addCourse(courseData)` - 添加课程
- `updateCourse(courseData)` - 修改课程
- `deleteCourse(courseId)` - 删除课程
- `getCourseById(courseId)` - 根据ID获取课程
- `getAllCourses()` - 获取所有课程
- `getCoursesByTeacher(teacherId)` - 根据教师获取课程

#### 工具方法
- `transformCourseData(backendData)` - 后端数据转前端格式
- `transformToBackendData(frontendData)` - 前端数据转后端格式
- `validateCourseData(data)` - 验证课程数据
- `generateCourseId()` - 生成课程ID

#### 使用示例

```javascript
// 创建课程
const createCourse = async (courseForm) => {
  const backendData = courseUtils.transformToBackendData(courseForm)
  const validation = courseUtils.validateCourseData(backendData)
  
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }
  
  const response = await courseApi.addCourse(backendData)
  return response
}

// 获取教师课程
const loadTeacherCourses = async (teacherId) => {
  const response = await courseApi.getCoursesByTeacher(teacherId)
  if (response.code === 0) {
    return response.data.map(courseUtils.transformCourseData)
  }
  throw new Error(response.message)
}
```

### 课程资源管理 (resource.js)

#### API 方法
- `getResourcesByTeacher(teacherId)` - 获取教师资源
- `searchResources(keyword, teacherId)` - 搜索资源
- `uploadResource(resourceData)` - 上传资源
- `downloadResource(resourceId)` - 下载资源
- `deleteResource(resourceId)` - 删除资源
- `shareResource(resourceId, targetTeacherId)` - 分享资源

#### 工具方法
- `transformResourceData(backendData)` - 数据转换
- `extractFileName(url)` - 提取文件名
- `getFileExtension(url)` - 获取文件扩展名
- `getFileTypeIcon(extension)` - 获取文件类型图标
- `isSupportedFileType(fileName)` - 检查文件类型支持

#### 使用示例

```javascript
// 上传资源
const uploadResource = async (file, teacherId) => {
  // 先上传文件到OSS（这里需要实现文件上传逻辑）
  const fileUrl = await uploadToOSS(file)
  
  const resourceData = {
    teacherId,
    resourceType: resourceUtils.getFileExtension(file.name),
    resourceUrl: fileUrl,
    uploadTime: new Date().toISOString()
  }
  
  const response = await resourceApi.uploadResource(resourceData)
  return response
}

// 搜索资源
const searchResources = async (keyword, teacherId) => {
  const response = await resourceApi.searchResources(keyword, teacherId)
  if (response.code === 0) {
    return response.data.map(resourceUtils.transformResourceData)
  }
  throw new Error(response.message)
}
```

### 操作日志管理 (log.js)

#### API 方法
- `getAllLogs()` - 获取所有日志
- `getLogCount()` - 获取日志总数
- `addLog(logData)` - 添加日志

#### 工具方法
- `transformLogData(backendData)` - 数据转换
- `formatDateTime(dateTimeString)` - 格式化日期时间
- `getOperationType(content)` - 获取操作类型
- `analyzeLogs(logs)` - 分析日志数据
- `filterLogs(logs, filters)` - 过滤日志

#### 使用示例

```javascript
// 添加操作日志
const addOperationLog = async (staffId, content) => {
  const logData = {
    staffId,
    operationContent: content
  }
  
  const response = await logApi.addLog(logData)
  return response
}

// 获取日志统计
const getLogStatistics = async () => {
  const [logsResponse, countResponse] = await Promise.all([
    logApi.getAllLogs(),
    logApi.getLogCount()
  ])
  
  if (logsResponse.code === 0 && countResponse.code === 0) {
    const logs = logsResponse.data.map(logUtils.transformLogData)
    const analysis = logUtils.analyzeLogs(logs)
    return {
      logs,
      total: countResponse.data,
      analysis
    }
  }
  throw new Error('获取日志统计失败')
}
```

### 作业管理 (assignment.js)

#### API 方法
- `getAssignments(params)` - 获取作业列表
- `getAssignmentById(assignmentId)` - 获取作业详情
- `createAssignment(assignmentData)` - 创建作业
- `updateAssignment(assignmentData)` - 更新作业
- `deleteAssignment(assignmentId)` - 删除作业
- `publishAssignment(assignmentId)` - 发布作业
- `getAssignmentStatistics(assignmentId)` - 获取作业统计
- `gradeAssignment(assignmentId, gradeData)` - 批改作业
- `getStudentSubmissions(assignmentId)` - 获取学生提交
- `autoGrade(assignmentId)` - 自动评分

#### 工具方法
- `transformAssignmentData(backendData)` - 数据转换
- `getAssignmentTypeText(type)` - 获取作业类型文本
- `getAssignmentStatusText(status)` - 获取状态文本
- `validateAssignmentData(data)` - 验证数据
- `calculateCompletionRate(submissionCount, totalStudents)` - 计算完成率
- `isAssignmentExpired(dueDate)` - 检查是否过期

#### 使用示例

```javascript
// 创建作业
const createAssignment = async (assignmentForm) => {
  const backendData = assignmentUtils.transformToBackendData(assignmentForm)
  const validation = assignmentUtils.validateAssignmentData(backendData)
  
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }
  
  const response = await assignmentApi.createAssignment(backendData)
  return response
}

// 批改作业
const gradeAssignment = async (assignmentId, studentId, score, feedback) => {
  const gradeData = {
    studentId,
    score,
    feedback,
    gradeTime: new Date().toISOString()
  }
  
  const response = await assignmentApi.gradeAssignment(assignmentId, gradeData)
  return response
}
```

### 学生学情分析 (student.js)

#### API 方法
- `getStudentRecords(studentId, params)` - 获取学习记录
- `getStudentAssignments(studentId, params)` - 获取作业情况
- `getStudentGrades(studentId, params)` - 获取成绩
- `getStudentCourses(studentId)` - 获取课程学习情况
- `getStudentStatistics(studentId)` - 获取学习统计
- `generatePersonalizedSuggestions(studentId)` - 生成个性化建议
- `updateSuggestions(studentId, suggestions)` - 更新建议

#### 工具方法
- `transformStudentData(backendData)` - 学生数据转换
- `transformLearningRecord(backendData)` - 学习记录转换
- `transformAssignmentRecord(backendData)` - 作业记录转换
- `transformGradeRecord(backendData)` - 成绩记录转换
- `calculateGPA(grades)` - 计算GPA
- `analyzeLearningTrend(records)` - 分析学习趋势
- `generateSuggestions(analysis)` - 生成学习建议

#### 使用示例

```javascript
// 获取学生学情分析
const getStudentAnalysis = async (studentId) => {
  const [recordsResponse, assignmentsResponse, gradesResponse] = await Promise.all([
    studentApi.getStudentRecords(studentId),
    studentApi.getStudentAssignments(studentId),
    studentApi.getStudentGrades(studentId)
  ])
  
  if (recordsResponse.code === 0 && assignmentsResponse.code === 0 && gradesResponse.code === 0) {
    const records = recordsResponse.data.map(studentUtils.transformLearningRecord)
    const assignments = assignmentsResponse.data.map(studentUtils.transformAssignmentRecord)
    const grades = gradesResponse.data.map(studentUtils.transformGradeRecord)
    
    const trend = studentUtils.analyzeLearningTrend(records)
    const suggestions = studentUtils.generateSuggestions(trend)
    const gpa = studentUtils.calculateGPA(grades)
    
    return {
      records,
      assignments,
      grades,
      trend,
      suggestions,
      gpa
    }
  }
  throw new Error('获取学生学情分析失败')
}
```

## 错误处理

所有API都遵循统一的错误处理模式：

```javascript
try {
  const response = await someApi.someMethod(params)
  if (response.code === 0) {
    // 成功处理
    return response.data
  } else {
    // 业务错误
    throw new Error(response.message)
  }
} catch (error) {
  // 网络错误或其他错误
  console.error('API调用失败:', error)
  throw error
}
```

## 数据转换

所有API都提供了数据转换工具，用于在前端和后端数据格式之间转换：

```javascript
// 后端数据转前端格式
const frontendData = someUtils.transformData(backendData)

// 前端数据转后端格式
const backendData = someUtils.transformToBackendData(frontendData)
```

## 数据验证

所有API都提供了数据验证工具：

```javascript
const validation = someUtils.validateData(data)
if (!validation.isValid) {
  throw new Error(validation.errors.join(', '))
}
```

## 注意事项

1. 所有API调用都应该包含适当的错误处理
2. 使用数据转换工具确保数据格式的一致性
3. 在提交数据前进行验证
4. 注意API的权限控制，不同角色有不同的访问权限
5. 对于文件上传，需要先上传到OSS，然后记录元数据到后端

## 更新日志

- v1.0.0 - 初始版本，包含课程、资源、日志、作业、学生分析等模块 