import { defineStore } from 'pinia'
import request from '@/utils/request'

export const useDictStore = defineStore('dict', {
  state: () => ({
    dictMap: new Map<string, any[]>()
  }),
  actions: {
    async getDict(dictType: string) {
      if (this.dictMap.has(dictType)) {
        return this.dictMap.get(dictType)
      }
      try {
        const res = await request.get(`/api/system/dict/data/list/${dictType}`)
        // res.data is the array if backend returns { code: 200, data: [...] }
        const dictData = res || []
        this.dictMap.set(dictType, dictData)
        return dictData
      } catch (error) {
        console.error(`Failed to fetch dict ${dictType}`, error)
        return []
      }
    }
  }
})
