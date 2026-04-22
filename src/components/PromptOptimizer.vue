<template>
  <div class="optimizer-wrapper">
    <div class="optimizer-body">

      <!-- 左侧：输入区 -->
      <div class="input-panel">
        <div class="panel-header">
          <h2>RAW INPUT <span class="badge">描述词输入</span></h2>
          <span class="model-tag" :class="store.videoModel">
            {{ store.videoModel === 'jimeng' ? '即梦 2.0' : '豆包 1.5 Pro' }}
          </span>
        </div>
        <div class="panel-body">
          <div class="hint-box">
            <div class="hint-icon">💡</div>
            <div>
              输入单张图片或单个视频的<strong>原始描述词</strong>，工具会自动按照所选视频模型的格式进行优化，并应用安全过滤、负向提示词和对白锁定。
            </div>
          </div>
          <textarea
            v-model="rawInput"
            placeholder="例如：女主角站在国际发布会讲台上，眼神坚定，林森走上前低声汇报：家主，任务完成了。黑川残余被当场制服。"
            :disabled="isOptimizing"
            class="raw-textarea"
          ></textarea>
          <div class="char-count">{{ rawInput.length }} 字</div>
          <button
            class="btn-optimize"
            @click="handleOptimize"
            :disabled="isOptimizing || !rawInput.trim()"
          >
            <span v-if="isOptimizing" class="spinner"></span>
            <span v-else>⚡</span>
            {{ isOptimizing ? '优化中...' : 'OPTIMIZE 优化提示词' }}
          </button>
        </div>
      </div>

      <!-- 右侧：输出区 -->
      <div class="output-panel">
        <div class="panel-header">
          <h2>OPTIMIZED OUTPUT <span class="badge accent">优化后提示词</span></h2>
          <button
            class="btn-copy"
            @click="copyResult"
            :disabled="!result || result.startsWith('STANDBY') || result.startsWith('[ERROR]')"
          >
            {{ copied ? '✅ COPIED' : 'COPY 复制' }}
          </button>
        </div>
        <div class="panel-body">
          <div
            class="output-content"
            :class="{
              'processing': isOptimizing,
              'has-error': result && result.startsWith('[ERROR]'),
              'has-content': result && !result.startsWith('STANDBY')
            }"
          >{{ result }}</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { store } from '../store.js';
import { aiService } from '../services/ai-service.js';

const rawInput = ref('');
const result = ref('STANDBY... 请在左侧输入描述词后点击优化');
const isOptimizing = ref(false);
const copied = ref(false);

const handleOptimize = async () => {
  if (!rawInput.value.trim()) return;
  isOptimizing.value = true;
  result.value = '⚡ 正在为 ' + (store.videoModel === 'jimeng' ? '即梦 2.0' : '豆包 1.5 Pro') + ' 优化提示词...';

  try {
    const optimized = await aiService.optimizeRawPrompt(
      rawInput.value,
      store.artStyle,
      store.videoModel
    );
    result.value = optimized;
  } catch (e) {
    result.value = '[ERROR] ' + e.message;
  } finally {
    isOptimizing.value = false;
  }
};

const copyResult = () => {
  if (!result.value || result.value.startsWith('STANDBY') || result.value.startsWith('[ERROR]')) return;
  navigator.clipboard.writeText(result.value).then(() => {
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  });
};
</script>

<style scoped>
.optimizer-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-base);
}

.optimizer-body {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 24px;
  overflow: hidden;
}

/* ── Panel base ─────────────────────────────────────── */
.input-panel,
.output-panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.output-panel {
  border-color: rgba(99, 102, 241, 0.25);
  background: linear-gradient(180deg, var(--bg-surface) 0%, rgba(99,102,241,0.02) 100%);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--bg-base);
  gap: 10px;
}

.panel-header h2 {
  font-size: 0.82rem;
  font-family: var(--font-mono);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  font-family: var(--font-sans);
  font-size: 0.72rem;
  font-weight: 500;
  background: var(--bg-base);
  color: var(--text-muted);
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
}

.badge.accent {
  background: rgba(99,102,241,0.12);
  color: var(--brand-color);
  border-color: rgba(99,102,241,0.3);
}

.model-tag {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}
.model-tag.jimeng {
  background: rgba(56,189,248,0.12);
  color: #0ea5e9;
  border: 1px solid rgba(56,189,248,0.3);
}
.model-tag.doubao {
  background: rgba(251,146,60,0.12);
  color: #f97316;
  border: 1px solid rgba(251,146,60,0.3);
}

.panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 14px;
  overflow-y: auto;
}

/* ── Hint ───────────────────────────────────────────── */
.hint-box {
  display: flex;
  gap: 10px;
  background: rgba(99,102,241,0.06);
  border: 1px solid rgba(99,102,241,0.18);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.6;
}
.hint-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
.hint-box strong { color: var(--text-primary); }

/* ── Textarea ───────────────────────────────────────── */
.raw-textarea {
  flex: 1;
  min-height: 200px;
  background: var(--bg-input, var(--bg-base));
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 14px;
  border-radius: 10px;
  resize: none;
  font-size: 0.9rem;
  line-height: 1.7;
  font-family: var(--font-sans);
  transition: border-color 0.18s;
}
.raw-textarea:focus { outline: none; border-color: var(--brand-color); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.raw-textarea:disabled { opacity: 0.5; }

.char-count {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-align: right;
  margin-top: -8px;
}

/* ── Optimize button ────────────────────────────────── */
.btn-optimize {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 20px;
  background: linear-gradient(135deg, var(--brand-color) 0%, #7c3aed 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  box-shadow: 0 4px 14px rgba(99,102,241,0.35);
}
.btn-optimize:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
.btn-optimize:active:not(:disabled) { transform: translateY(0); }
.btn-optimize:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; transform: none; }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Copy button ────────────────────────────────────── */
.btn-copy {
  font-size: 0.78rem;
  padding: 5px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-copy:hover:not(:disabled) { border-color: var(--brand-color); color: var(--brand-color); }
.btn-copy:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── Output content ─────────────────────────────────── */
.output-content {
  flex: 1;
  padding: 16px;
  font-family: var(--font-mono);
  font-size: 0.87rem;
  line-height: 1.75;
  color: var(--text-muted);
  white-space: pre-wrap;
  overflow-wrap: break-word;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-input, var(--bg-base));
  min-height: 300px;
  transition: color 0.2s;
}
.output-content.processing { color: var(--brand-color); animation: pulse 1.5s ease-in-out infinite; }
.output-content.has-content { color: var(--text-primary); }
.output-content.has-error { color: #f87171; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
