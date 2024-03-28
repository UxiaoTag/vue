<script setup>
import { ref, watch } from "vue";
import axios from "axios"; // 引入axios用于HTTP请求

// 组件注册
import Header from "@/components/Header.vue";
import Aside from "@/components/Aside.vue";

const asideSettings = ref("200"); // 设置默认宽度
const getkey = ref("");
const putkey = ref("");
const putvalue = ref("");
const appendkey = ref("");
const appendvalue = ref("");

// GET 请求的响应
const getResponse = ref(null);

// PUT 请求的响应
const putResponse = ref(null);

// APPEND 请求响应
const appendResponse = ref(null); 

// 重置响应变量
const resetResponse = (response) => {
  response.value = null;
};

const sendAppendApi = async () => {
  resetResponse(appendResponse); // 重置响应
  if (appendkey.value && appendvalue.value) {
    try {
      // 构建请求体
      const requestBody = {
        Key: appendkey.value,
        Value: appendvalue.value,
        Op: "Append",
      };

      // 发送 POST 请求
      const { data } = await axios.post(
        "http://127.0.0.1:8080/PutOrAppend",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(data);
      appendResponse.value = data; // 更新 Append 响应对象
    } catch (error) {
      console.error("Append请求失败:", error);
      appendResponse.value = { error: "请求失败" }; // 更新 Append 响应对象为错误信息
    }
  } else {
    appendResponse.value = { error: "请输入完整的Key和Value" };
  }
};

const sendPutApi = async () => {
  resetResponse(putResponse); // 重置响应
  if (putkey.value && putvalue.value) {
    // 确保 both key and value are provided
    try {
      // 构建请求体
      const requestBody = {
        Key: putkey.value,
        Value: putvalue.value,
        Op: "Put",
      };

      // 发送 POST 请求
      const { data } = await axios.post(
        "http://127.0.0.1:8080/PutOrAppend",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json", // 设置请求头，指明发送的是 JSON 格式数据
          },
        }
      );

      console.log(data);
      putResponse.value = data; // 更新 response 对象
    } catch (error) {
      console.error("请求失败:", error);
      putResponse.value = { error: "请求失败" }; // 更新 response 对象为错误信息
    }
  } else {
    // 提示用户输入完整的数据
    response.value = { error: "请输入完整的Key和Value" };
  }
};

const sendGetApi = async () => {
  resetResponse(getResponse); // 重置响应
  if (getkey.value) {
    try {
      const { data } = await axios.get("http://127.0.0.1:8080/Get", {
        params: {
          key: getkey.value,
        },
      });
      // 假设后端返回的数据格式为 { key: 'yourKey', value: 'yourValue', Shard: 'shardValue' }
      console.log(data);
      getResponse.value = data; // 更新response对象
    } catch (error) {
      console.error("请求失败:", error);
      getResponse.value = { error: "请求失败" }; // 更新response对象为错误信息
    }
  }
  return { message: "请输入有效的key" };
};
</script>

