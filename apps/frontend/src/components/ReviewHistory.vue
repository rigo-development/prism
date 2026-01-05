<script setup lang="ts">
// defineProps and defineEmits are compiler macros and don't need to be imported in <script setup>

interface HistoryItem {
  id: string;
  code: string;
  language: string;
  focus: string;
  summary: string;
  score: number;
  createdAt: string;
}

const props = defineProps<{
  history: HistoryItem[];
  loading: boolean;
}>();

const emit = defineEmits(['select', 'clear']);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
};
</script>

<template>
  <div class="flex flex-col h-full bg-slate-900 overflow-hidden">
    <div class="p-4 border-b border-slate-700 flex items-center justify-between">
      <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
        <span class="mr-2">🕒</span> History
      </h2>
      <button 
        v-if="history.length > 0"
        @click="emit('clear')"
        class="text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-tighter"
      >
        Clear All
      </button>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
      <div v-if="loading && history.length === 0" class="flex justify-center p-8">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else-if="history.length === 0" class="p-8 text-center text-slate-500 text-sm italic">
        No recent activity
      </div>

      <div v-else class="space-y-2">
        <button 
          v-for="item in history" 
          :key="item.id"
          @click="emit('select', item)"
          class="w-full text-left p-3 rounded-lg border border-transparent hover:border-slate-700 hover:bg-slate-800 transition-all group relative overflow-hidden"
        >
          <div class="flex justify-between items-start mb-1">
            <span class="text-xs font-bold text-blue-400 uppercase tracking-tighter">{{ item.focus }}</span>
            <span class="text-[10px] text-slate-500">{{ formatDate(item.createdAt) }}</span>
          </div>
          
          <div class="text-sm font-medium text-slate-200 line-clamp-1 mb-1">
            {{ item.summary }}
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {{ item.language }}
            </span>
            <span :class="['text-xs font-bold', getScoreColor(item.score)]">
              {{ item.score }}%
            </span>
          </div>

          <!-- Hover accent -->
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
