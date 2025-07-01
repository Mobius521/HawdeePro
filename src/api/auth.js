// src/api/auth.js
import request from '@/utils/request';

// 登录接口 - 使用表单数据格式匹配后端 @RequestParam 参数
export const login = async (data) => {
  try {
    // 使用 URLSearchParams 创建表单数据
    const params = new URLSearchParams();
    params.append('username', data.username);
    params.append('password', data.password);
    
    const response = await request({
      url: '/auth/login',
      method: 'post',
      data: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
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
};

// 登出接口
export const logout = async () => {
  try {
    const response = await request({
      url: '/auth/logout',
      method: 'post'
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '登出请求失败');
  }
};

// 获取教师姓名接口
export const getTeacherName = async (staffId) => {
  try {
    const response = await request({
      url: `/auth/getname/${staffId}`,
      method: 'get'
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '获取教师姓名失败');
  }
};