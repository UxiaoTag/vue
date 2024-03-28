import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      // 代理配置对象
      "/PutOrAppend": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        pathRewrite: { "^/PutOrAppend": "" },
      },
      "/Get": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        pathRewrite: { "^/Get": "" },
      },
      "/GetConfig": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        pathRewrite: { "^/GetConfig": "" },
      },
      "/JoinOrLeave": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        pathRewrite: { "^/JoinOrLeave": "" },
      },
      "/CheckNode": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        pathRewrite: { "^/CheckNode": "" },
      },
      "/StartOrShutdown": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        pathRewrite: { "^/StartOrShutdown": "" },
      },
      "/GetLeader": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        pathRewrite: { "^/GetLeader": "" },
      },
      "/MakegidToShards": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        pathRewrite: { "^/MakegidToShards": "" },
      },
      "/GetAll": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        pathRewrite: { "^/GetAll": "" },
      },
      // ... 其他代理配置
    },
  },
});