<template>
  <el-container style="min-height: 100vh; min-width: 100vw; overflow: hidden">
    <Aside :width="asideSettings"></Aside>
    <el-container
      style="height: 100vh; width: 100%; display: flex; flex-direction: column"
    >
      <Header :isCollapse="false" @changeAside="changeAside"></Header>
      <el-main>
        <div>
          <!-- GET -->
          <el-card class="box-card">
            <h2 class="title">Get</h2>
            <div class="form-group">
              <label for="keyInput">Key:</label>
              <el-input
                id="keyInput"
                placeholder="请输入你的key"
                style="width: 240px; margin-left: 10px"
                v-model="getkey"
                clearable
              ></el-input>
              <el-button style="margin-left: 10px" @click="sendGetApi"
                >Get</el-button
              >
            </div>
            <div
              v-if="getResponse && !getResponse.error"
              class="response-group"
            >
              <p>Key: {{ getResponse.key }}</p>
              <p>Value: {{ getResponse.value }}</p>
              <p>Shard: {{ getResponse.Shard }}</p>
            </div>
            <div v-if="getResponse && getResponse.error" class="error-group">
              <p>Error: {{ getResponse.error }}</p>
            </div>
          </el-card>
          <!-- PUT -->
          <el-card class="box-card">
            <h2 class="title">Put</h2>
            <div class="form-group">
              <label for="keyInput">Key:</label>
              <el-input
                id="keyInput"
                placeholder="请输入你的key"
                style="width: 240px; margin-left: 10px"
                v-model="putkey"
                clearable
              ></el-input>
              <el-input
                id="valueInput"
                placeholder="请输入你的value"
                style="width: 240px; margin-left: 10px"
                v-model="putvalue"
                clearable
              ></el-input>
              <el-button style="margin-left: 10px" @click="sendPutApi"
                >Put</el-button
              >
            </div>
            <div
              v-if="putResponse && !putResponse.error"
              class="response-group"
            >
              <el-alert title="Put成功" type="success"></el-alert>
              <!-- 这里不再显示具体的响应数据，因为我们已经有了成功的提示 -->
            </div>
            <div v-if="putResponse && putResponse.error" class="error-group">
              <p>Error: {{ putResponse.error }}</p>
            </div>
          </el-card>
          <!-- Append -->
          <el-card class="box-card">
            <h2 class="title">Append</h2>
            <div class="form-group">
              <label for="keyInput">Key:</label>
              <el-input
                id="keyInput"
                placeholder="请输入你的key"
                style="width: 240px; margin-left: 10px"
                v-model="appendkey"
                clearable
              ></el-input>
              <el-input
                id="valueInput"
                placeholder="请输入你的value"
                style="width: 240px; margin-left: 10px"
                v-model="appendvalue"
                clearable
              ></el-input>
              <el-button style="margin-left: 10px" @click="sendAppendApi"
                >Append</el-button
              >
            </div>
            <div
              v-if="appendResponse && !appendResponse.error"
              class="response-group"
            >
              <el-alert title="Append成功" type="success"></el-alert>
              <!-- 这里不再显示具体的响应数据，因为我们已经有了成功的提示 -->
            </div>
            <div v-if="appendResponse && appendResponse.error" class="error-group">
              <p>Error: {{ appendResponse.error }}</p>
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
/* 基础样式 */
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

/* 卡片样式 */
.box-card {
  width: 100%;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff; /* 白色背景 */
  border-radius: 8px; /* 圆角边框 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  transition: box-shadow 0.3s ease; /* 过渡效果 */
}

/* 鼠标悬停时的卡片效果 */
.box-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* 表单组样式 */
.form-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px; /* 增加间距 */
}

.form-group label {
  flex-shrink: 0; /* 不允许缩小 */
  margin-right: 10px;
  font-weight: 500; /* 半粗体 */
}

.form-group .el-input {
  flex-grow: 1;
  margin-right: 10px;
}

/* 响应和错误信息样式 */
.response-group p,
.error-group p {
  margin: 5px 0;
  font-size: 0.9rem; /* 略小的字体大小 */
}

.error-group {
  color: #f56c6c; /* 错误信息颜色 */
}

/* 成功提示样式 */
.response-group {
  color: #67c23a; /* 成功信息颜色 */
}

/* 标题样式 */
.title {
  margin-left: 0; /* 移除左边距 */
  margin-bottom: 15px;
  font-size: 1.25rem; /* 大标题 */
  font-weight: 600; /* 半粗体 */
}

/* 按钮样式 */
.el-button {
  padding: 10px 20px;
  font-size: 0.875rem; /* 按钮字体大小 */
  border-radius: 4px; /* 圆角按钮 */
  cursor: pointer; /* 鼠标手势 */
}

/* 输入框样式 */
.el-input__inner {
  padding: 10px 15px;
  border-radius: 4px;
  border: 1px solid #dcdfe6; /* 输入框边框 */
}

/* 错误信息样式 */
.error-group {
  background-color: #fef0f0; /* 浅红色背景 */
  border-left: 4px solid #f56c6c; /* 错误提示边框 */
  padding-left: 15px; /* 左边距 */
}
</style>