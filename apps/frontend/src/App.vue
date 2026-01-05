<script setup lang="ts">
import { onMounted, ref } from 'vue';
import CodeEditor from './components/CodeEditor.vue';
import ReviewResults from './components/ReviewResults.vue';
import ReviewHistory from './components/ReviewHistory.vue';
import { analyzeCode, fetchModels, fetchHistory, clearHistory } from './api/client';

const code = ref(`// Example Python code with a security issue
def get_user(user_id):
    query = "SELECT * FROM users WHERE id = " + user_id
    db.execute(query)
`);

const focus = ref<'security' | 'performance' | 'readability'>('security');
const loading = ref(false);
const historyLoading = ref(false);
const result = ref<any>(null); // Use any or updated DTO
const models = ref<string[]>([]);
const history = ref<any[]>([]);
const selectedModel = ref<string>('');
const showHistory = ref(true);
const isHistoryMode = ref(false);

const loadHistory = async () => {
  historyLoading.value = true;
  try {
    history.value = await fetchHistory();
  } catch (err) {
    console.error('Failed to load history', err);
  } finally {
    historyLoading.value = false;
  }
};

const startNewReview = () => {
  code.value = `// Paste your code here...`;
  result.value = null;
  isHistoryMode.value = false;
};

onMounted(async () => {
  try {
    const [modelsData] = await Promise.all([
      fetchModels(),
      loadHistory()
    ]);
    models.value = modelsData;
    if (models.value.length > 0) {
      selectedModel.value = models.value[0];
    }
  } catch (err) {
    console.error('Failed to load initial data', err);
  }
});

const handleAnalyze = async () => {
  if (!code.value.trim()) return;
  
  loading.value = true;
  result.value = null; 
  isHistoryMode.value = false;
  
  try {
    const response = await analyzeCode({
      code: code.value,
      focus: focus.value,
      model: selectedModel.value
    });
    
    result.value = response;
    // Refresh history after a new analysis
    await loadHistory();
  } catch (err) {
    console.error(err);
    alert('Analysis failed. Please try again.');
  } finally {
    loading.value = false;
  }
};

const handleClearHistory = async () => {
  if (!confirm('Are you sure you want to clear your local history?')) return;
  try {
    await clearHistory();
    history.value = [];
  } catch (err) {
    console.error('Failed to clear history', err);
  }
};

const handleHistorySelect = (item: any) => {
  code.value = item.code;
  focus.value = item.focus;
  isHistoryMode.value = true;
  // Restore the full result preview
  result.value = {
    reviewId: item.id,
    summary: item.summary,
    score: item.score,
    issues: item.issues || [],
    detectedLanguage: item.detectedLanguage || item.language
  };
};

</script>

<template>
  <div class="h-screen w-screen bg-slate-900 text-white flex flex-col overflow-hidden">
    <!-- Navbar -->
    <header class="h-16 border-b border-slate-700 flex items-center px-6 bg-slate-900 z-10">
      <div class="flex items-center space-x-2 mr-8">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg">
          P
        </div>
        <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Prism
        </h1>
      </div>

      <div class="flex-1 max-w-xl flex items-center space-x-4">
        <button 
          @click="showHistory = !showHistory" 
          class="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors mr-2"
          :class="{ 'bg-blue-600 border-blue-500': showHistory }"
          title="Toggle History"
        >
          🕒
        </button>

        <div class="flex items-center space-x-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button 
            v-for="f in ['security', 'performance', 'readability']" 
            :key="f"
            @click="focus = f as any"
            class="px-3 py-1.5 rounded-md text-sm font-medium transition-all"
            :class="focus === f ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
          >
            {{ f.charAt(0).toUpperCase() + f.slice(1) }}
          </button>
        </div>

        <!-- Model Selector -->
        <div class="flex items-center space-x-2">
          <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model</label>
          <div class="relative">
            <select 
              v-model="selectedModel"
              class="appearance-none bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-10 py-1.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer hover:bg-slate-700 active:bg-slate-600"
            >
              <option v-for="m in models" :key="m" :value="m">{{ m }}</option>
            </select>
            <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>


      <div class="flex-1 flex justify-end items-center space-x-3">
        <button 
          v-if="isHistoryMode"
          @click="startNewReview"
          class="text-slate-400 hover:text-white text-sm font-medium transition-colors"
        >
          New Analysis
        </button>
        <button 
          @click="handleAnalyze"
          :disabled="loading"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all transform active:scale-95"
        >
          {{ loading ? 'Analyzing...' : isHistoryMode ? 'Re-run Analysis' : 'Run Analysis' }}
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- History Pane -->
      <transition 
        enter-active-class="transition-[width] duration-300 ease-in-out"
        leave-active-class="transition-[width] duration-300 ease-in-out"
      >
        <div 
          v-if="showHistory" 
          class="w-72 border-r border-slate-700 bg-slate-900 shadow-xl z-10"
        >
          <ReviewHistory 
            :history="history" 
            :loading="historyLoading"
            @select="handleHistorySelect"
            @clear="handleClearHistory"
          />
        </div>
      </transition>

      <!-- Editor Pane -->
      <div class="flex-1 p-4 border-r border-slate-700 bg-slate-900/50">
        <CodeEditor v-model="code" :readonly="isHistoryMode" />
      </div>

      <!-- Results Pane -->
      <div class="flex-1 p-4 bg-slate-950/30">
        <ReviewResults 
          :loading="loading" 
          :score="result?.score ?? null"
          :summary="result?.summary ?? null"
          :issues="result?.issues ?? []"
          :detectedLanguage="result?.detectedLanguage ?? null"
        />
      </div>
    </main>
  </div>
</template>
