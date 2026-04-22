<template>
  <div class="studio-wrapper">
    <div class="studio-grid">
      <!-- 场景 -->
      <div class="panel">
        <div class="panel-header"><h2>SCENE (场景描述)</h2></div>
        <div class="panel-body">
          <textarea v-model="store.activeSceneText" placeholder="等待从解析区同步，或手动输入..." :disabled="isGenerating"></textarea>
          <div class="result-box">
            <div class="result-header">
              <h3>OPTIMIZED SCENE</h3>
              <button class="btn-copy" @click="copyToClipboard(scenePromptOutput, $event)">COPY</button>
            </div>
            <div class="output-content" :class="{'processing': isGenerating}">{{ scenePromptOutput }}</div>
          </div>
        </div>
      </div>

      <!-- 画面 -->
      <div class="panel">
        <div class="panel-header"><h2>VISUAL (画面描述)</h2></div>
        <div class="panel-body">
          <textarea v-model="store.activeVisualText" placeholder="等待从解析区同步，或手动输入..." :disabled="isGenerating"></textarea>
          <div class="result-box">
            <div class="result-header">
              <h3>OPTIMIZED VISUAL</h3>
              <button class="btn-copy" @click="copyToClipboard(visualPromptOutput, $event)">COPY</button>
            </div>
            <div class="output-content" :class="{'processing': isGenerating}">{{ visualPromptOutput }}</div>
          </div>
        </div>
      </div>

      <!-- 合并版 -->
      <div class="panel combined-panel">
        <div class="panel-header"><h2>COMBINED (综合版生成提示词)</h2></div>
        <div class="panel-body">
          <div class="result-box combined-result-box">
            <div class="result-header">
              <h3>ALL-IN-ONE PROMPT (含对白参数)</h3>
              <button class="btn-copy" @click="copyToClipboard(combinedPromptOutput, $event)">COPY</button>
            </div>
            <div class="output-content" :class="{'processing': isGenerating}">{{ combinedPromptOutput }}</div>
          </div>
        </div>
      </div>
    </div>

    <footer class="app-footer">
      <div class="memory-status">
        <div class="status-dot" :class="{ 'idle': store.currentSceneNumber === 1 }"></div>
        <span>FRAME: <strong>{{ String(store.currentSceneNumber).padStart(2, '0') }}</strong></span>
        <div class="context-pill" :class="{ 'active': store.currentSceneNumber > 1 }">
          MEMORY: {{ store.currentSceneNumber > 1 ? `ACTIVE (FRAME ${store.currentSceneNumber - 1})` : 'IDLE' }}
        </div>
      </div>
      <div class="action-bar">
        <button class="btn-primary" @click="handleGenerate" :disabled="isGenerating">GENERATE PROMPT</button>
        <button class="btn-secondary" @click="handleNextFrame" :disabled="!scenePromptOutput || scenePromptOutput === 'STANDBY...'">COMMIT & NEXT FRAME</button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { store } from '../store.js';
import { aiService } from '../services/ai-service.js';

const scenePromptOutput = ref('STANDBY...');
const visualPromptOutput = ref('STANDBY...');
const combinedPromptOutput = ref('STANDBY...');
const isGenerating = ref(false);

const handleGenerate = async () => {
    if (!store.activeSceneText && !store.activeVisualText) {
        alert('Please provide scene or visual text first!');
        return;
    }
    
    isGenerating.value = true;
    scenePromptOutput.value = 'PROCESSING SCENE DATA...';
    visualPromptOutput.value = 'PROCESSING VISUAL DATA...';
    combinedPromptOutput.value = 'PROCESSING COMBINED DATA...';

    try {
        const result = await aiService.generatePrompts(
            store.artStyle, 
            store.activeSceneText, 
            store.activeVisualText, 
            store.memoryContextString
        );
        scenePromptOutput.value = result.scenePrompt;
        visualPromptOutput.value = result.visualPrompt;
        combinedPromptOutput.value = result.combinedPrompt;
    } catch (e) {
        scenePromptOutput.value = '[ERROR] ' + e.message;
        visualPromptOutput.value = '[ERROR] ' + e.message;
        combinedPromptOutput.value = '[ERROR] ' + e.message;
    } finally {
        isGenerating.value = false;
    }
}

