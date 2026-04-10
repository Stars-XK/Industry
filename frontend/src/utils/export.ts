import * as XLSX from 'xlsx'

export function exportToExcel(data: any[], filename: string, headers?: Record<string, string>) {
  if (!data || !data.length) return
  
  let exportData = data
  
  // If headers are provided, map the data keys to the header names
  if (headers) {
    exportData = data.map(item => {
      const formattedItem: any = {}
      for (const [key, headerName] of Object.entries(headers)) {
        if (item[key] !== undefined) {
          formattedItem[headerName] = item[key]
        }
      }
      return formattedItem
    })
  }

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
  
  XLSX.writeFile(workbook, `${filename}_${new Date().getTime()}.xlsx`)
}
