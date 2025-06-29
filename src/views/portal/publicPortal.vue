<template>
  <div class="public-portal">
    <!-- 顶部导航 -->
    <header class="portal-header">
      <div class="header-container">
        <div class="logo-container">
          <img src="@/assets/logo.jpg" alt="Logo" class="logo" />
          <h1 class="site-title">在线教学支持服务平台</h1>
        </div>
        <nav class="main-nav">
          <ul class="nav-list">
            <li class="nav-item"><a href="#home" class="nav-link active">首页</a></li>
            <li class="nav-item"><a href="#features" class="nav-link">平台特色</a></li>
            <li class="nav-item"><a href="#courses" class="nav-link">精品课程</a></li>
            <li class="nav-item"><a href="#resources" class="nav-link">教学资源</a></li>
            <li class="nav-item"><a href="#news" class="nav-link">新闻公告</a></li>
            <li class="nav-item"><a href="#about" class="nav-link">关于我们</a></li>
          </ul>
        </nav>
        <div class="auth-buttons">
          <el-button type="primary" @click="goToLogin">登录</el-button>
        </div>
      </div>
    </header>

    <!-- 轮播图 -->
    <section id="home" class="banner-section">
      <el-carousel height="500px" indicator-position="outside" :interval="5000">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div class="banner-item" :style="{ backgroundImage: `url(${banner.image})` }">
            <div class="banner-content">
              <h2 class="banner-title">{{ banner.title }}</h2>
              <p class="banner-description">{{ banner.description }}</p>
              <el-button type="primary" size="large" v-if="banner.buttonText" @click="goToLogin">
                {{ banner.buttonText }}
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 平台特色 -->
    <section id="features" class="features-section">
      <div class="section-container">
        <h2 class="section-title">平台特色</h2>
        <p class="section-subtitle">为教师和学生提供全方位的在线教学支持服务</p>

        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.id">
            <div class="feature-icon">
              <el-icon><component :is="feature.icon" /></el-icon>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 精品课程 -->
    <section id="courses" class="courses-section">
      <div class="section-container">
        <h2 class="section-title">精品课程</h2>
        <p class="section-subtitle">探索我们的优质课程资源</p>

        <el-tabs v-model="activeCategory" class="course-tabs">
          <el-tab-pane v-for="category in courseCategories" :key="category.id" :label="category.name" :name="category.id">
            <div class="courses-grid">
              <div class="course-card" v-for="course in getCoursesByCategory(category.id)" :key="course.id">
                <div class="course-image">
                  <img :src="course.image" :alt="course.title" />
                  <div class="course-badge" v-if="course.isFeatured">精品</div>
                </div>
                <div class="course-content">
                  <h3 class="course-title">{{ course.title }}</h3>
                  <p class="course-instructor">{{ course.instructor }}</p>
                  <div class="course-meta">
                    <span class="course-students">
                      <el-icon><User /></el-icon> {{ course.students }}人学习
                    </span>
                    <span class="course-rating">
                      <el-rate v-model="course.rating" disabled text-color="#ff9900" />
                    </span>
                  </div>
                  <el-button type="primary" @click="goToLogin">查看详情</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </section>

    <!-- 教学资源 -->
    <section id="resources" class="resources-section">
      <div class="section-container">
        <h2 class="section-title">教学资源</h2>
        <p class="section-subtitle">丰富多样的教学资源库</p>

        <div class="resources-grid">
          <div class="resource-card" v-for="resource in resources" :key="resource.id">
            <div class="resource-icon">
              <el-icon><component :is="resource.icon" /></el-icon>
            </div>
            <h3 class="resource-title">{{ resource.title }}</h3>
            <p class="resource-description">{{ resource.description }}</p>
            <el-button type="primary" plain @click="goToLogin">浏览资源</el-button>
          </div>
        </div>
      </div>
    </section>

    <!-- 新闻公告 -->
    <section id="news" class="news-section">
      <div class="section-container">
        <h2 class="section-title">新闻公告</h2>
        <p class="section-subtitle">了解最新动态和重要通知</p>

        <div class="news-container">
          <div class="news-list">
            <div class="news-item" v-for="news in newsList" :key="news.id" @click="selectNews(news)">
              <div class="news-date">
                <div class="news-day">{{ formatDay(news.publishTime) }}</div>
                <div class="news-month">{{ formatMonth(news.publishTime) }}</div>
              </div>
              <div class="news-content">
                <h3 class="news-title" :class="{ 'active': selectedNews && selectedNews.id === news.id }">
                  {{ news.title }}
                </h3>
                <p class="news-meta">
                  <span class="news-category">{{ news.category }}</span>
                  <span class="news-time">{{ formatTime(news.publishTime) }}</span>
                </p>
              </div>
            </div>
          </div>

          <div class="news-detail" v-if="selectedNews">
            <h3 class="detail-title">{{ selectedNews.title }}</h3>
            <div class="detail-meta">
              <span class="detail-category">{{ selectedNews.category }}</span>
              <span class="detail-time">{{ formatDate(selectedNews.publishTime) }}</span>
              <span class="detail-author">{{ selectedNews.author }}</span>
            </div>
            <div class="detail-content" v-html="selectedNews.content"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 关于我们 -->
    <section id="about" class="about-section">
      <div class="section-container">
        <h2 class="section-title">关于我们</h2>
        <p class="section-subtitle">致力于提供优质的在线教学服务</p>

        <div class="about-content">
          <div class="about-image">
            <img src="@/assets/about-image.jpg" alt="About Us" />
          </div>
          <div class="about-text">
            <p>在线教学支持服务平台是一个为高校教师和学生提供全方位教学支持的综合性平台。我们致力于通过技术创新，提升教学质量和学习体验。</p>
            <p>平台集成了课程管理、资源共享、在线授课、作业考试、学情分析等多种功能，为教师提供便捷的教学工具，为学生创造高效的学习环境。</p>
            <p>我们的使命是通过数字化转型，推动教育教学改革，培养适应未来社会发展需要的创新型人才。</p>

            <div class="about-stats">
              <div class="stat-item">
                <div class="stat-number">100+</div>
                <div class="stat-label">合作院校</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">5000+</div>
                <div class="stat-label">注册教师</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">10万+</div>
                <div class="stat-label">学生用户</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">2000+</div>
                <div class="stat-label">精品课程</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="portal-footer">
      <div class="footer-container">
        <div class="footer-top">
          <div class="footer-column">
            <h3 class="footer-title">关于平台</h3>
            <ul class="footer-links">
              <li><a href="#about">平台介绍</a></li>
              <li><a href="#about">发展历程</a></li>
              <li><a href="#about">团队成员</a></li>
              <li><a href="#about">合作伙伴</a></li>
            </ul>
          </div>

          <div class="footer-column">
            <h3 class="footer-title">教学资源</h3>
            <ul class="footer-links">
              <li><a href="#resources">课件资源</a></li>
              <li><a href="#resources">视频教程</a></li>
              <li><a href="#resources">试题库</a></li>
              <li><a href="#resources">案例分析</a></li>
            </ul>
          </div>

          <div class="footer-column">
            <h3 class="footer-title">帮助中心</h3>
            <ul class="footer-links">
              <li><a href="#help">使用指南</a></li>
              <li><a href="#help">常见问题</a></li>
              <li><a href="#help">意见反馈</a></li>
              <li><a href="#help">联系我们</a></li>
            </ul>
          </div>

          <div class="footer-column">
            <h3 class="footer-title">联系方式</h3>
            <ul class="footer-contact">
              <li><el-icon><Location /></el-icon> 北京市海淀区中关村大街123号</li>
              <li><el-icon><Phone /></el-icon> 400-123-4567</li>
              <li><el-icon><Message /></el-icon> contact@example.com</li>
            </ul>
            <div class="footer-social">
              <a href="#" class="social-link"><el-icon><Share /></el-icon></a>
              <a href="#" class="social-link"><el-icon><ChatDotRound /></el-icon></a>
              <a href="#" class="social-link"><el-icon><Connection /></el-icon></a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="copyright">© 2025 在线教学支持服务平台 版权所有</p>
          <p class="icp">京ICP备12345678号-1</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'PublicPortal',
  setup() {
    const router = useRouter()

    // 轮播图数据
    const banners = ref([
      {
        id: 1,
        title: '智慧教学新体验',
        description: '创新教学模式，提升教学效果',
        image: 'https://plus.unsplash.com/premium_photo-1661878265739-da90bc1af051?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        buttonText: '立即体验'
      },
      {
        id: 2,
        title: '丰富的教学资源库',
        description: '海量优质教学资源等您探索',
        image: 'https://images.unsplash.com/photo-1746649899561-95c298eba7ff?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        buttonText: '了解更多'
      },
      {
        id: 3,
        title: '多维度学情分析',
        description: '数据驱动教学决策，精准把握学生学习状态',
        image: 'https://plus.unsplash.com/premium_photo-1661963874418-df1110ee39c1?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        buttonText: '开始使用'
      }
    ])

    // 平台特色数据
    const features = ref([
      {
        id: 1,
        title: '课程管理',
        description: '支持创建不同类型课程，灵活编排课程内容，实时跟踪学习进度',
        icon: 'Reading'
      },
      {
        id: 2,
        title: '资源管理',
        description: '支持多类型资源上传与管理，多维度分类与检索，跨课程资源共享',
        icon: 'FolderOpened'
      },
      {
        id: 3,
        title: '在线授课',
        description: '支持多人视频直播、屏幕共享、互动问答，课程录制与发布',
        icon: 'VideoCamera'
      },
      {
        id: 4,
        title: '作业考试',
        description: '支持在线布置作业、自动批改客观题、在线组卷与限时考试',
        icon: 'EditPen'
      },
      {
        id: 5,
        title: '学情分析',
        description: '分析学习行为数据，评估学习效果，生成个性化学习建议',
        icon: 'DataAnalysis'
      },
      {
        id: 6,
        title: '多角色权限',
        description: '支持系统管理员、教师、助教等多种角色，精细化权限控制',
        icon: 'UserFilled'
      }
    ])

    // 课程分类
    const courseCategories = ref([
      { id: 'all', name: '全部课程' },
      { id: 'computer', name: '计算机科学' },
      { id: 'math', name: '数学' },
      { id: 'language', name: '语言文学' },
      { id: 'management', name: '管理学' }
    ])

    const activeCategory = ref('all')

    // 课程数据
    const courses = ref([
      {
        id: 1,
        title: 'Python程序设计基础',
        instructor: '张教授',
        category: 'computer',
        image: 'https://via.placeholder.com/300x200',
        students: 1250,
        rating: 4.8,
        isFeatured: true
      },
      {
        id: 2,
        title: '数据结构与算法',
        instructor: '李教授',
        category: 'computer',
        image: 'https://via.placeholder.com/300x200',
        students: 980,
        rating: 4.6,
        isFeatured: true
      },
      {
        id: 3,
        title: '高等数学',
        instructor: '王教授',
        category: 'math',
        image: 'https://via.placeholder.com/300x200',
        students: 1560,
        rating: 4.5,
        isFeatured: false
      },
      {
        id: 4,
        title: '线性代数',
        instructor: '赵教授',
        category: 'math',
        image: 'https://via.placeholder.com/300x200',
        students: 890,
        rating: 4.3,
        isFeatured: true
      },
      {
        id: 5,
        title: '中国现当代文学',
        instructor: '刘教授',
        category: 'language',
        image: 'https://via.placeholder.com/300x200',
        students: 760,
        rating: 4.7,
        isFeatured: false
      },
      {
        id: 6,
        title: '管理学原理',
        instructor: '陈教授',
        category: 'management',
        image: 'https://via.placeholder.com/300x200',
        students: 1120,
        rating: 4.4,
        isFeatured: true
      }
    ])

    // 根据分类筛选课程
    const getCoursesByCategory = (categoryId) => {
      if (categoryId === 'all') {
        return courses.value
      }
      return courses.value.filter(course => course.category === categoryId)
    }

    // 教学资源数据
    const resources = ref([
      {
        id: 1,
        title: '课件资源',
        description: '包含各学科PPT、PDF等多种格式课件',
        icon: 'Document'
      },
      {
        id: 2,
        title: '视频教程',
        description: '精品课程视频、操作演示、专题讲座等',
        icon: 'VideoPlay'
      },
      {
        id: 3,
        title: '试题库',
        description: '覆盖多学科的题库资源，支持在线组卷',
        icon: 'Collection'
      },
      {
        id: 4,
        title: '案例分析',
        description: '各学科经典案例，支持教学与研讨',
        icon: 'DataAnalysis'
      }
    ])

    // 新闻公告数据
    const newsList = ref([
      {
        id: 1,
        title: '关于开展2025年度教师在线教学能力提升培训的通知',
        category: '通知公告',
        author: '教务处',
        publishTime: '2025-06-25 10:00:00',
        content: '<p>为提高教师在线教学能力，适应信息化教学需求，学校决定开展2025年度教师在线教学能力提升培训。</p><p>培训内容包括：在线课程设计、数字教学资源制作、在线教学工具使用、混合式教学模式等。</p><p>培训时间：2025年7月10日-7月20日</p><p>培训地点：线上培训平台</p><p>请各院系教师积极报名参加。</p>'
      },
      {
        id: 2,
        title: '我校在线教学平台荣获2025年教育技术创新奖',
        category: '新闻动态',
        author: '宣传部',
        publishTime: '2025-06-23 14:30:00',
        content: '<p>近日，在2025年全国教育信息化大会上，我校自主研发的在线教学支持服务平台荣获"教育技术创新奖"。</p><p>该平台集成了课程管理、资源共享、在线授课、作业考试、学情分析等多种功能，为教师提供便捷的教学工具，为学生创造高效的学习环境。</p><p>平台自上线以来，已服务全校95%以上的教师和学生，开设在线课程超过2000门，上传教学资源超过10万个，有效提升了教学质量和学习效果。</p>'
      },
      {
        id: 3,
        title: '关于升级在线教学平台的通知',
        category: '系统公告',
        author: '信息中心',
        publishTime: '2025-06-20 09:15:00',
        content: '<p>为提升用户体验，优化系统性能，我校在线教学平台将于2025年6月30日进行升级维护。</p><p>维护时间：2025年6月30日 22:00-次日 06:00</p><p>维护期间，平台将暂停访问。请各位教师提前做好相关准备工作，避免影响教学安排。</p><p>升级后，平台将新增以下功能：</p><ol><li>AI助教功能，支持智能答疑</li><li>实时数据分析，提供更精准的学情报告</li><li>优化移动端体验，支持更多终端设备</li></ol><p>感谢您的理解与支持！</p>'
      }
    ])

    const selectedNews = ref(newsList.value[0])

    const selectNews = (news) => {
      selectedNews.value = news
    }

    // 日期格式化函数
    const formatDay = (dateString) => {
      return new Date(dateString).getDate()
    }

    const formatMonth = (dateString) => {
      const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
      return months[new Date(dateString).getMonth()]
    }

    const formatTime = (dateString) => {
      const date = new Date(dateString)
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }

    // 跳转到登录页
    const goToLogin = () => {
      router.push('/login')
    }

    return {
      banners,
      features,
      courseCategories,
      activeCategory,
      courses,
      getCoursesByCategory,
      resources,
      newsList,
      selectedNews,
      selectNews,
      formatDay,
      formatMonth,
      formatTime,
      formatDate,
      goToLogin
    }
  }
}
</script>

