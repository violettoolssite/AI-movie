import { reactive } from 'vue'

export const store = reactive({
    artStyle: 'Modern Urban Realistic Comic Style, sleek cityscapes, modern fashion, cinematic lighting',
    analyzedNodes: [], // 存放被AI切割的剧本段落
    activeSceneText: '', // 送给右侧的场景文案
    activeVisualText: '', // 送给右侧的画面文案
    memoryContextString: '', 
    currentSceneNumber: 1
})
