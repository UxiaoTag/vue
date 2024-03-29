<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios";

// 组件注册
import Header from "@/components/Header.vue";
import Aside from "@/components/Aside.vue";

const asideSettings = ref("200"); // 设置默认宽度
const groups = ref([]); // 存储 group 信息
const config = ref(null); // 存储 GetConfig 数据
const leaderData = ref(null); // 存储 GetLeader 数据
const checkAllNodeData = ref(null); //存储CheckAllNode数据

// 新增一个响应式变量来追踪数据更新状态
const dataUpdated = ref(false);

// 获取 MakegidToShards 数据
const fetchMakegidToShards = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8080/MakegidToShards");
    if (response.data) {
      const data = response.data;
      groups.value = Object.keys(data).map((key) => ({
        id: key,
        servers: [],
        shards: data[key],
      }));
    } else {
      // 如果响应数据为 null 或者空对象，设置 groups 为一个空数组
      groups.value = [];
    }
  } catch (error) {
    console.error("获取 MakegidToShards 数据失败:", error);
    // 可以选择在这里重置 groups 为一个空数组
    groups.value = [];
  }
};

// 获取 GetConfig 数据
const fetchGetConfig = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8080/GetConfig");
    const data = response.data;
    for (const group of groups.value) {
      group.servers = data.Groups[group.id];
    }
  } catch (error) {
    console.error("获取 GetConfig 数据失败:", error);
  }
};

// 获取 GetLeader 数据
const fetchGetLeader = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8080/GetLeader");
    leaderData.value = response.data;
  } catch (error) {
    console.error("获取 GetLeader 数据失败:", error);
  }
};

// 获取 CheckAllNode 数据并存储在响应式变量中
const fetchCheckAllNode = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8080/CheckAllNode");
    if (response.data) {
      checkAllNodeData.value = response.data;
    }
  } catch (error) {
    console.error("获取 CheckAllNode 数据失败:", error);
  }
};

// 定义一个 reactive 对象来包裹 groups，以便在数据更新时触发响应式更新
const state = reactive({
  groups: [],
  config: null,
  // ... 其他需要的响应式数据 ...
});

// 刷新数据的方法
const refreshData = async () => {
  try {
    await fetchMakegidToShards();
    await fetchGetConfig();
    await fetchGetLeader();
    await fetchCheckAllNode(); // 添加获取 CheckAllNode 数据的步骤

    // 根据获取到的 leader 数据和 CheckAllNode 数据更新服务器的状态
    groups.value.forEach((group) => {
      group.servers = group.servers.map((serverStr) => {
        const serverObj = {
          name: serverStr,
          isLeader: false,
          isLife: false, // 默认isLife为false
        };
        const groupId = parseInt(group.id);
        const serverIndex = parseInt(serverStr.split("-").pop()); // 获取服务器索引

        // 检查该服务器是否是leader
        const leaderId = leaderData.value[groupId.toString()];
        if (leaderId !== undefined && leaderId === serverIndex) {
          serverObj.isLeader = true;
        }

        // 检查该服务器是否存活
        if (
          checkAllNodeData.value[groupId] &&
          checkAllNodeData.value[groupId][serverIndex.toString()]
        ) {
          serverObj.isLife = true;
        }

        return serverObj;
      });
    });

    // 将 groups 更新为新获取的数据
    state.groups = groups.value;
    // 更新 dataUpdated 的值
    dataUpdated.value = true;
  } catch (error) {
    console.error("Data refresh failed:", error);
  }
};

// 在组件挂载后发送请求
onMounted(() => {
  refreshData();
});
</script>

<template>
  <el-container style="min-height: 100vh; min-width: 100vw; overflow: hidden">
    <Aside :width="asideSettings"></Aside>
    <el-container
      style="height: 100vh; width: 100%; display: flex; flex-direction: column"
    >
      <Header :isCollapse="false" @changeAside="changeAside"></Header>
      <el-main>
        <!-- 操作卡片 -->
        <el-card class="operation-card">
          <el-button circle class="refresh-btn" @click="refreshData">
            <el-icon><RefreshRight /></el-icon>
          </el-button>
        </el-card>
        <div>
          <el-table
            :data="state.groups"
            style="width: 100%"
            v-if="state.groups.length > 0"
          >
            <el-table-column
              prop="id"
              label="Group ID"
              width="180"
            ></el-table-column>
            <el-table-column prop="shards" label="对应 Shard"></el-table-column>
            <!-- 添加展开列 -->
            <el-table-column type="expand">
              <template #default="{ row }">
                <el-table :data="row.servers" style="width: 100%">
                  <el-table-column prop="index" label="序号" width="80">
                    <template #default="{ $index }">
                      <span>{{ $index + 1 }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="server" label="服务器">
                    <template #default="{ row }">
                      <span>{{ row.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="isLeader" label="IsLeader">
                    <template #default="{ row }">
                      <span>{{ row.isLeader ? "True" : "False" }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="isLife" label="IsLife">
                    <template #default="{ row }">
                      <span>{{ row.isLife ? "Alive" : "Timeout" }}</span>
                    </template>
                  </el-table-column>
                  <!-- TODO实现每一个行一个Start和Shutdown按钮，使用Start和Shutdown时读取对应的gourpid和index执行操作，执行完后执行刷新。 -->
                </el-table>
              </template>
            </el-table-column>
          </el-table>
          <!-- 如果 groups 为空或者未定义，则显示暂无数据 -->
          <div v-else-if="dataUpdated">暂无数据</div>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
/* 已有的样式保持不变 */
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

/* 针对 Element Plus 表格组件的样式 */
.el-table {
  overflow-x: hidden; /* 隐藏横向滚动条 */
  overflow-y: auto; /* 保留纵向滚动条 */
  th, td {
    text-overflow: ellipsis; /* 确保文本不会溢出 */
    white-space: nowrap;
  }
}

/* 操作卡片样式调整 */
.operation-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  .el-button {
    margin-right: 10px;
  }
  .refresh-btn {
    background-color: #409eff;
    color: #fff;
    border: none;
  }
}

/* 适应不同屏幕尺寸的样式 */
@media (max-width: 600px) {
  .el-table__body-wrapper {
    overflow-x: auto; /* 允许水平滚动 */
  }
  .el-table__header-wrapper {
    display: none; /* 在小屏幕上隐藏表头 */
  }
  .el-table__row {
    display: flex;
    flex-direction: column;
    align-items: start; /* 项左对齐 */
  }
  .el-table__cell {
    display: block; /* 单元格内容块级显示 */
    padding: 10px 0; /* 增加上下间距 */
  }
  .operation-card {
    flex-direction: column;
    .refresh-btn {
      margin-left: 0;
      margin-top: 10px; /* 调整刷新按钮的上边距 */
    }
  }
}
</style>