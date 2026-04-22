import { reactive } from 'vue'

export const store = reactive({
    appMode: 'script',   // 'script' | 'prompt'
    artStyle: '现代都市真人写实风格，真实演员，真实皮肤毛孔纹理，电影摄影机镜头效果，城市实景拍摄，电影级布光，非动漫非卡通非插画',
    videoModel: 'jimeng', // 'jimeng' | 'doubao'
    analyzedNodes: [],    // 存放被AI切割的剧本段落
    activeSceneText: '',  // 送给右侧的场景文案
    activeVisualText: '', // 送给右侧的画面文案
    memoryContextString: '', 
    currentSceneNumber: 1
})
