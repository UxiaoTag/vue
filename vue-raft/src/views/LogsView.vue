<script setup>
import { ref,onMounted, onUnmounted } from 'vue';
import axios from 'axios';

// 组件注册
import Header from '@/components/Header.vue';
import Aside from '@/components/Aside.vue';


const asideSettings = ref('200'); // 设置默认宽度
const logs = ref([]); // 用于存储获取到的日志数据
const lastLineContent = ref(''); // 用于记录最后一条日志内容


// 获取日志
const fetchLogs = async () => {
  try {
    const response = await axios.post('http://127.0.0.1:8080/GetLogs', {
      lastLineContent: lastLineContent.value,
    });
    
    if (response.data.log_list.length > 0) {
      // 更新日志数组，只添加新的日志行
      logs.value = [...logs.value, ...response.data.log_list];
      // 更新lastLineContent为最后一条新日志的内容
      lastLineContent.value = response.data.log_list[response.data.log_list.length - 1];
    }
  } catch (error) {
    console.error('Error fetching logs:', error);
  }
};

// 组件挂载时启动定时器
let intervalId;
onMounted(() => {
  intervalId = setInterval(fetchLogs, 1000); // 每秒执行一次fetchLogs
});

// 组件卸载时清除定时器
onUnmounted(() => {
  clearInterval(intervalId);
});

</script>

<template>
  <el-container style="min-height: 100vh; min-width: 100vw; overflow: hidden;">
    <Aside :width="asideSettings"></Aside>
    <el-container style="height: 100vh; width: 100%; display: flex; flex-direction: column;">
      <Header :isCollapse="false" @changeAside="changeAside"></Header>
 <el-main style="flex-grow: 1; overflow-y: auto;">
        <el-table :data="logs" style="width: 100%">
          <el-table-column prop="content" label="Content">
            <template #default="{ row }">
              <pre>{{ row }}</pre>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
body {
  background-color: #eee;
  max-width: 100vw;
  overflow: hidden;
}

.el-main {
  width: 100%;
  padding: 0;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto; /* 添加垂直滚动条 */
}
.log-card {
  /* 限制卡片的宽度，可以根据需要调整 */
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.log-content {
  /* 终端风格的样式 */
  font-family: monospace;
  white-space: pre-wrap;
  color: #00ff00; /* 终端中的文字颜色，可以根据需要调整 */
  background-color: #000; /* 终端的背景颜色 */
  padding: 10px;
  margin: 0;
}
</style>