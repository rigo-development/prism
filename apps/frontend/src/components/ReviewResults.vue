<script setup lang="ts">
import { ReviewIssue } from '@prism/shared'; // It might fail if shared isn't built or symlinked correctly in node_modules, but let's try.
// If shared is not directly importable in frontend due to module resolution, I will map the type locally or ensure vite config aliases it.
// Actually, vite config doesn't have alias for @prism/shared yet. I should add it.

interface Props {
  loading: boolean;
  score: number | null;
  summary: string | null;
  issues: ReviewIssue[];
  detectedLanguage?: string | null;
}

defineProps<Props>();
</script>

<template>
  <div class="h-full flex flex-col bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
    <div v-if="loading" class="flex-1 flex items-center justify-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="score !== null" class="flex flex-col h-full">
      <!-- Header -->
      <div class="p-6 border-b border-slate-700 bg-slate-800/50">
        <div class="flex items-center justify-between mb-4">
          <div class="flex flex-col">
            <h2 class="text-xl font-bold text-white">Review Results</h2>
            <div v-if="detectedLanguage" class="mt-1">
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-800/50 font-bold uppercase tracking-wider">
                Detected: {{ detectedLanguage }}
              </span>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-slate-400">Quality Score:</span>
            <span 
              class="text-2xl font-bold"
              :class="score > 80 ? 'text-green-400' : score > 50 ? 'text-yellow-400' : 'text-red-400'"
            >{{ score }}/100</span>
          </div>
        </div>
        <p class="text-slate-300 leading-relaxed">{{ summary }}</p>
      </div>

      <!-- Issues List -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <div 
          v-for="(issue, idx) in issues" 
          :key="idx"
          class="bg-slate-800 rounded-lg p-4 border-l-4"
          :class="{
            'border-blue-500': issue.severity === 'info',
            'border-yellow-500': issue.severity === 'warning',
            'border-red-500': issue.severity === 'critical'
          }"
        >
          <div class="flex items-start justify-between">
            <div class="font-mono text-xs text-slate-500 mb-1">Line {{ issue.line }}</div>
            <span 
              class="text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider"
              :class="{
                'bg-blue-900/50 text-blue-400': issue.severity === 'info',
                'bg-yellow-900/50 text-yellow-400': issue.severity === 'warning',
                'bg-red-900/50 text-red-400': issue.severity === 'critical'
              }"
            >{{ issue.severity }}</span>
          </div>
          <p class="text-slate-200 mt-1">{{ issue.message }}</p>
          <div v-if="issue.suggestion" class="mt-3 bg-slate-950 p-3 rounded font-mono text-sm text-green-400 overflow-x-auto">
            {{ issue.suggestion }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center text-slate-500 p-8 text-center bg-slate-800/30">
      <p>Select a focus and click "Analyze" to see AI feedback.</p>
    </div>
  </div>
</template>
