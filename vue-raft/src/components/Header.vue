<script setup>
import { ref } from 'vue'

import { ElMessage } from 'element-plus';
</script>



<template>
    <div>
        <el-header style="display: flex;font-size: 16px;">
            <div style="display: inline-flex; flex: 1; align-items: center; justify-content: left;">
                <el-icon><Box /></el-icon>
                <span style="color: #303133; font-weight: bold; margin-right: 20px;">Raft ShardKV</span>
            </div>
            <div class="toolbar">
            </div>
        </el-header>
    </div>
</template>


<style scoped>
.el-header {
    width: 100%;
    height: 60px;
    background-color: #fff;
    color: var(--el-text-color-primary);
    box-shadow: var(--el-box-shadow);
}

.toolbar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    right: 20px;
    text-align: right;
}
.icon-color {
    color: white;
}
</style>