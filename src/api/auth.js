// src/api/auth.js
import request from '@/utils/request';

// 登录接口
export const login = async (data) => {
  try {
    const response = await request.post('/auth/login', data);
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '登录请求失败');
  }
};

// 注册接口
export const register = async (data) => {

  try {
    console.log('模拟注册请求，请求数据:', data);
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟注册成功
        resolve({ success: true, message: '注册成功' });
      }, 1000);
    });
  } catch (error) {
    throw new Error(error.response?.data?.message || '注册请求失败');
  }
  // try {
  //   const response = await request.post('/auth/register', data);
  //   return response;
  // } catch (error) {
  //   throw new Error(error.response?.data?.message || '注册请求失败');
  // }
};

// 登出接口
export const logout = async () => {
  try {
    const response = await request.post('/auth/logout');
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '登出请求失败');
  }
};