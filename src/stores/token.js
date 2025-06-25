import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useToken = defineStore('token', () => {
  const token = ref('')
 const setToken=(newtoken)=>{
  token.value=newtoken
 }
 const removetoken=()=>{
  token.value=''
 }

  return { token,setToken,removetoken }
},
{persist:true}
)
