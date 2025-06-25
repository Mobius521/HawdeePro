import axios from 'axios'
import { useToken } from '@/stores/token.js'
import { ElMessage } from 'element-plus'
import router from '@/router'
const baseURL='/api'
const instance =axios.create({baseURL})
instance.interceptors.request.use(
    (config)=>{
        const ax = useToken();
        if(ax.token){
            config.headers.Authorization=ax.token
        }
        return config;
    },
    (err)=>{
        return Promise.reject(err)
    }
)
instance.interceptors.response.use(
    result=>{
        if(result.data.code===0)
        {
            return result.data;
        }
    },
    err=>{
   if(err.response.status===401){
    ElMessage.error('服务异常');
    router.push("/login")
   } else{
    ElMessage.error('服务异常')
   }
   return Promise.reject(err);
    }
)
export default instance;