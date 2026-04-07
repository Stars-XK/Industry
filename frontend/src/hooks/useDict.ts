import { ref, Ref } from 'vue'
import { useDictStore } from '@/store/dict'

export function useDict(...args: string[]) {
  const dictStore = useDictStore()
  const res: { [key: string]: Ref<any[]> } = {}
  
  args.forEach((dictType) => {
    res[dictType] = ref([])
    dictStore.getDict(dictType).then((data) => {
      res[dictType].value = data
    })
  })

  return res
}
