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
- 'narration': Voiceovers, character inner monologues, or dialogue meant to be text.
- 'cut_instruction': Pure editing notes like 'Cut to black', 'Fade out', 'Transition'.

CRITICAL: Return ONLY a valid JSON Array. No markdown formatting (\`\`\`json) outside the array. No chat.
Example Output format:
[
  { "type": "scene_element", "text": "Inside an abandoned warehouse, dust moats float in the sunlight." },
  { "type": "narration", "text": "(Voiceover: I never thought it would end like this...)" },
  { "type": "character_action", "text": "John drops his gun, his face dripping with sweat, looking terrified." },
  { "type": "cut_instruction", "text": "[Camera pans out to a wide shot]" }
]`;

        const payload = {
            model: "moonshot-v1-8k",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Here is the episode script:\n\n${scriptText}` }
            ],
            temperature: 0.1
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
        if (!match) throw new Error("模型返回的并不是标准的 JSON格式。原文输出：" + content);
        return JSON.parse(match[0]);
    },

    // 阶段2：生成画面提示词
    async generatePrompts(outline, sceneText, visualText, memoryContext) {
        const systemPrompt = `You are a professional AI prompt engineer specializing in cinematic storyboards, comic panels, and manga art.
Your task is to take the user's rough descriptions and convert them into incredibly detailed, high-quality prompts for AI image/video generators.

CRITICAL RULES:
1. Form: valid JSON exact format {"scenePrompt": "...", "visualPrompt": "...", "combinedPrompt": "..."}. NO markdown formatting around JSON.
2. OUTPUT LANGUAGE (CRITICAL): You MUST auto-detect the language of the source script and ensure your generated prompts are written in that EXACT same language (e.g., if the user wrote Chinese scripts, you MUST output Chinese prompts. If English, output English prompts).
3. ZERO TEXT RULE: At the END of EVERY single generated prompt you MUST append: ${NO_TEXT_CONSTRAINT}. Add "no text, no subtitles" in the main prompt itself.
4. STYLE & CINEMATOGRAPHY (CRITICAL): 
   - DO NOT just literally translate the input into boring prose. 
   - You MUST inject highly dynamic cinematic terminology (e.g., extreme close-up, dynamic pan, slow zoom, Dutch angle) and amplify the visual impact (cinematic lighting, breathtaking intensity, masterpiece, 8k resolution).
   - Ensure the original camera movements (运镜) and visual tension/impact (冲击感) are strictly preserved and beautifully enhanced in the final output prompt language.
5. CONTEXT ALIGNMENT (CRITICAL): 
   - Art style context: ${outline}
   - If memory context is provided, you MUST ensure that the FIRST FRAME of this scene connects seamlessly with the LAST FRAME of the previous scene.
   - Example Constraint Wordings to append: "seamless continuity from previous shot, exactly same location, characters in identical outfits and positions, consistent with previous scene". Do NOT allow geographic or continuity jumps.
6. DIALOGUE & LIP-SYNC (CRITICAL):
   - Auto-detect the original language of the script's dialogue (e.g., Chinese, English, Japanese).
   - If characters speak, describe them as "fluently speaking [Original Language], expressive mouth open matching [Original Language] pronunciation".
   - Do NOT translate dialogue to another language. The dialogue text must remain exactly in the origin language. 
   - You MUST ensure NO subtitles are rendered ("no subtitles, no text on screen").
   - In combinedPrompt, append the exact original script dialogue at the very end in brackets like: [Script Dialog Reference: "Original Dialogue Text matching the script"] so the user can use it for AI lip-sync generation.`;

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
            temperature: 0.7
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
