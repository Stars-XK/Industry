import os

path = '/workspace/frontend/src/views/analytics/mnf.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the chart instance handling
# Add a chart instance variable
script_add = """
let chartInstance: echarts.ECharts | null = null

window.addEventListener('resize', () => {
  chartInstance?.resize()
})
"""

# replace initChart logic to reuse instance and clear old data properly
new_init = """const initChart = (dates: string[], actualData: number[], baselineData: number[]) => {
  const dom = document.getElementById('mnf-chart')
  if (!dom) return
  if (!chartInstance) {
    chartInstance = echarts.init(dom)
  }
  chartInstance.setOption({"""

content = content.replace("const initChart = (dates: string[], actualData: number[], baselineData: number[]) => {\n  const dom = document.getElementById('mnf-chart')\n  if (!dom) return\n  const chart = echarts.init(dom)\n  chart.setOption({", new_init)

content = content.replace("const anomalyZone = ref('未知分区')", "const anomalyZone = ref('未知分区')\n" + script_add)

# Make sure chart container is visible before initChart is called by wrapping it in setTimeout just in case
content = content.replace("nextTick(() => {", "setTimeout(() => {")
content = content.replace("})", "}, 100)")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated mnf.vue chart init")
