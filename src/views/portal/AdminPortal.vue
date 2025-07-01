<template>
    <div class="portal-index">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h2 class="page-title">网站门户</h2>
          <p class="page-description">管理网站首页内容、公告通知和系统设置</p>
        </div>
      </div>
  
      <!-- 功能导航 -->
      <div class="feature-nav">
        <el-row :gutter="20">
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="nav-card" @click="handleNavClick('banner')">
              <div class="nav-icon">
                <el-icon><Picture /></el-icon>
              </div>
              <div class="nav-content">
                <h4>轮播管理</h4>
                <p>管理首页轮播图</p>
              </div>
            </div>
          </el-col>
          
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="nav-card" @click="handleNavClick('notice')">
              <div class="nav-icon">
                <el-icon><Bell /></el-icon>
              </div>
              <div class="nav-content">
                <h4>公告管理</h4>
                <p>发布系统公告</p>
              </div>
            </div>
          </el-col>
          
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="nav-card" @click="handleNavClick('news')">
              <div class="nav-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="nav-content">
                <h4>新闻管理</h4>
                <p>管理新闻资讯</p>
              </div>
            </div>
          </el-col>
          
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="nav-card" @click="handleNavClick('link')">
              <div class="nav-icon">
                <el-icon><Link /></el-icon>
              </div>
              <div class="nav-content">
                <h4>友情链接</h4>
                <p>管理友情链接</p>
              </div>
            </div>
          </el-col>
          
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="nav-card" @click="handleNavClick('seo')">
              <div class="nav-icon">
                <el-icon><Search /></el-icon>
              </div>
              <div class="nav-content">
                <h4>SEO设置</h4>
                <p>搜索引擎优化</p>
              </div>
            </div>
          </el-col>
          
          <el-col :xs="12" :sm="8" :md="6" :lg="4">
            <div class="nav-card" @click="handleNavClick('theme')">
              <div class="nav-icon">
                <el-icon><Brush /></el-icon>
              </div>
              <div class="nav-content">
                <h4>主题设置</h4>
                <p>自定义网站主题</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
  
      <!-- 内容管理区域 -->
      <div class="content-management">
        <el-tabs v-model="activeTab" type="card">
          <!-- 轮播管理 -->
          <el-tab-pane label="轮播管理" name="banner">
            <div class="banner-management">
              <div class="section-header">
                <h3>轮播图管理</h3>
                <el-button type="primary" @click="addBanner">
                  <el-icon><Plus /></el-icon>
                  添加轮播图
                </el-button>
              </div>
              
              <div class="banner-list">
                <el-row :gutter="20">
                  <el-col
                    v-for="banner in bannerList"
                    :key="banner.id"
                    :xs="24" :sm="12" :md="8" :lg="6"
                  >
                    <div class="banner-item">
                      <div class="banner-image">
                        <img :src="banner.image" :alt="banner.title" />
                        <div class="banner-overlay">
                          <el-button type="primary" size="small" @click="editBanner(banner)">
                            编辑
                          </el-button>
                          <el-button type="danger" size="small" @click="deleteBanner(banner)">
                            删除
                          </el-button>
                        </div>
                      </div>
                      <div class="banner-info">
                        <h4>{{ banner.title }}</h4>
                        <p>{{ banner.description }}</p>
                        <div class="banner-meta">
                          <el-tag :type="banner.status === 'active' ? 'success' : 'info'" size="small">
                            {{ banner.status === 'active' ? '启用' : '禁用' }}
                          </el-tag>
                          <span class="sort-order">排序: {{ banner.sort }}</span>
                        </div>
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-tab-pane>
  
          <!-- 公告管理 -->
          <el-tab-pane label="公告管理" name="notice">
            <div class="notice-management">
              <div class="section-header">
                <h3>系统公告</h3>
                <el-button type="primary" @click="addNotice">
                  <el-icon><Plus /></el-icon>
                  发布公告
                </el-button>
              </div>
              
              <el-table :data="noticeList" style="width: 100%">
                <el-table-column prop="title" label="公告标题" min-width="200" />
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getNoticeTypeColor(row.type)">
                      {{ getNoticeTypeText(row.type) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'published' ? 'success' : 'warning'">
                      {{ row.status === 'published' ? '已发布' : '草稿' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="publishTime" label="发布时间" width="180">
                  <template #default="{ row }">
                    {{ formatDate(row.publishTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="views" label="浏览量" width="100" />
                <el-table-column label="操作" width="200">
                  <template #default="{ row }">
                    <el-button type="text" size="small" @click="viewNotice(row)">
                      查看
                    </el-button>
                    <el-button type="text" size="small" @click="editNotice(row)">
                      编辑
                    </el-button>
                    <el-button type="text" size="small" @click="deleteNotice(row)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
  
          <!-- 新闻管理 -->
          <el-tab-pane label="新闻管理" name="news">
            <div class="news-management">
              <div class="section-header">
                <h3>新闻资讯</h3>
                <el-button type="primary" @click="addNews">
                  <el-icon><Plus /></el-icon>
                  发布新闻
                </el-button>
              </div>
              
              <el-table :data="newsList" style="width: 100%">
                <el-table-column prop="title" label="新闻标题" min-width="200" />
                <el-table-column prop="category" label="分类" width="120">
                  <template #default="{ row }">
                    <el-tag>{{ row.category }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="author" label="作者" width="100" />
                <el-table-column prop="publishTime" label="发布时间" width="180">
                  <template #default="{ row }">
                    {{ formatDate(row.publishTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="views" label="浏览量" width="100" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'published' ? 'success' : 'warning'">
                      {{ row.status === 'published' ? '已发布' : '草稿' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="{ row }">
                    <el-button type="text" size="small" @click="viewNews(row)">
                      查看
                    </el-button>
                    <el-button type="text" size="small" @click="editNews(row)">
                      编辑
                    </el-button>
                    <el-button type="text" size="small" @click="deleteNews(row)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
  
          <!-- 系统设置 -->
          <el-tab-pane label="系统设置" name="settings">
            <div class="system-settings">
              <el-form :model="settingsForm" label-width="120px">
                <div class="settings-section">
                  <h3>基本设置</h3>
                  <el-form-item label="网站名称">
                    <el-input v-model="settingsForm.siteName" style="width: 300px" />
                  </el-form-item>
                  <el-form-item label="网站描述">
                    <el-input
                      v-model="settingsForm.siteDescription"
                      type="textarea"
                      :rows="3"
                      style="width: 500px"
                    />
                  </el-form-item>
                  <el-form-item label="关键词">
                    <el-input v-model="settingsForm.keywords" style="width: 500px" />
                  </el-form-item>
                  <el-form-item label="网站Logo">
                    <el-upload
                      class="logo-uploader"
                      action="#"
                      :show-file-list="false"
                      :before-upload="beforeLogoUpload"
                    >
                      <img v-if="settingsForm.logo" :src="settingsForm.logo" class="logo-image" />
                      <div v-else class="logo-placeholder">
                        <el-icon><Plus /></el-icon>
                        <div>上传Logo</div>
                      </div>
                    </el-upload>
                  </el-form-item>
                </div>
  
                <div class="settings-section">
                  <h3>联系信息</h3>
                  <el-form-item label="联系电话">
                    <el-input v-model="settingsForm.phone" style="width: 300px" />
                  </el-form-item>
                  <el-form-item label="联系邮箱">
                    <el-input v-model="settingsForm.email" style="width: 300px" />
                  </el-form-item>
                  <el-form-item label="联系地址">
                    <el-input v-model="settingsForm.address" style="width: 500px" />
                  </el-form-item>
                </div>
  
                <div class="settings-actions">
                  <el-button type="primary" @click="saveSettings">
                    保存设置
                  </el-button>
                  <el-button @click="resetSettings">
                    重置
                  </el-button>
                </div>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, reactive } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { formatDate } from '@/utils'
  
  export default {
    name: 'PortalIndex',
    setup() {
      const activeTab = ref('banner')
  
      // 轮播图数据
      const bannerList = ref([
        {
          id: 1,
          title: '欢迎使用在线教学平台',
          description: '为教师提供全方位的教学支持服务',
          image: '/api/placeholder/400/200',
          link: '#',
          sort: 1,
          status: 'active'
        },
        {
          id: 2,
          title: '智慧教学新体验',
          description: '创新教学模式，提升教学效果',
          image: '/api/placeholder/400/200',
          link: '#',
          sort: 2,
          status: 'active'
        },
        {
          id: 3,
          title: '在线课程资源丰富',
          description: '海量优质教学资源等您探索',
          image: '/api/placeholder/400/200',
          link: '#',
          sort: 3,
          status: 'inactive'
        }
      ])
  
      // 公告数据
      const noticeList = ref([
        {
          id: 1,
          title: '系统维护通知',
          type: 'system',
          content: '系统将于今晚22:00-24:00进行维护升级',
          status: 'published',
          publishTime: '2024-06-25 10:00:00',
          views: 156
        },
        {
          id: 2,
          title: '新功能上线公告',
          type: 'feature',
          content: '新增视频直播教学功能，欢迎体验',
          status: 'published',
          publishTime: '2024-06-24 14:30:00',
          views: 89
        },
        {
          id: 3,
          title: '期末考试安排',
          type: 'exam',
          content: '期末考试时间安排已发布，请及时查看',
          status: 'draft',
          publishTime: '2024-06-23 09:15:00',
          views: 234
        }
      ])
  
      // 新闻数据
      const newsList = ref([
        {
          id: 1,
          title: '我校在线教学平台获得教育部认可',
          category: '学校新闻',
          author: '管理员',
          content: '我校自主研发的在线教学平台获得教育部高度认可...',
          status: 'published',
          publishTime: '2024-06-25 16:00:00',
          views: 512
        },
        {
          id: 2,
          title: '教师培训：如何有效使用在线教学工具',
          category: '培训通知',
          author: '教务处',
          content: '为提高教师在线教学能力，特举办专题培训...',
          status: 'published',
          publishTime: '2024-06-24 11:20:00',
          views: 298
        }
      ])
  
      // 系统设置表单
      const settingsForm = reactive({
        siteName: '在线教学支持服务平台',
        siteDescription: '为教师提供全方位的在线教学支持服务，包括课程管理、资源共享、在线测评等功能',
        keywords: '在线教学,教育平台,课程管理,教学资源',
        logo: '',
        phone: '400-123-4567',
        email: 'contact@example.com',
        address: '北京市海淀区中关村大街123号'
      })
  
      // 处理导航点击
      const handleNavClick = (tab) => {
        activeTab.value = tab
      }
  
      // 获取公告类型文本
      const getNoticeTypeText = (type) => {
        const typeMap = {
          system: '系统',
          feature: '功能',
          exam: '考试',
          course: '课程'
        }
        return typeMap[type] || '其他'
      }
  
      // 获取公告类型颜色
      const getNoticeTypeColor = (type) => {
        const colorMap = {
          system: 'danger',
          feature: 'success',
          exam: 'warning',
          course: 'primary'
        }
        return colorMap[type] || 'info'
      }
  
      // 轮播图操作
      const addBanner = () => {
        ElMessage.info('添加轮播图功能')
      }
  
      const editBanner = (banner) => {
        ElMessage.info(`编辑轮播图: ${banner.title}`)
      }
  
      const deleteBanner = (banner) => {
        ElMessageBox.confirm(`确定要删除轮播图 "${banner.title}" 吗？`, '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const index = bannerList.value.findIndex(b => b.id === banner.id)
          if (index > -1) {
            bannerList.value.splice(index, 1)
          }
          ElMessage.success('删除成功')
        })
      }
  
      // 公告操作
      const addNotice = () => {
        ElMessage.info('发布公告功能')
      }
  
      const viewNotice = (notice) => {
        ElMessage.info(`查看公告: ${notice.title}`)
      }
  
      const editNotice = (notice) => {
        ElMessage.info(`编辑公告: ${notice.title}`)
      }
  
      const deleteNotice = (notice) => {
        ElMessageBox.confirm(`确定要删除公告 "${notice.title}" 吗？`, '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const index = noticeList.value.findIndex(n => n.id === notice.id)
          if (index > -1) {
            noticeList.value.splice(index, 1)
          }
          ElMessage.success('删除成功')
        })
      }
  
      // 新闻操作
      const addNews = () => {
        ElMessage.info('发布新闻功能')
      }
  
      const viewNews = (news) => {
        ElMessage.info(`查看新闻: ${news.title}`)
      }
  
      const editNews = (news) => {
        ElMessage.info(`编辑新闻: ${news.title}`)
      }
  
      const deleteNews = (news) => {
        ElMessageBox.confirm(`确定要删除新闻 "${news.title}" 吗？`, '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const index = newsList.value.findIndex(n => n.id === news.id)
          if (index > -1) {
            newsList.value.splice(index, 1)
          }
          ElMessage.success('删除成功')
        })
      }
  
      // Logo上传前验证
      const beforeLogoUpload = (file) => {
        const isImage = file.type.startsWith('image/')
        const isLt2M = file.size / 1024 / 1024 < 2
  
        if (!isImage) {
          ElMessage.error('只能上传图片文件!')
          return false
        }
        if (!isLt2M) {
          ElMessage.error('图片大小不能超过 2MB!')
          return false
        }
  
        // 模拟上传
        const reader = new FileReader()
        reader.onload = (e) => {
          settingsForm.logo = e.target.result
        }
        reader.readAsDataURL(file)
        
        return false
      }
  
      // 保存设置
      const saveSettings = () => {
        ElMessage.success('设置保存成功')
      }
  
      // 重置设置
      const resetSettings = () => {
        ElMessageBox.confirm('确定要重置所有设置吗？', '重置确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 重置表单
          Object.assign(settingsForm, {
            siteName: '在线教学支持服务平台',
            siteDescription: '为教师提供全方位的在线教学支持服务，包括课程管理、资源共享、在线测评等功能',
            keywords: '在线教学,教育平台,课程管理,教学资源',
            logo: '',
            phone: '400-123-4567',
            email: 'contact@example.com',
            address: '北京市海淀区中关村大街123号'
          })
          ElMessage.success('设置已重置')
        })
      }
  
      return {
        activeTab,
        bannerList,
        noticeList,
        newsList,
        settingsForm,
        handleNavClick,
        getNoticeTypeText,
        getNoticeTypeColor,
        addBanner,
        editBanner,
        deleteBanner,
        addNotice,
        viewNotice,
        editNotice,
        deleteNotice,
        addNews,
        viewNews,
        editNews,
        deleteNews,
        beforeLogoUpload,
        saveSettings,
        resetSettings,
        formatDate
      }
    }
  }
  </script>
  
  <style scoped>
  .portal-index {
    padding: 0;
  }
  
  .page-header {
    margin-bottom: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  }
  
  .header-content h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    color: #303133;
  }
  
  .header-content p {
    margin: 0;
    color: #606266;
    font-size: 14px;
  }
  
  .feature-nav {
    margin-bottom: 20px;
  }
  
  .nav-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .nav-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px 0 rgba(0,0,0,.15);
  }
  
  .nav-icon {
    font-size: 32px;
    color: #409eff;
    margin-bottom: 12px;
  }
  
  .nav-content h4 {
    margin: 0 0 4px 0;
    font-size: 16px;
    color: #303133;
  }
  
  .nav-content p {
    margin: 0;
    font-size: 12px;
    color: #909399;
  }
  
  .content-management {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    overflow: hidden;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .section-header h3 {
    margin: 0;
    font-size: 18px;
    color: #303133;
  }
  
  .banner-list {
    margin-top: 20px;
  }
  
  .banner-item {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px 0 rgba(0,0,0,.1);
    transition: transform 0.3s;
  }
  
  .banner-item:hover {
    transform: translateY(-2px);
  }
  
  .banner-image {
    position: relative;
    height: 150px;
    overflow: hidden;
  }
  
  .banner-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .banner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .banner-item:hover .banner-overlay {
    opacity: 1;
  }
  
  .banner-info {
    padding: 16px;
  }
  
  .banner-info h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #303133;
  }
  
  .banner-info p {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #606266;
    line-height: 1.4;
  }
  
  .banner-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .sort-order {
    font-size: 12px;
    color: #909399;
  }
  
  .settings-section {
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .settings-section:last-of-type {
    border-bottom: none;
  }
  
  .settings-section h3 {
    margin: 0 0 20px 0;
    font-size: 16px;
    color: #303133;
    font-weight: 600;
  }
  
  .logo-uploader {
    display: block;
  }
  
  .logo-image {
    width: 120px;
    height: 60px;
    object-fit: contain;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
  }
  
  .logo-placeholder {
    width: 120px;
    height: 60px;
    border: 2px dashed #dcdfe6;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 0.3s;
    font-size: 12px;
    color: #8c939d;
  }
  
  .logo-placeholder:hover {
    border-color: #409eff;
  }
  
  .settings-actions {
    display: flex;
    gap: 16px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .nav-card {
      height: 100px;
      padding: 16px;
    }
  
    .nav-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
  
    .nav-content h4 {
      font-size: 14px;
    }
  
    .section-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }
  
    .settings-actions {
      flex-direction: column;
    }
  }
  </style>