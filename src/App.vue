<template>
  <div class="app-container">
    <header class="app-header">
      <div class="logo">AI MANGA PROMPT STUDIO</div>
      <div class="global-context">
        <span class="label">ART STYLE</span>
        <select v-model="store.artStyle" class="style-selector">
            <option value="Classic Shounen Manga Style, bold ink lines, dynamic shading">经典少年漫 (Shounen)</option>
            <option value="Classic Shoujo Manga Style, delicate lines, soft shading, sparkly">经典少女漫 (Shoujo)</option>
            <option value="Modern Webtoon Style, full color, vibrant, sharp lighting">韩漫彩漫 (Modern Webtoon)</option>
            <option value="Modern Urban Realistic Comic Style, sleek cityscapes, modern fashion, cinematic lighting">现代都市 (Modern Urban)</option>
            <option value="Cyberpunk Comic Style, neon lighting, gritty, high contrast">赛博朋克 (Cyberpunk)</option>
            <option value="Dark Fantasy Manga, heavy black ink, gothic, detailed hatching">暗黑奇幻 (Dark Fantasy)</option>
            <option value="Studio Ghibli Anime Style, nostalgic, soft colors, expressive">吉卜力动画 (Ghibli Studio)</option>
            <option value="Noir Comic Book Style, high contrast black and white, dramatic lighting">黑色侦探题材 (Noir Comic)</option>
            <option value="Wuxia / Xianxia Manhua Style, flowing garments, ethereal, elegant">武侠仙侠 (Wuxia / Xianxia)</option>
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