<style scoped>
.public-portal {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  color: #333;
  line-height: 1.5;
}

/* 顶部导航 */
.portal-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  margin-right: 10px;
}

.site-title {
  font-size: 20px;
  font-weight: 600;
  color: #409EFF;
  margin: 0;
}

.main-nav {
  flex: 1;
  margin: 0 40px;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  justify-content: center;
}

.nav-item {
  margin: 0 15px;
}

.nav-link {
  text-decoration: none;
  color: #606266;
  font-size: 16px;
  padding: 5px 0;
  position: relative;
  transition: color 0.3s;
}

.nav-link:hover, .nav-link.active {
  color: #409EFF;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #409EFF;
}

/* 轮播图 */
.banner-section {
  margin-top: 70px;
}

.banner-item {
  height: 500px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}

.banner-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  max-width: 800px;
  width: 80%;
}

.banner-title {
  font-size: 42px;
  font-weight: 600;
  margin-bottom: 20px;
}

.banner-description {
  font-size: 18px;
  margin-bottom: 30px;
}

/* 通用部分 */
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px;
}

.section-title {
  font-size: 32px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 15px;
  color: #303133;
}

.section-subtitle {
  font-size: 16px;
  text-align: center;
  color: #909399;
  margin-bottom: 50px;
}

/* 平台特色 */
.features-section {
  background-color: #f5f7fa;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.feature-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 40px;
  color: #409EFF;
  margin-bottom: 20px;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #303133;
}

