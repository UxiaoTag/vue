<script setup>
import {ref,watch, onMounted } from 'vue'
import {ElAside, ElScrollbar, ElMenu}from 'element-plus'
import { useRouter } from 'vue-router'

const settings = {
  width: 400
};

const router = useRouter();
const activeIndex = ref('/home'); // 默认激活的菜单项索引


// 为每个 el-menu-item 设置 ref
const menuItemHome = ref(null);
const menuItemClient = ref(null);
const menuItemConfigChange = ref(null);
const menuItemNodeStatus = ref(null);


//watch检测到router变化，读取当前router，然后赋值activeIndex，由el-menu属性进行default-active="activeIndex"
watch(
  () => router.currentRoute.value,
  (newRoute) => {
    activeIndex.value = newRoute.path;
  },
  { immediate: true }
);



</script>
<template>
    <!-- <el-aside :width="settings.width"> -->
    <el-aside style="width: 200px;">
        <el-scrollbar>
            <el-menu :default-active="activeIndex" active-text-color="#F8FAFB" background-color="#1A1C1E" text-color="#74767A" router="true">
                <el-menu-item ref="menuItemHome" index="/home">
                    <template #title>
                        <el-icon><House /></el-icon><span>首页</span>
                    </template>
                </el-menu-item>
                <el-menu-item ref="menuItemClient" index="/client">
                    <template #title>
                        <el-icon><User /></el-icon><span>数据库操作</span>
                    </template>
                </el-menu-item>
                <el-menu-item ref="menuItemConfigChange" index="/configChange">
                    <template #title>
                        <el-icon><Tickets /></el-icon><span>配置变更</span>
                    </template>
                </el-menu-item>
                <el-menu-item ref="menuItemNodeStatus" index="/nodeStatus">
                    <template #title>
                        <el-icon><Location /></el-icon><span>节点状态</span>
                    </template>
                </el-menu-item>
            </el-menu>
        </el-scrollbar>
    </el-aside>
</template>

<style scoped>
.el-aside {
  height: 100vh;
  overflow: hidden;
  box-shadow: var(--el-box-shadow-lighter);
}

.el-scrollbar {
  height: 100vh;
  overflow: hidden;
  background-color: #1A1C1E;
}

.el-menu {
  border-right: none;
}
.el-menu-item {
  font-size: 18px; /* 增加字体大小 */
  height: 70px; /* 增加高度 */
  line-height: 50px; /* 调整行高以垂直居中文本 */
  padding: 0 20px; /* 调整内边距 */
}
/* 定义激活状态的样式 */
.el-menu-item.is-active {
  color: #303133; /* 设置文本颜色为深色 */
  background-color: #f5f5f5; /* 设置背景颜色为灰色 */
}
</style>