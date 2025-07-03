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

# 在线教学支持服务平台

## 功能特性

### 资源管理模块
- **资源上传**: 支持文档、视频、PPT等多种格式文件上传到阿里云OSS
- **资源列表**: 网格视图和列表视图切换，支持搜索和筛选
- **资源下载**: 一键下载资源文件
- **资源分享**: 支持将资源分享给其他教师
- **批量操作**: 支持批量下载和删除

### 上传功能说明
1. 支持的文件格式：文档（PDF、DOC、DOCX、XLS、XLSX、TXT）、视频（MP4、AVI、MOV、WMV、FLV）、PPT（PPT、PPTX）、其他格式
2. 文件大小限制：单个文件不超过100MB
3. 上传流程：文件选择 → 基本信息填写 → 上传到OSS → 保存资源记录
4. 权限设置：支持公开、课程内、私有三种权限级别

## 技术栈

- 前端：Vue 3 + Element Plus + Vite
- 后端：Spring Boot + MyBatis
- 存储：阿里云OSS
- 数据库：MySQL

## 开发环境

### 前端启动
```bash
npm install
npm run dev
```

### 后端启动
确保后端服务运行在 `http://localhost:8080`

## API接口

### 资源管理接口
- `GET /resource/list/{teacherId}` - 获取教师资源列表
- `GET /resource/search` - 搜索资源
- `POST /resource/upload/file` - 上传资源文件
- `GET /resource/download/{id}` - 下载资源
- `DELETE /resource/delete/{id}` - 删除资源
- `POST /resource/share` - 分享资源

## 项目结构

```
src/
├── api/           # API接口
├── components/    # 公共组件
├── router/        # 路由配置
├── stores/        # 状态管理
├── utils/         # 工具函数
└── views/         # 页面组件
    └── resources/ # 资源管理页面
        ├── List.vue    # 资源列表
        └── Upload.vue  # 资源上传
```

## 使用说明

### 上传资源
1. 登录系统后，进入"资源管理" → "上传资源"
2. 填写资源基本信息（名称、描述、类型、权限）
3. 选择要上传的文件（支持拖拽上传）
4. 点击"开始上传"按钮
5. 等待上传完成，成功后自动跳转到资源列表

### 管理资源
1. 在资源列表页面可以查看所有上传的资源
2. 支持按文件名、类型、课程等条件搜索
3. 可以预览、下载、分享或删除资源
4. 支持批量操作（批量下载、批量删除）

## 注意事项

1. 确保后端服务正常运行
2. 确保阿里云OSS配置正确
3. 文件上传需要网络连接
4. 大文件上传可能需要较长时间，请耐心等待 