.feature-description {
  color: #606266;
  line-height: 1.6;
}

/* 精品课程 */
.courses-section {
  background-color: #fff;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.course-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.course-image {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.course-card:hover .course-image img {
  transform: scale(1.05);
}

.course-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #f56c6c;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.course-content {
  padding: 20px;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #303133;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 48px;
}

.course-instructor {
  color: #909399;
  margin-bottom: 15px;
  font-size: 14px;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.course-students {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #606266;
  font-size: 14px;
}

/* 教学资源 */
.resources-section {
  background-color: #f5f7fa;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}

.resource-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.resource-icon {
  font-size: 40px;
  color: #409EFF;
  margin-bottom: 20px;
}

.resource-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #303133;
}

.resource-description {
  color: #606266;
  margin-bottom: 20px;
  line-height: 1.6;
}

/* 新闻公告 */
.news-section {
  background-color: #fff;
}

.news-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.news-list {
  border-right: 1px solid #ebeef5;
  padding-right: 20px;
}

.news-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.news-item:hover {
  background-color: #f5f7fa;
}

.news-date {
  min-width: 60px;
  text-align: center;
  margin-right: 15px;
}

.news-day {
  font-size: 24px;
  font-weight: 600;
  color: #409EFF;
}

.news-month {
  font-size: 12px;
  color: #909399;
}

.news-content {
  flex: 1;
}

.news-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #303133;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-title.active {
  color: #409EFF;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 12px;
  color: #909399;
}

