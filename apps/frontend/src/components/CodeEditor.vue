<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const code = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  if (newVal !== code.value) {
    code.value = newVal;
  }
});

watch(code, (newVal) => {
  emit('update:modelValue', newVal);
});
</script>

<template>
  <div class="h-full flex flex-col font-mono" :class="{ 'opacity-80': readonly }">
    <label class="text-sm text-slate-400 mb-2 flex justify-between items-center">
      <span>Source Code</span>
      <span v-if="readonly" class="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400 uppercase tracking-wider border border-slate-600">Read Only</span>
    </label>
    <textarea
      v-model="code"
      :readonly="readonly"
      class="flex-1 w-full bg-slate-800 text-slate-100 p-4 rounded-lg focus:outline-none font-mono text-sm leading-6 resize-none transition-all"
      :class="readonly ? 'cursor-default border border-transparent' : 'focus:ring-2 focus:ring-blue-500 border border-slate-700'"
      placeholder="// Paste your code here..."
      spellcheck="false"
    ></textarea>
  </div>
</template>
