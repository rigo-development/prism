<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const code = ref(props.modelValue);

watch(code, (newVal) => {
  emit('update:modelValue', newVal);
});
</script>

<template>
  <div class="h-full flex flex-col font-mono">
    <label class="text-sm text-slate-400 mb-2">Source Code</label>
    <textarea
      v-model="code"
      class="flex-1 w-full bg-slate-800 text-slate-100 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm leading-6 resize-none"
      placeholder="// Paste your code here..."
      spellcheck="false"
    ></textarea>
  </div>
</template>