const handleNextFrame = () => {
    // Use the explicitly generated detailed prompt as memory for airtight background consistency
    store.memoryContextString = combinedPromptOutput.value && !combinedPromptOutput.value.includes('STANDBY') 
        ? combinedPromptOutput.value 
        : `Scene: ${store.activeSceneText} | Visual: ${store.activeVisualText}`;
        
    store.currentSceneNumber++;

    store.activeSceneText = '';
    store.activeVisualText = '';
    scenePromptOutput.value = 'STANDBY...';
    visualPromptOutput.value = 'STANDBY...';
    combinedPromptOutput.value = 'STANDBY...';
}

const copyToClipboard = (text, e) => {
    if (!text || text.includes('STANDBY') || text.includes('PROCESSING')) return;
    navigator.clipboard.writeText(text).then(() => {
        const btn = e.target;
        const oText = btn.innerText;
        btn.innerText = 'COPIED';
        setTimeout(() => btn.innerText = oText, 1500);
    });
}

onMounted(() => {
    window.addEventListener('auto-generate', handleGenerate);
});

onUnmounted(() => {
    window.removeEventListener('auto-generate', handleGenerate);
});
</script>

<style scoped>
.studio-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.studio-grid {
    flex: 1;
    display: flex;
    gap: 16px;
    padding: 24px;
    background-color: var(--bg-base);
    overflow: hidden;
}

.panel {
    flex: 1;
    min-width: 0;
    background-color: var(--bg-surface);
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
}

.combined-panel {
    flex: 1.2;
    background: linear-gradient(180deg, var(--bg-surface) 0%, rgba(37,99,235,0.02) 100%);
    border-color: rgba(37,99,235,0.2);
}

.panel-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--bg-base);
    background-color: var(--bg-surface);
}
.combined-panel .panel-header h2 { color: var(--brand-color); }

.panel-header h2 {
    font-size: 0.85rem;
    color: var(--text-primary);
}

.panel-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 16px;
    overflow-y: auto;
}

textarea {
    width: 100%;
    height: 90px;
    background-color: var(--bg-surface);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 12px;
    border-radius: 8px;
    resize: none;
    font-size: 0.85rem;
    line-height: 1.6;
}
textarea:focus { outline: none; border-color: var(--brand-color); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

.result-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-input);
    overflow: hidden;
}
.combined-result-box { height: 100%; }

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-surface);
}

.result-header h3 { font-size: 0.75rem; color: var(--text-primary); }
.combined-panel .result-header h3 { color: var(--brand-color); font-weight: 700; }

.btn-copy {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.7rem;
}

.output-content {
    padding: 16px;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    line-height: 1.6;
    color: var(--text-muted);
    overflow-wrap: break-word;
    flex: 1;
    overflow-y: auto;
    white-space: pre-wrap;
}

.processing { color: var(--brand-color); }

.app-footer {
    height: 72px;
    background-color: var(--bg-surface);
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 32px;
}

.memory-status { display: flex; align-items: center; gap: 16px; font-size: 0.85rem; color: var(--text-muted); }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background-color: var(--status-active); }
.status-dot.idle { background-color: var(--border-highlight); }
.memory-status strong { color: var(--text-primary); background: var(--bg-input); padding: 2px 8px; border-radius: 4px; }
.context-pill { background: var(--bg-base); padding: 6px 12px; border-radius: 20px; border: 1px solid var(--border-color); }
.context-pill.active { color: var(--brand-color); border-color: var(--brand-color); background-color: rgba(37, 99, 235, 0.05); }

.action-bar { display: flex; gap: 16px; }
.btn-primary, .btn-secondary { padding: 10px 20px; border: none; border-radius: 8px; font-size: 0.9rem; }
.btn-primary { background-color: var(--accent); color: #ffffff; }
.btn-primary:active { transform: translateY(1px); }
.btn-secondary { background-color: #ffffff; border: 1px solid var(--border-color); }
.btn-primary:disabled, .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
</style>
