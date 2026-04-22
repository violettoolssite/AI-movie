<template>
  <div class="app-container">
    <header class="app-header">
      <div class="logo">AI MANGA PROMPT STUDIO</div>
      <div class="global-context">
        <span class="label">ART STYLE</span>
        <select v-model="store.artStyle" class="style-selector">
            <option value="经典少年漫风格，粗犷的墨线描边，强烈的动态阴影，热血漫画感">经典少年漫 (Shounen)</option>
            <option value="经典少女漫风格，细腻柔和的线条，梦幻打光，闪闪发光">经典少女漫 (Shoujo)</option>
            <option value="韩漫全彩条漫风格，色彩鲜艳饱和，轮廓锐利，清晰现代的打光">韩漫彩漫 (Modern Webtoon)</option>
            <option value="现代都市写实风格，干净利落的城市夜景，现代时尚质感，电影级布光">现代都市 (Modern Urban)</option>
            <option value="赛博朋克风格，霓虹灯光效，暗黑机械质感，高对比度">赛博朋克 (Cyberpunk)</option>
            <option value="暗黑奇幻风格，浓重的黑色墨迹，哥特式质感，细腻的排线阴影">暗黑奇幻 (Dark Fantasy)</option>
            <option value="吉卜力动画片风格，复古怀旧，柔和的配色，极具情感张力">吉卜力动画 (Ghibli Studio)</option>
            <option value="黑色侦探风格，极高的高反差黑白对比，戏剧性的打光">黑色侦探题材 (Noir Comic)</option>
            <option value="武侠仙侠国风，飘逸的衣饰，空灵的氛围，典雅的配色">武侠仙侠 (Wuxia / Xianxia)</option>
        </select>
      </div>
    </header>

    <main class="app-main">
      <div class="layout-left">
        <ScriptAnalyzer />
      </div>
      <div class="layout-right">
        <PromptStudio />
      </div>
    </main>
  </div>
</template>

<script setup>
import ScriptAnalyzer from './components/ScriptAnalyzer.vue';
import PromptStudio from './components/PromptStudio.vue';
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
  padding: 0 32px;
  gap: 32px;
  box-shadow: var(--shadow-sm);
  z-index: 10;
}

.logo {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.global-context {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
}

.style-selector {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: var(--font-sans);
  min-width: 280px;
}
.style-selector:focus { border-color: var(--brand-color); outline: none; }

.app-main {
  flex: 1;
  display: grid;
  grid-template-columns: 400px 1fr;
  overflow: hidden;
}

.layout-left {
  overflow: hidden;
}

.layout-right {
  overflow: hidden;
}
</style>
