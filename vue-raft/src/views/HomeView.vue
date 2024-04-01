<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import axios from "axios"; // 引入axios进行HTTP请求

// 组件注册
import Header from "@/components/Header.vue";
import Aside from "@/components/Aside.vue";

const asideSettings = ref("200"); // 设置默认宽度

const myshard = ref(null);
const refreshInterval = ref(null);
const titles = ref([]); // 初始化titles为空数组
const dataValues = ref([]); // 初始化dataValues为空数组

onMounted(() => {
  fetchDataAndInit(); // 组件挂载后获取数据并初始化图表
  refreshInterval.value = setInterval(fetchDataAndInit, 60000); // 设置定时器，每1分钟执行一次
  // 当组件卸载时清除定时器，避免内存泄漏
});

onBeforeUnmount(() => {
  clearInterval(refreshInterval);
});

async function fetchDataAndInit() {
  titles.value = [];
  dataValues.value = [];
  const promises = [];
  for (let i = 0; i <= 9; i++) {
    promises.push(fetchShardData(i)); // 将每个shard的请求添加到promises数组中
  }
  await Promise.all(promises); // 等待所有请求完成
  init(); // 数据获取完毕后立即初始化图表
}

function fetchShardData(num) {
  // 设置请求超时时间为5000毫秒（5秒）
  const timeout = 5000;

  // 返回一个Promise，它将在超时后被拒绝
  const timeoutPromise = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id); // 清除定时器
      reject(new Error(`Request timed out for shard ${num}`));
    }, timeout);
  });

  // 返回一个Promise，它将尝试从服务器获取数据
  const dataPromise = axios.get(`http://127.0.0.1:8080/GetSize?shard=${num}`);

  // 使用Promise.race来竞争这两个Promise，哪个先完成就采用哪个的结果
  return Promise.race([dataPromise, timeoutPromise])
    .then((response) => {
      const len = response.data.len;
      const shard = `Shard${num}`;
      const value = len;
      if (len != 0) {
        titles.value.push(shard); // 更新titles数组
        dataValues.value.push({ value: value, name: shard }); // 更新dataValues数组
      }
    })
    .catch((error) => {
      console.error(`Error fetching data for shard ${num}:`, error);
      // 如果是超时错误，则跳过该shard
      if (error.message.includes("Request timed out")) {
        console.log(`Skipping shard ${num} due to timeout.`);
      } else {
        // 其他错误类型继续抛出
        throw error;
      }
    });
}

function init() {
  var myChart = echarts.init(myshard.value);
  var option = {
    title: {
      text: "Shard 数据分布",
      left: "center",
    },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
      data: titles.value,
    },
    series: [
      {
        name: "Shard 数据分布",
        type: "pie",
        stillShowZeroSum: false,
        radius: "55%",
        center: ["50%", "60%"],
        data: dataValues.value,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
  myChart.setOption(option);
}
</script>

<template>
  <el-container style="min-height: 100vh; min-width: 100vw; overflow: hidden">
    <Aside :width="asideSettings"></Aside>
    <el-container
      style="height: 100vh; width: 100%; display: flex; flex-direction: column"
    >
      <Header :isCollapse="false" @changeAside="changeAside"></Header>
      <el-main style="flex: 1; overflow-y: auto">
        <div class="content-container">
          <!-- Database System Introduction -->
          <el-card class="intro-card">
            <div class="card-content">
              <h2 class="card-title">分布式数据库系统介绍</h2>
              <p class="card-text">
                本系统是一个基于Raft协议的multi-raft类型的分布式数据库，采用多线程模拟，旨在提供高可用性和强一致性的数据处理能力。
              </p>
              <div class="card-section">
                <h3 class="section-title">模块介绍</h3>
                <ul class="section-list">
                  <li>
                    <strong>ShardControl模块：</strong
                    >负责维护整个数据库的配置信息，确保分片的负载均衡。
                  </li>
                  <li>
                    <strong>ShardKV模块：</strong
                    >由多个group组成，每个group内部都是一个独立的Raft集群，负责接收客户端的读写请求，并通过Raft协议进行数据同步。
                  </li>
                </ul>
              </div>
              <div class="card-section">
                <h3 class="section-title">系统优势</h3>
                <ul class="section-list">
                  <li>
                    高可用性：通过Raft协议，系统能够在节点故障时快速选举新的领导节点，保证服务的连续性。
                  </li>
                  <li>
                    强一致性：所有数据变更都通过Raft协议进行同步，确保了数据的一致性。
                  </li>
                  <li>
                    动态扩展：系统支持动态的分片迁移和负载均衡，可以根据实际负载情况进行优化。
                  </li>
                  <li>
                    易于维护：配置变更由ShardControl模块统一管理，简化了系统维护的复杂性。
                  </li>
                </ul>
              </div>
              <p class="card-text">
                系统适用于需要高并发、高可用性和强一致性要求的分布式应用场景，如在线交易处理、实时数据分析等。通过精心设计的架构和模块化的设计，本系统能够满足现代企业对于数据处理的严苛要求，是构建可靠、高效数据服务平台的理想选择。
              </p>
            </div>
          </el-card>
          <el-card v-if="titles.length > 0" class="chart-card">
            <div
              ref="myshard"
              class="chart-container"
              style="width: 100%; height: 300px"
            ></div>
          </el-card>
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

.content-container {
  padding: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px;
  gap: 20px; /* 添加间隔以避免卡片之间过于紧凑 */
}

.chart-card {
  margin-bottom: 30px;
  flex: 2; /* 增加图表的权重，使其占据更多空间 */
  min-width: 300px; /* 根据需要调整 */
  max-height: 500px; /* 设置最大高度以保持图表的清晰度 */
}

.intro-card {
  background-color: #fff;
  border: none;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  flex: 1;
  max-width: 600px; /* 根据需要调整 */
  margin-right: 20px;
}

.card-content {
  max-width: 800px;
  margin: 0 auto;
}

.card-title {
  color: #333;
  margin-bottom: 20px;
}

.card-section {
  margin-bottom: 20px;
}

.section-title {
  color: #555;
  margin-bottom: 10px;
}

.section-list {
  padding: 0;
  list-style: none;
}

.section-list li {
  margin-bottom: 10px;
  color: #777;
}

.card-text {
  color: #666;
  line-height: 1.6;
}

.content-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px;
}

.chart-container {
  width: 100%;
  height: 100%;
  position: relative; /* 确保子元素可以相对于此容器定位 */
}
</style>
