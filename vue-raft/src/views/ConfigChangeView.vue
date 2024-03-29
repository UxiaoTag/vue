<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios"; // 引入axios用于HTTP请求

// 组件注册
import Header from "@/components/Header.vue";
import Aside from "@/components/Aside.vue";

const asideSettings = ref("200"); // 设置默认宽度
const groups = ref([]); // 存储 group 信息
const config = ref(null); // 存储 GetConfig 数据

// 新增一个响应式变量来追踪数据更新状态
const dataUpdated = ref(false);
// 新增响应式数据
const selectedGroup = ref("");

const groupOptions = ref([
  { label: "Group 100", value: "100" },
  { label: "Group 101", value: "101" },
  { label: "Group 102", value: "102" },
]);

const joinGroup = async () => {
  if (selectedGroup.value) {
    const requestBody = {
      Num: parseInt(selectedGroup.value) - 100,
      Op: "Join",
    };
    try {
      await axios.post("http://127.0.0.1:8080/JoinOrLeave", requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      refreshData();
      // 当数据刷新后，更新 dataUpdated 的值
      dataUpdated.value = true;
    } catch (error) {
      console.error("Join request failed:", error);
      // 可以在这里添加错误处理逻辑
    }
  }
};

const leaveGroup = async () => {
  if (selectedGroup.value) {
    const requestBody = {
      Num: parseInt(selectedGroup.value) - 100,
      Op: "Leave",
    };
    try {
      await axios.post("http://127.0.0.1:8080/JoinOrLeave", requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      refreshData();
      // 当数据刷新后，更新 dataUpdated 的值
      dataUpdated.value = true;
    } catch (error) {
      console.error("Leave request failed:", error);
      // 可以在这里添加错误处理逻辑
    }
  }
};

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
    // 将 groups 和 config 更新为新获取的数据
    state.groups = groups.value;
    state.config = config.value;
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
          <!-- 选择器 -->
          <el-select
            v-model="selectedGroup"
            clearable
            placeholder="选择 Group"
            style="width: 240px; margin-left: 10px"
          >
            <el-option
              v-for="item in groupOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <!-- join 和 leave 按钮 -->
          <el-button @click="joinGroup" type="success">Join</el-button>
          <el-button @click="leaveGroup" type="danger">Leave</el-button>
          <!-- 刷新按钮 -->
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
                      <span>{{ row }}</span>
                    </template>
                  </el-table-column>
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
}
/* 针对 Element Plus 表格组件的样式 */
.el-table {
  overflow-x: hidden; /* 隐藏横向滚动条 */
  overflow-y: auto; /* 保留纵向滚动条 */
}

.custom-main {
  padding: 20px;
  flex: 1;
}

.box-card {
  margin-bottom: 20px;
}

.title {
  margin-bottom: 10px;
}

.servers {
  margin-left: 20px;
}

.server-list {
  margin-top: -10px; /* 调整上边距，确保内容与表头对齐 */
}

.server-list div {
  margin-bottom: 5px; /* 调整每行服务器信息的下边距 */
}

.operation-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.buttons-wrapper .el-button {
  margin-right: 10px;
}

.refresh-btn {
  background-color: #409eff;
  color: #fff;
  border: none;
}

.buttons-wrapper {
  display: flex;
}

.operation-card .el-button {
  margin-left: 10px;
}

.data-table {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
