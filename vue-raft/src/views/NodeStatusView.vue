<script setup>
import { ref } from 'vue';

// 组件注册
import Header from '@/components/Header.vue';
import Aside from '@/components/Aside.vue';


const asideSettings = ref('200'); // 设置默认宽度

</script>

<template>
  <el-container style="min-height: 100vh; min-width: 100vw; overflow: hidden;">
    <Aside :width="asideSettings"></Aside>
    <el-container style="height: 100vh; width: 100%; display: flex; flex-direction: column;">
      <Header :isCollapse="false" @changeAside="changeAside"></Header>
      <el-main>
        <div>
          <!-- TODO通过GetConfig得到当前配置后，进行根据获取的group制作n个card，里面通过列表的方式记录每个节点IsLeader和Islife -->
          <!-- 右边制作按钮，启停 -->
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
body {
  background-color: #eee;
  max-width: 100vw;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif; /* 现代 sans-serif 字体 */
  color: #333; /* 文字颜色 */
  line-height: 1.6; /* 行高 */
  overflow: hidden;
}

.el-main {
  width: 100%;
  padding: 0;
  height: 100vh;
  overflow-x: hidden;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  flex-wrap: wrap; /* 允许换行 */
}
</style>