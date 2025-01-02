<template>
  <Editor v-model="state" />
</template>

<script setup>
import { ref, provide } from "vue";
import data from "@/data.json";
import Editor from "@/packages/editor";
const state = ref(data);
import { registerConfig as config } from "@/utils/editor-config.jsx";

provide("config", config);
</script>

<style lang="scss">
#app {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
}
</style>
