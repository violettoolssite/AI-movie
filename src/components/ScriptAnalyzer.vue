<template>
  <div class="analyzer-wrapper">
    <div class="header">
      <h2>SCRIPT ANALYZER (剧本解析区)</h2>
      <span class="badge">MAX: 1 EPISODE</span>
    </div>
    <div class="content">
      <textarea 
        v-model="scriptInput" 
        placeholder="请在此粘贴单集剧本（禁止丢入全集，字数建议不超过3000字）。AI将自动解构出可用实体并隔离旁白/指导..."
        :disabled="isAnalyzing"
      ></textarea>
      
      <button class="btn-analyze" @click="handleAnalyze" :disabled="!scriptInput.trim() || isAnalyzing">
        {{ isAnalyzing ? 'ANALYZING...' : '智能解析 (EXTRACT DATA)' }}
      </button>

      <div class="results" v-if="store.analyzedNodes.length > 0">
        <h3>解析沙盘 (Preview)</h3>
        <div class="nodes-container">
          <span 
            v-for="(node, index) in store.analyzedNodes" 
            :key="index"
            :class="['node', getNodeClass(node.type)]"
            :title="node.type"
          >
            {{ node.text }}
          </span>
        </div>
        <div class="legend">
          <span class="legend-valid">■ 有效转换词</span>
          <span class="legend-invalid">■ 旁白/剪辑(已隔离/将被抛弃)</span>
        </div>
        <button class="btn-push" @click="pushToStudio">➔ 一键搬运至右侧并生成英文提示词</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { store } from '../store.js';
import { aiService } from '../services/ai-service.js';

const scriptInput = ref('');
const isAnalyzing = ref(false);

const handleAnalyze = async () => {
    isAnalyzing.value = true;
    try {
        const nodes = await aiService.analyzeScript(scriptInput.value);
        store.analyzedNodes = nodes;
    } catch (error) {
        alert("解析失败: " + error.message);
    } finally {
        isAnalyzing.value = false;
    }
}

const getNodeClass = (type) => {
    if (type === 'narration' || type === 'cut_instruction') return 'node-invalid';
    return 'node-valid';
}

const pushToStudio = () => {
    // 组装纯净版
    const scenes = store.analyzedNodes.filter(n => n.type === 'scene_element').map(n => n.text).join(' ');
    const visuals = store.analyzedNodes.filter(n => n.type === 'character_action').map(n => n.text).join(' ');
    
    store.activeSceneText = scenes || '未提取到场景要素...';
    store.activeVisualText = visuals || '未提取到画面要素...';

    // 自动触发右侧生成
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('auto-generate'));
    }, 100);
}
</script>

<style scoped>
.analyzer-wrapper {
    background: #fff;
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    height: 100%;
}
.header {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.header h2 { font-size: 0.9rem; font-family: var(--font-mono); }
.badge { font-size: 0.7rem; background: var(--bg-input); padding: 4px 8px; border-radius: 4px; color: var(--text-muted); font-family: var(--font-mono); }
.content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
}
textarea {
    width: 100%;
    min-height: 200px;
    padding: 16px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 0.9rem;
    resize: vertical;
    transition: all 0.2s;
}
textarea:focus { outline: none; border-color: var(--brand-color); }
.btn-analyze {
    background: var(--text-primary);
    color: #fff;
    border: none;
    padding: 12px;
    border-radius: 6px;
    font-family: var(--font-mono);
}
.btn-analyze:disabled { opacity: 0.5; cursor: not-allowed; }

.results {
    margin-top: 24px;
    border-top: 1px dashed var(--border-color);
    padding-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.results h3 { font-size: 0.85rem; color: var(--text-muted); }
.nodes-container {
    background: var(--bg-base);
    padding: 16px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    font-size: 0.9rem;
    line-height: 1.8;
}
.node { padding: 0 4px; margin-right: 4px; border-radius: 2px; }
.node-valid { background: transparent; color: var(--text-primary); }
.node-invalid { 
    background: var(--danger-light); 
    color: var(--danger-text); 
    text-decoration: line-through; 
    border-bottom: 2px dashed var(--danger-text);
}

.legend { display: flex; gap: 16px; font-size: 0.8rem; }
.legend-valid { color: var(--text-muted); }
.legend-invalid { color: var(--danger-text); }

.btn-push {
    align-self: stretch;
    background: var(--brand-color);
    border: none;
    padding: 12px 16px;
    border-radius: 6px;
    color: #fff;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
}
.btn-push:hover { background: var(--accent-hover); }
</style>
