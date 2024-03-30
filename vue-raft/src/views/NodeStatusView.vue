<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "axios";

// 组件注册
import Header from "@/components/Header.vue";
import Aside from "@/components/Aside.vue";

const asideSettings = ref("200"); // 设置默认宽度
const groups = ref([]); // 存储 group 信息
const leaderData = ref(null); // 存储 GetLeader 数据
const checkAllNodeData = ref(null); // 存储 CheckAllNode 数据
const dataUpdated = ref(false); // 追踪数据更新状态

// 获取 MakegidToShards 数据
const fetchMakegidToShards = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8080/MakegidToShards");
    if (response.data) {
      groups.value = Object.keys(response.data).map((key) => ({
        id: key,
        servers: [],
        shards: response.data[key],
      }));
    } else {
      groups.value = [];
    }
  } catch (error) {
    console.error("获取 MakegidToShards 数据失败:", error);
    groups.value = [];
  }
};

// 获取 GetConfig 数据
const fetchGetConfig = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8080/GetConfig");
    const data = response.data;
    groups.value.forEach((group) => {
      group.servers = data.Groups[group.id];
    });
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

// 获取 CheckAllNode 数据
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

// 启动服务器的方法
const startServer = async (serverName) => {
  try {
    const [, gid, index] = serverName.split("-");
    const response = await axios.post("http://127.0.0.1:8080/StartOrShutdown", {
      Gid: parseInt(gid),
      Id: parseInt(index),
      Op: "Start",
    });
    console.log(`Server started with Gid: ${gid}, Id: ${index}`);
    refreshData();
  } catch (error) {
    console.error(
      `Failed to start server with Gid: ${gid}, Id: ${index}`,
      error
    );
  }
};

// 关闭服务器的方法
const shutdownServer = async (serverName) => {
  try {
    const [, gid, index] = serverName.split("-");
    const response = await axios.post("http://127.0.0.1:8080/StartOrShutdown", {
      Gid: parseInt(gid),
      Id: parseInt(index),
      Op: "Shutdown",
    });
    console.log(`Server shutdown with Gid: ${gid}, Id: ${index}`);
    refreshData();
  } catch (error) {
    console.error(
      `Failed to shutdown server with Gid: ${gid}, Id: ${index}`,
      error
    );
  }
};

// 刷新数据的方法
const refreshData = async () => {
  try {
    await fetchMakegidToShards();
    await fetchGetConfig();
    await fetchGetLeader();
    await fetchCheckAllNode();

    groups.value.forEach((group) => {
      group.servers = group.servers.map((serverStr) => {
        const serverObj = {
          name: serverStr,
          isLeader: false,
          isLife: false,
        };
        const groupId = parseInt(group.id);
        const serverIndex = parseInt(serverStr.split("-").pop());

        const leaderId = leaderData.value[groupId.toString()];
        if (leaderId !== undefined && leaderId === serverIndex) {
          serverObj.isLeader = true;
        }

        if (
          checkAllNodeData.value[groupId] &&
          checkAllNodeData.value[groupId][serverIndex.toString()]
        ) {
          serverObj.isLife = true;
        }

        return serverObj;
      });
    });

    state.groups = groups.value;
    dataUpdated.value = true;
  } catch (error) {
    console.error("Data refresh failed:", error);
  }
};

// 在组件挂载后发送请求
onMounted(() => {
  refreshData();
});

const state = reactive({
  groups: [],
  config: null,
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
        <el-card class="operation-card">
          <el-button circle class="refresh-btn" type="primary" @click="refreshData">
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
            <el-table-column type="expand">
              <template #default="{ row }">
                <el-table :data="row.servers" style="width: 100%">
                  <el-table-column prop="name" label="服务器" width="180">
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
                  <el-table-column label="Actions" width="220">
                    <template #default="{ row }">
                      <el-button size="mini" type="success" @click="startServer(row.name)"
                        >Start</el-button
                      >
                      <el-button size="mini" type="danger" @click="shutdownServer(row.name)"
                        >Shutdown</el-button
                      >
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </el-table-column>
          </el-table>
          <div v-else-if="dataUpdated">暂无数据</div>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
body {
  background-color: #f5f5f5;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  color: #333;
  line-height: 1.6;
  overflow: hidden;
}

.el-table {
  th,
  td {
    text-align: center;
  }
  .el-button {
    padding: 5px 10px;
  }

  .refresh-btn {
    background-color: #409eff;
    color: #fff;
    border: none;
  }

  .operation-card .el-button {
    margin-bottom: 10px;
  }
}

@media (max-width: 600px) {
  .el-table__body-wrapper {
    overflow-x: auto;
  }
}
</style>
