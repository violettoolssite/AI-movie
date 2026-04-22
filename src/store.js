import { reactive } from 'vue'

export const store = reactive({
    artStyle: '现代都市写实风格，干净利落的城市夜景，现代时尚质感，电影级布光',
    videoModel: 'jimeng', // 'jimeng' | 'doubao'
    analyzedNodes: [], // 存放被AI切割的剧本段落
    activeSceneText: '', // 送给右侧的场景文案
    activeVisualText: '', // 送给右侧的画面文案
    memoryContextString: '', 
    currentSceneNumber: 1
})
