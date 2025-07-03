import request from '@/utils/request';

// 发送消息
export const sendMessage = async (data) => {
  try {
    const response = await request({
      url: '/communication/send',
      method: 'post',
      data: data
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '发送消息失败');
  }
};

// 获取我的消息列表
export const getMyMessages = async (userId) => {
  try {
    const response = await request({
      url: '/communication/my',
      method: 'get',
      params: { userId }
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '获取消息失败');
  }
};

// 标记消息为已读
export const markAsRead = async (messageId) => {
  try {
    const response = await request({
      url: '/communication/read',
      method: 'post',
      params: { messageId }
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '标记已读失败');
  }
};

// 删除消息
export const deleteMessage = async (messageId) => {
  try {
    const response = await request({
      url: '/communication/delete',
      method: 'delete',
      params: { messageId }
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '删除消息失败');
  }
}; 