"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateArtifact = void 0;
const openai_1 = require("@langchain/openai");
const prompts_1 = require("../prompts");
const utils_1 = require("@/agent/utils");
/**
 * Update an existing artifact based on the user's query.
 */
const updateArtifact = (state, config) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const smallModel = new openai_1.ChatOpenAI({
        model: "gpt-4o",
        temperature: 0.5,
    });
    const store = (0, utils_1.ensureStoreInConfig)(config);
    const assistantId = (_a = config.configurable) === null || _a === void 0 ? void 0 : _a.assistant_id;
    if (!assistantId) {
        throw new Error("`assistant_id` not found in configurable");
    }
    const memoryNamespace = ["memories", assistantId];
    const memoryKey = "reflection";
    const memories = yield store.get(memoryNamespace, memoryKey);
    const memoriesAsString = (memories === null || memories === void 0 ? void 0 : memories.value)
        ? (0, utils_1.formatReflections)(memories.value)
        : "No reflections found.";
    const selectedArtifact = state.artifacts.find((artifact) => artifact.id === state.selectedArtifactId);
    if (!selectedArtifact) {
        throw new Error("No artifact found with the selected ID");
    }
    if (!state.highlighted) {
        throw new Error("Can not partially regenerate an artifact without a highlight");
    }
    // Highlighted text is present, so we need to update the highlighted text.
    const start = Math.max(0, state.highlighted.startCharIndex - 500);
    const end = Math.min(selectedArtifact.content.length, state.highlighted.endCharIndex + 500);
    const beforeHighlight = selectedArtifact.content.slice(start, state.highlighted.startCharIndex);
    const highlightedText = selectedArtifact.content.slice(state.highlighted.startCharIndex, state.highlighted.endCharIndex);
    const afterHighlight = selectedArtifact.content.slice(state.highlighted.endCharIndex, end);
    const formattedPrompt = prompts_1.UPDATE_HIGHLIGHTED_ARTIFACT_PROMPT.replace("{highlightedText}", highlightedText)
        .replace("{beforeHighlight}", beforeHighlight)
        .replace("{afterHighlight}", afterHighlight)
        .replace("{reflections}", memoriesAsString);
    const recentHumanMessage = state.messages.findLast((message) => message._getType() === "human");
    if (!recentHumanMessage) {
        throw new Error("No recent human message found");
    }
    const updatedArtifact = yield smallModel.invoke([
        { role: "system", content: formattedPrompt },
        recentHumanMessage,
    ]);
    const entireTextBefore = selectedArtifact.content.slice(0, state.highlighted.startCharIndex);
    const entireTextAfter = selectedArtifact.content.slice(state.highlighted.endCharIndex);
    const entireUpdatedContent = `${entireTextBefore}${updatedArtifact.content}${entireTextAfter}`;
    const newArtifact = Object.assign(Object.assign({}, selectedArtifact), { content: entireUpdatedContent });
    return {
        artifacts: [newArtifact],
    };
});
exports.updateArtifact = updateArtifact;
