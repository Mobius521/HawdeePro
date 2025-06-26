import request from '@/utils/request';

// 登录接口
export const login = async (data) => {
  try {
    const response = await request.post('/login', data);
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '登录请求失败');
  }
};
// 注册接口
export const register = async (data) => {
  try {
    const response = await request.post('/register', data);
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '注册请求失败');
  }
};