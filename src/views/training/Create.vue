<template>
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h2 class="page-title">功能页面</h2>
          <p class="page-description">该功能正在开发中...</p>
        </div>
      </div>
  
      <div class="card">
        <el-empty description="功能开发中，敬请期待..." />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'PlaceholderPage'
  }
  </script>
  
  <style scoped>
  .page-container {
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
  </style>
  