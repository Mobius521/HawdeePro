/**
 * 工具函数集合
 */

// 格式化日期
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return ''
    
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    const second = String(d.getSeconds()).padStart(2, '0')
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hour)
      .replace('mm', minute)
      .replace('ss', second)
  }
  
  // 格式化文件大小
  export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // 防抖函数
  export function debounce(func, wait, immediate) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        timeout = null
        if (!immediate) func(...args)
      }
      const callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func(...args)
    }
  }
  
  // 节流函数
  export function throttle(func, limit) {
    let inThrottle
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
  
  // 深拷贝
  export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(item => deepClone(item))
    if (typeof obj === 'object') {
      const clonedObj = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = deepClone(obj[key])
        }
      }
      return clonedObj
    }
  }
  
  // 生成随机ID
  export function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
  
  // 验证邮箱
  export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }
  
  // 验证手机号
  export function validatePhone(phone) {
    const re = /^1[3-9]\d{9}$/
    return re.test(phone)
  }
  
  // 获取文件扩展名
  export function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
  }
  
  // 下载文件
  export function downloadFile(url, filename) {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // 复制到剪贴板
  export function copyToClipboard(text) {
    return navigator.clipboard.writeText(text).then(() => {
      return true
    }).catch(() => {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return true
      } catch (err) {
        document.body.removeChild(textArea)
        return false
      }
    })
  }
  
  // 获取URL参数
  export function getUrlParams(url = window.location.href) {
    const params = {}
    const urlObj = new URL(url)
    for (const [key, value] of urlObj.searchParams) {
      params[key] = value
    }
    return params
  }
  
  // 树形数据扁平化
  export function flattenTree(tree, childrenKey = 'children') {
    const result = []
    
    function traverse(nodes, parent = null) {
      nodes.forEach(node => {
        const item = { ...node, parent }
        delete item[childrenKey]
        result.push(item)
        
        if (node[childrenKey] && node[childrenKey].length > 0) {
          traverse(node[childrenKey], node)
        }
      })
    }
    
    traverse(tree)
    return result
  }
  
  // 扁平数据转树形
  export function arrayToTree(array, idKey = 'id', parentKey = 'parentId', childrenKey = 'children') {
    const tree = []
    const map = {}
    
    // 创建映射
    array.forEach(item => {
      map[item[idKey]] = { ...item, [childrenKey]: [] }
    })
    
    // 构建树形结构
    array.forEach(item => {
      const node = map[item[idKey]]
      if (item[parentKey] && map[item[parentKey]]) {
        map[item[parentKey]][childrenKey].push(node)
      } else {
        tree.push(node)
      }
    })
    
    return tree
  }