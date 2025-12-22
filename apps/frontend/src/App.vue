<script setup lang="ts">
import { ref } from 'vue';
import CodeEditor from './components/CodeEditor.vue';
import ReviewResults from './components/ReviewResults.vue';
import { analyzeCode } from './api/client';
import { AnalyzeResponseDto, ReviewIssue } from '@prism/shared';

const code = ref(`// Example Python code with a security issue
def get_user(user_id):
    query = "SELECT * FROM users WHERE id = " + user_id
    db.execute(query)
`);

const focus = ref<'security' | 'performance' | 'readability'>('security');
const loading = ref(false);
const result = ref<AnalyzeResponseDto | null>(null);

const handleAnalyze = async () => {
  if (!code.value.trim()) return;
  
  loading.value = true;
  result.value = null; // Clear previous result
  
  try {
    result.value = await analyzeCode({
      code: code.value,
      focus: focus.value,
      language: 'python' // Auto-detect for MVP hardcoded or simple heuristic later
    });
  } catch (err) {
    console.error(err);
    alert('Analysis failed. Please try again.');
  } finally {
    loading.value = false;
  }
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
      </div>

      <div class="flex-1 flex justify-end">
        <button 
          @click="handleAnalyze"
          :disabled="loading"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all transform active:scale-95"
        >
          {{ loading ? 'Analyzing...' : 'Run Analysis' }}
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Editor Pane -->
      <div class="flex-1 p-4 border-r border-slate-700 bg-slate-900/50">
        <CodeEditor v-model="code" />
      </div>

      <!-- Results Pane -->
      <div class="flex-1 p-4 bg-slate-950/30">
        <ReviewResults 
          :loading="loading" 
          :score="result?.score ?? null"
          :summary="result?.summary ?? null"
          :issues="result?.issues ?? []"
        />
      </div>
    </main>
  </div>
</template>
