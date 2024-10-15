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
exports.rewriteArtifact = void 0;
const openai_1 = require("@langchain/openai");
const prompts_1 = require("../prompts");
const utils_1 = require("@/agent/utils");
const rewriteArtifact = (state, config) => __awaiter(void 0, void 0, void 0, function* () {
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
    const formattedPrompt = prompts_1.UPDATE_ENTIRE_ARTIFACT_PROMPT.replace("{artifactContent}", selectedArtifact.content).replace("{reflections}", memoriesAsString);
    const recentHumanMessage = state.messages.findLast((message) => message._getType() === "human");
    if (!recentHumanMessage) {
        throw new Error("No recent human message found");
    }
    const newArtifactValues = yield smallModel.invoke([
        { role: "system", content: formattedPrompt },
        recentHumanMessage,
    ]);
    const newArtifact = Object.assign(Object.assign({}, selectedArtifact), { content: newArtifactValues.content });
    return {
        artifacts: [newArtifact],
    };
});
exports.rewriteArtifact = rewriteArtifact;
