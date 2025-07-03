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

// 注册接口 - 匹配后端Teacher实体字段
export const register = async (data) => {
  try {
    const response = await request({
      url: '/auth/register',
      method: 'post',
      data: {
        staffId: data.staffId,
        name: data.name,
        password: data.password,
        phone: data.phone,
        email: data.email,
        roleType: data.roleType
      }
    });
    return response;
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

// 获取个人信息接口
export const getProfile = async (staffId) => {
  try {
    const response = await request({
      url: `/auth/profile/${staffId}`,
      method: 'get'
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '获取个人信息失败');
  }
};

// 更新个人信息接口
export const updateProfile = async (staffId, data) => {
  try {
    const response = await request({
      url: '/auth/update',
      method: 'post',
      data: {
        staffId: staffId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        roleType: data.roleType
      }
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '更新个人信息失败');
  }
};

// 修改密码接口 - 暂时使用更新个人信息接口
export const changePassword = async (staffId, data) => {
  try {
    const response = await request({
      url: '/auth/update',
      method: 'post',
      data: {
        staffId: staffId,
        password: data.newPassword
      }
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || '修改密码失败');
  }
};