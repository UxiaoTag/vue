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
          <!-- TODO制作GET/PUT/APPEND输入框以及逻辑 -->
        </div>
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
}
</style>