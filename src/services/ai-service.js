export const NO_TEXT_CONSTRAINT = "--no text, --no subtitles, --no letters, --no watermarks, --no signature";

const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`
    }
}

const getUrl = () => `${import.meta.env.VITE_API_URL}/chat/completions`

export const aiService = {
    // 阶段1：分析剧本
    async analyzeScript(scriptText) {
        const systemPrompt = `You are a script analyzer. You will receive a script for ONE TV episode.
Task: Break down the script into a JSON array of chronological nodes.
Each node must have a 'type' and 'text'.
Types allowed:
- 'scene_element': Describes the environment, background, location, or time of day.
- 'character_action': Describes what a character does, how they look, or their expression.
- 'camera_movement': Camera instructions like 'Zoom in', 'Slow Pan', 'Low Angle', 'Tracking shot'.
- 'dialogue': Spoken words and lines said out loud by characters on screen.
- 'narration': Voiceovers or character inner monologues (invisible thoughts).
- 'cut_instruction': Pure editing notes like 'Cut to black', 'Fade out', 'Transition'.
- 'shot_divider': Explicit marker for scene/shot numbers like '12-1', '12-2', '场 1-1'. You MUST preserve these markers exactly as they appear to maintain structural boundaries.

CRITICAL: Return ONLY a valid JSON Array. No markdown formatting (\`\`\`json) outside the array. No chat.
SUPER CRITICAL TO PREVENT CUTOFF: You MUST output the JSON in a completely MINIFIED format (no newlines, no indentation) to save tokens.
Example Output format:
[
  { "type": "scene_element", "text": "Inside an abandoned warehouse, dust moats float in the sunlight." },
  { "type": "narration", "text": "(Voiceover: I never thought it would end like this...)" },
  { "type": "character_action", "text": "John drops his gun, his face dripping with sweat, looking terrified." },
  { "type": "dialogue", "text": "John yells: 'We are trapped!'" },
  { "type": "cut_instruction", "text": "[Camera pans out to a wide shot]" }
]`;

        const payload = {
            model: "moonshot-v1-8k",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Here is the episode script:\n\n${scriptText}` }
            ],
            temperature: 0.1,
            max_tokens: 4096
        };

        const response = await fetch(getUrl(), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("API call failed during script analysis.");
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        const match = content.match(/\[[\s\S]*\]/);
        if (!match) {
            // Attempt to force fix truncation blindly
            try {
                return JSON.parse(content + ']');
            } catch(e) {
                throw new Error("大模型单次生成突破了长度极限导致末尾被截断，并且无法自行闭合 JSON。原文输出最后几行：" + content.slice(-200));
            }
        }
        try {
            return JSON.parse(match[0]);
        } catch(e) {
            throw new Error("大模型生成的 JSON 中存在转义等语法错误：" + e.message + "，原文：" + match[0].slice(-200));
        }
    },

    // 阶段2：生成画面提示词
    async generatePrompts(outline, sceneText, visualText, memoryContext) {
        const systemPrompt = `You are a professional AI prompt engineer specializing in cinematic storyboards, comic panels, and manga art.
Your task is to take the user's rough descriptions and convert them into incredibly detailed, high-quality prompts for AI image/video generators.

CRITICAL RULES:
1. Form: valid JSON exact format {"scenePrompt": "...", "visualPrompt": "...", "combinedPrompt": "..."}. NO markdown formatting around JSON.
   - STRICT PUNCTUATION: Every single descriptive sentence inside your generated visual prompts MUST end perfectly with a Chinese full stop '。'.
   - NO FAKE TAGS OR ANCHORS: Do NOT invent or output any invalid anchors, markdown links, or fake IDs (e.g., "id=2"). The output text must be absolutely clean and strictly functional.
2. OUTPUT LANGUAGE (SUPER CRITICAL): You MUST auto-detect the language of the source script. Your final generated prompts (scenePrompt, visualPrompt, combinedPrompt) MUST be completely written in that EXACT SAME language. If the user input is Chinese, output 100% CHINESE prompts. UNDER NO CIRCUMSTANCES should you output English prompts for a Chinese script (even if the prescribed Art Style context is in English). Param tags like "--no" remain in English.
3. ZERO TEXT RULE: At the END of EVERY single generated prompt you MUST append: ${NO_TEXT_CONSTRAINT}. Add "no text, no subtitles" in the main prompt itself.
4. STYLE & CINEMATOGRAPHY (CRITICAL): 
   - CONCRETE ACTIONS ONLY: You MUST explicitly FORBID abstract emotional adjectives (e.g., "气场拉满", "凸显成长感", "悬念感"). Replace all abstract intent with EXPLICIT physical camera operations (e.g., "镜头缓慢推进，强化压迫感", "镜头轻微定格", "低角度特写").
   - VISUAL CLEARNESS (Anti-Cluster): Simplify crowded scenes. Do not cram too many elements (e.g., reporters + villains + main character) into a single frame. Ensure ONE highly focused main subject per shot to prevent AI generation confusion and cluttered images.
   - REVERSALS & CLIMAX: For dramatic reversals or plot twists, ensure the visual description physically manifests the core tension rather than abstractly referencing it.
   - You MUST inject highly dynamic but NATURAL cinematic terminology. Camera movements must be STRICTLY UNIDIRECTIONAL and smooth (if zooming in, do NOT suddenly zoom out. NO erratic camera bouncing).
   - You MUST explicitly forbid flickering and require smooth lighting: "smooth rendering, NO scene flickering, consistent cinematic lighting".
5. CONTEXT ALIGNMENT & TEMPORAL STABILITY (CRITICAL): 
   - Art style context: ${outline}
   - If memory context is provided, you MUST explicitly RE-WRITE the exact architectural background, furniture, and lighting detailed in the memory context into the new prompt. DO NOT just say "same location". You must forcefully list the identical background elements (e.g., "same wooden table, same concrete wall, same beige curtains") to stop the image generator from rolling a random new background. 
   - You MUST append explicit temporal stability constraints to prevent video generation artifacts: "seamless continuity from previous shot, exactly same background architecture, absolute object permanence".
   - You MUST explicitly lock character actions, features, and exact geographical anchors: "Character's exact physical location (e.g., sitting at the wooden table) and posture MUST remain strictly locked during camera scaling and shot cuts (no sudden teleporting). All character features, facial structures, injuries, scars, and details MUST remain strictly IDENTICAL. NO feature morphing, NO vanishing, NO sudden popping into or disappearing out of thin air."
   - PHYSICAL COLLISION CONSTRAINTS (ANTI-CLIPPING & ANTI-BREAKING): You MUST append strict physics and realism constraints to prevent AI mesh clipping or objects mysteriously breaking. Example wordings: "strict physical collision volume, NO clipping, NO mesh intersecting, props/weapons must NOT clip through clothes or bodies, physically accurate object interaction, absolute material structural integrity, NO items suddenly breaking or bending against the laws of physics."
6. DIALOGUE & LIP-SYNC (CRITICAL):
   - Auto-detect the original language of the script's dialogue (e.g., Chinese, English, Japanese).
   - If characters speak, describe them as "fluently speaking [Original Language], expressive mouth open matching [Original Language] pronunciation".
   - Do NOT translate dialogue to another language. The dialogue text must remain exactly in the origin language. 
   - You MUST ensure NO subtitles are rendered ("no subtitles, no text on screen").
   - In your generated prompt, append the exact original script dialogue at the very end in brackets like: [Script Dialog Reference: "Original Dialogue Text matching the script"] so the user can use it for AI lip-sync generation.
7. BATCH OUTPUT FORMAT & STRUCTURAL INTEGRITY (CRITICAL):
   - If the input script contains shot markers like "12-1", "12-2", you MUST process the entire batch simultaneously. MUST maintain exact numbering hierarchy (do NOT invent logic).
   - For ALL THREE JSON outputs ('scenePrompt', 'visualPrompt', 'combinedPrompt'), you MUST strictly preserve the shot sequence format. Every generated prompt MUST be explicitly prefixed with its corresponding shot number (e.g., 12-1, 12-2) followed by a newline and the text, so the outputs are easily sliceable by shot.
   - Specifically for 'combinedPrompt', each shot MUST strictly follow this exact structural template (mimicking the target external platform):

12-1 (对应场次，明确关联)
【出镜角色-场景】
角色：<本镜出现的具体角色名，用逗号分隔>
场景：<场景地点描述，必须继承上一境的记忆细节强制锁定>
[视频时长]：<基于当前的动作复杂度和对白长短，智能推导该单镜头视频所需生成的秒数，例如：3秒、5秒或10秒>
[画面]：<详细的动作、机位运镜、以及所有强制防穿模、防瞬移和锁定特征的指令>
^ 画面风格：${outline}，真实摄影，电影质感，细节极致清晰，8K高清，画面纯净无水印、无字幕 --no text
[对话文案]：
<原声对白，如果没有对白请写“无”>

12-2
【出镜角色-场景】
...
   - Ensure the newline characters are properly escaped as \\n in the JSON string constraint.`;

        let userContent = `Convert to optimized prompts.\n`;
        if (memoryContext) {
            userContent += `[MEMORY CONTEXT] The PREVIOUS video/scene ended exactly like this:\n"${memoryContext}"\n\n[REQUIREMENT]: Your NEW prompts MUST start exactly where that ended. Ensure perfect continuity: same restaurant/location, same characters, no abrupt jumps. Add explicit "identical location" enforcement words.\n\n`;
        }
        userContent += `[SCENE DESCRIPTION]: ${sceneText || 'Use appropriate scene.'}\n`;
        userContent += `[VISUAL DESCRIPTION]: ${visualText || 'Use appropriate character visuals.'}\n`;

        const payload = {
            model: "moonshot-v1-8k",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent }
            ],
            temperature: 0.7,
            max_tokens: 4096
        };

        const response = await fetch(getUrl(), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("API call failed during prompt generation.");
        const data = await response.json();
        const content = data.choices[0].message.content;
        const match = content.match(/\{[\s\S]*\}/);
        if(!match) throw new Error("模型无法组装 JSON 格式。返回原文：" + content);

        const parsed = JSON.parse(match[0]);
        
        return {
            scenePrompt: parsed.scenePrompt ? (parsed.scenePrompt.includes('--no text') ? parsed.scenePrompt : parsed.scenePrompt + ` ${NO_TEXT_CONSTRAINT}`) : '',
            visualPrompt: parsed.visualPrompt ? (parsed.visualPrompt.includes('--no text') ? parsed.visualPrompt : parsed.visualPrompt + ` ${NO_TEXT_CONSTRAINT}`) : '',
            combinedPrompt: parsed.combinedPrompt ? (parsed.combinedPrompt.includes('--no text') ? parsed.combinedPrompt : parsed.combinedPrompt + ` ${NO_TEXT_CONSTRAINT}`) : ''
        };
    }
};
