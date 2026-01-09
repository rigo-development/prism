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

// Mobile state management
const mobileMenuOpen = ref(false);
const mobileActivePanel = ref<'editor' | 'results'>('editor');
const isMobile = ref(false);

// Check if mobile on mount and resize
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    showHistory.value = true;
    mobileMenuOpen.value = false;
  } else {
    showHistory.value = false;
  }
};

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
  if (isMobile.value) {
    mobileActivePanel.value = 'editor';
  }
};

onMounted(async () => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
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
    
    // Switch to results panel on mobile after analysis
    if (isMobile.value) {
      mobileActivePanel.value = 'results';
    }
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
  
  // Close history panel on mobile and show results
  if (isMobile.value) {
    showHistory.value = false;
    mobileActivePanel.value = 'results';
  }
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const toggleHistoryPanel = () => {
  showHistory.value = !showHistory.value;
  if (isMobile.value && showHistory.value) {
    mobileMenuOpen.value = false;
  }
};

</script>

<template>
  <div class="h-screen w-screen bg-slate-900 text-white flex flex-col overflow-hidden">
    <!-- Navbar -->
    <header class="h-14 md:h-16 border-b border-slate-700 flex items-center px-3 md:px-6 bg-slate-900 z-20 safe-top">
      <!-- Mobile Menu Button -->
      <button 
        @click="toggleMobileMenu"
        class="md:hidden tap-target p-2 mr-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors no-select"
        :class="{ 'bg-blue-600 border-blue-500': mobileMenuOpen }"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" v-if="!mobileMenuOpen"></line>
          <line x1="3" y1="6" x2="21" y2="6" v-if="!mobileMenuOpen"></line>
          <line x1="3" y1="18" x2="21" y2="18" v-if="!mobileMenuOpen"></line>
          <line x1="18" y1="6" x2="6" y2="18" v-if="mobileMenuOpen"></line>
          <line x1="6" y1="6" x2="18" y2="18" v-if="mobileMenuOpen"></line>
        </svg>
      </button>

      <!-- Logo -->
      <div class="flex items-center space-x-2 mr-2 md:mr-8">
        <div class="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-base md:text-lg">
          P
        </div>
        <h1 class="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Prism
        </h1>
      </div>

      <!-- Desktop Controls -->
      <div class="hidden md:flex flex-1 max-w-xl items-center space-x-4">
        <button 
          @click="toggleHistoryPanel" 
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

      <!-- Action Buttons -->
      <div class="flex-1 md:flex-none flex justify-end items-center space-x-2 md:space-x-3">
        <button 
          v-if="isHistoryMode && !isMobile"
          @click="startNewReview"
          class="hidden md:block text-slate-400 hover:text-white text-sm font-medium transition-colors"
        >
          New Analysis
        </button>
        <button 
          @click="handleAnalyze"
          :disabled="loading"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 md:px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all transform active:scale-95 text-sm md:text-base"
        >
          <span class="hidden md:inline">{{ loading ? 'Analyzing...' : isHistoryMode ? 'Re-run Analysis' : 'Run Analysis' }}</span>
          <span class="md:hidden">{{ loading ? '...' : '▶' }}</span>
        </button>
      </div>
    </header>

    <!-- Mobile Dropdown Menu -->
    <transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 -translate-y-2"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div 
        v-if="mobileMenuOpen && isMobile"
        class="md:hidden bg-slate-800 border-b border-slate-700 p-3 space-y-3 z-10"
      >
        <!-- Focus Selector -->
        <div>
          <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Focus</label>
          <div class="grid grid-cols-3 gap-2">
            <button 
              v-for="f in ['security', 'performance', 'readability']" 
              :key="f"
              @click="focus = f as any"
              class="tap-target px-3 py-2 rounded-lg text-sm font-medium transition-all"
              :class="focus === f ? 'bg-slate-700 text-white shadow-sm border border-slate-600' : 'bg-slate-900 text-slate-400 border border-slate-700'"
            >
              {{ f.charAt(0).toUpperCase() + f.slice(1) }}
            </button>
          </div>
        </div>

        <!-- Model Selector -->
        <div>
          <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Model</label>
          <select 
            v-model="selectedModel"
            class="w-full appearance-none bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option v-for="m in models" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>

        <!-- History Toggle -->
        <button 
          @click="toggleHistoryPanel"
          class="w-full tap-target flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all"
          :class="showHistory ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-300'"
        >
          <span class="flex items-center space-x-2">
            <span>🕒</span>
            <span class="font-medium">History</span>
          </span>
          <span class="text-xs">{{ showHistory ? 'Hide' : 'Show' }}</span>
        </button>

        <!-- New Analysis (mobile) -->
        <button 
          v-if="isHistoryMode"
          @click="startNewReview"
          class="w-full tap-target px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-medium transition-all hover:bg-slate-800"
        >
          New Analysis
        </button>
      </div>
    </transition>

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- History Pane (Desktop & Mobile Overlay) -->
      <transition 
        enter-active-class="transition-transform duration-300 ease-in-out"
        leave-active-class="transition-transform duration-300 ease-in-out"
        enter-from-class="-translate-x-full"
        leave-to-class="-translate-x-full"
      >
        <div 
          v-if="showHistory" 
          class="w-72 md:w-72 border-r border-slate-700 bg-slate-900 shadow-xl"
          :class="isMobile ? 'absolute inset-y-0 left-0 z-30' : 'relative z-10'"
        >
          <ReviewHistory 
            :history="history" 
            :loading="historyLoading"
            :is-mobile="isMobile"
            @select="handleHistorySelect"
            @clear="handleClearHistory"
            @close="toggleHistoryPanel"
          />
        </div>
      </transition>

      <!-- Mobile: Tabbed View (Editor/Results) -->
      <div v-if="isMobile" class="flex-1 flex flex-col overflow-hidden">
        <!-- Mobile Tab Bar -->
        <div class="flex border-b border-slate-700 bg-slate-900">
          <button 
            @click="mobileActivePanel = 'editor'"
            class="flex-1 tap-target py-3 text-sm font-medium transition-all relative"
            :class="mobileActivePanel === 'editor' ? 'text-blue-400' : 'text-slate-400'"
          >
            Code Editor
            <div 
              v-if="mobileActivePanel === 'editor'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
            ></div>
          </button>
          <button 
            @click="mobileActivePanel = 'results'"
            class="flex-1 tap-target py-3 text-sm font-medium transition-all relative"
            :class="mobileActivePanel === 'results' ? 'text-blue-400' : 'text-slate-400'"
          >
            Results
            <div 
              v-if="mobileActivePanel === 'results'"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
            ></div>
          </button>
        </div>

        <!-- Mobile Panel Content -->
        <div class="flex-1 overflow-hidden">
          <div v-show="mobileActivePanel === 'editor'" class="h-full p-3 bg-slate-900/50">
            <CodeEditor v-model="code" :readonly="isHistoryMode" />
          </div>
          <div v-show="mobileActivePanel === 'results'" class="h-full p-3 bg-slate-950/30">
            <ReviewResults 
              :loading="loading" 
              :score="result?.score ?? null"
              :summary="result?.summary ?? null"
              :issues="result?.issues ?? []"
              :detectedLanguage="result?.detectedLanguage ?? null"
            />
          </div>
        </div>
      </div>

      <!-- Desktop: Side-by-Side View -->
      <template v-else>
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
      </template>
    </main>
  </div>
</template>
