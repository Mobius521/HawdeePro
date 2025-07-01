import request from '@/utils/request';

// 获取所有操作日志
export const getLogList = async () => {
  try {
    const response = await request({
      url: '/log/list',
      method: 'get'
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '获取日志列表失败');
  }
};

// 获取日志总数
export const getLogCount = async () => {
  try {
    const response = await request({
      url: '/log/count',
      method: 'get'
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '获取日志总数失败');
  }
};

// 添加操作日志
export const addLog = async (data) => {
  try {
    const response = await request({
      url: '/log/add',
      method: 'post',
      data: {
        staffId: data.staffId,
        operationContent: data.operationContent
      }
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '添加日志失败');
  }
};

// 导出日志（可选功能，如果后端支持的话）
export const exportLogs = async (params = {}) => {
  try {
    const response = await request({
      url: '/log/export',
      method: 'get',
      params,
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '导出日志失败');
  }
}; 