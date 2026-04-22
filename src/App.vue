<template>
  <div class="app-container">
    <header class="app-header">
      <div class="logo">AI MANGA PROMPT STUDIO</div>

      <!-- 模式切换 -->
      <div class="mode-switcher">
        <button
          class="mode-btn"
          :class="{ active: store.appMode === 'script' }"
          @click="store.appMode = 'script'"
        >
          <span class="mode-icon">📋</span>全集剧本模式
        </button>
        <button
          class="mode-btn"
          :class="{ active: store.appMode === 'prompt' }"
          @click="store.appMode = 'prompt'"
        >
          <span class="mode-icon">✏️</span>纯描述词模式
        </button>
      </div>

      <div class="global-context">
        <span class="label">视频模型</span>
        <div class="model-selector-group">
          <button
            class="model-btn"
            :class="{ active: store.videoModel === 'jimeng' }"
            @click="store.videoModel = 'jimeng'"
          >
            <span class="model-dot jimeng-dot"></span>即梦 2.0
          </button>
          <button
            class="model-btn"
            :class="{ active: store.videoModel === 'doubao' }"
            @click="store.videoModel = 'doubao'"
          >
            <span class="model-dot doubao-dot"></span>豆包 1.5 Pro
          </button>
        </div>
        <span class="label" style="margin-left:16px;">ART STYLE</span>
        <select v-model="store.artStyle" class="style-selector">
            <option value="经典少年漫风格，粗犷的墨线描边，强烈的动态阴影，热血漫画感">经典少年漫 (Shounen)</option>
            <option value="经典少女漫风格，细腻柔和的线条，梦幻打光，闪闪发光">经典少女漫 (Shoujo)</option>
            <option value="韩漫全彩条漫风格，色彩鲜艳饱和，轮廓锐利，清晰现代的打光">韩漫彩漫 (Modern Webtoon)</option>
            <option value="现代都市真人写实风格，真实演员，真实皮肤毛孔纹理，电影摄影机镜头效果，城市实景拍摄，电影级布光，非动漫非卡通非插画">现代都市 (Modern Urban)</option>
            <option value="赛博朋克风格，霓虹灯光效，暗黑机械质感，高对比度">赛博朋克 (Cyberpunk)</option>
            <option value="暗黑奇幻风格，浓重的黑色墨迹，哥特式质感，细腻的排线阴影">暗黑奇幻 (Dark Fantasy)</option>
            <option value="吉卜力动画片风格，复古怀旧，柔和的配色，极具情感张力">吉卜力动画 (Ghibli Studio)</option>
            <option value="黑色侦探风格，极高的高反差黑白对比，戏剧性的打光">黑色侦探题材 (Noir Comic)</option>
            <option value="武侠仙侠国风，飘逸的衣饰，空灵的氛围，典雅的配色">武侠仙侠 (Wuxia / Xianxia)</option>
        </select>
      </div>
    </header>

    <!-- 全集剧本模式 -->
    <main v-if="store.appMode === 'script'" class="app-main script-layout">
      <div class="layout-left">
        <ScriptAnalyzer />
      </div>
      <div class="layout-right">
        <PromptStudio />
      </div>
    </main>

    <!-- 纯描述词模式 -->
    <main v-else class="app-main prompt-layout">
      <PromptOptimizer />
    </main>
  </div>
</template>

<script setup>
import ScriptAnalyzer from './components/ScriptAnalyzer.vue';
import PromptStudio from './components/PromptStudio.vue';
import PromptOptimizer from './components/PromptOptimizer.vue';
import { store } from './store.js';
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-header {
  height: 64px;
  background-color: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 24px;
  box-shadow: var(--shadow-sm);
  z-index: 10;
}

.logo {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  white-space: nowrap;
}

/* ── Mode Switcher ───────────────────────────────────── */
.mode-switcher {
  display: flex;
  gap: 4px;
  background: var(--bg-base);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 4px;
  flex-shrink: 0;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-size: 0.83rem;
  font-family: var(--font-sans);
  font-weight: 500;
  background: transparent;
  color: var(--text-muted);
  transition: all 0.18s ease;
  white-space: nowrap;
}
.mode-btn:hover { color: var(--text-primary); background: var(--bg-surface); }
.mode-btn.active {
  background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
  color: #fff;
  box-shadow: 0 2px 10px rgba(99,102,241,0.4);
}
.mode-icon { font-size: 0.9rem; }

/* ── Global Context (right side of header) ──────────── */
.global-context {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
}

.label {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
}

.model-selector-group {
  display: flex;
  gap: 4px;
  background: var(--bg-base);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 4px;
}
.model-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-size: 0.82rem;
  font-family: var(--font-sans);
  font-weight: 500;
  background: transparent;
  color: var(--text-muted);
  transition: all 0.18s ease;
}
.model-btn:hover { color: var(--text-primary); background: var(--bg-surface); }
.model-btn.active { background: var(--brand-color); color: #fff; box-shadow: 0 2px 8px rgba(99,102,241,0.35); }
.model-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.jimeng-dot { background: #38bdf8; }
.doubao-dot { background: #fb923c; }
.model-btn.active .jimeng-dot { background: #bae6fd; }
.model-btn.active .doubao-dot { background: #fed7aa; }

.style-selector {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-family: var(--font-sans);
  min-width: 200px;
  max-width: 240px;
}
.style-selector:focus { border-color: var(--brand-color); outline: none; }

/* ── Main areas ─────────────────────────────────────── */
.app-main {
  flex: 1;
  overflow: hidden;
}

.script-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
}

.prompt-layout {
  display: flex;
}

.layout-left, .layout-right {
  overflow: hidden;
}
</style>