.news-category {
  background-color: #ecf5ff;
  color: #409EFF;
  padding: 2px 6px;
  border-radius: 4px;
}

.news-detail {
  padding: 0 20px;
}

.detail-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #303133;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #909399;
}

.detail-category {
  background-color: #ecf5ff;
  color: #409EFF;
  padding: 2px 6px;
  border-radius: 4px;
}

.detail-content {
  line-height: 1.8;
  color: #606266;
}

/* 关于我们 */
.about-section {
  background-color: #f5f7fa;
}

.about-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  align-items: center;
}

.about-image img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.about-text p {
  margin-bottom: 20px;
  line-height: 1.8;
  color: #606266;
}

.about-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 30px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 页脚 */
.portal-footer {
  background-color: #303133;
  color: #fff;
  padding: 60px 0 20px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-top {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #fff;
}

.footer-links, .footer-contact {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li, .footer-contact li {
  margin-bottom: 10px;
}

.footer-links a {
  color: #c0c4cc;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #409EFF;
}

.footer-contact li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #c0c4cc;
}

.footer-social {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  transition: background-color 0.3s;
}

.social-link:hover {
  background-color: #409EFF;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .about-content {
    grid-template-columns: 1fr;
  }

  .news-container {
    grid-template-columns: 1fr;
  }

  .news-list {
    border-right: none;
    padding-right: 0;
  }
}

@media (max-width: 768px) {
  .main-nav {
    display: none;
  }

  .banner-title {
    font-size: 32px;
  }

  .section-title {
    font-size: 28px;
  }

  .about-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}

@media (max-width: 576px) {
  .banner-title {
    font-size: 24px;
  }

  .banner-description {
    font-size: 16px;
  }

  .section-container {
    padding: 60px 20px;
  }
}
</style>