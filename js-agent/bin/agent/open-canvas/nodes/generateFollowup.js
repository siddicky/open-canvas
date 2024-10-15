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
exports.generateFollowup = void 0;
const openai_1 = require("@langchain/openai");
const prompts_1 = require("../prompts");
const utils_1 = require("@/agent/utils");
/**
 * Generate a followup message after generating or updating an artifact.
 */
const generateFollowup = (state, config) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const smallModel = new openai_1.ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0.5,
        maxTokens: 250,
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
        ? (0, utils_1.formatReflections)(memories.value, {
            onlyContent: true,
        })
        : "No reflections found.";
    const recentArtifact = state.artifacts[state.artifacts.length - 1];
    const formattedPrompt = prompts_1.FOLLOWUP_ARTIFACT_PROMPT.replace("{artifactContent}", recentArtifact.content)
        .replace("{reflections}", memoriesAsString)
        .replace("{conversation}", state.messages
        .map((msg) => `<${msg._getType()}>\n${msg.content}\n</${msg._getType()}>`)
        .join("\n\n"));
    // TODO: Include the chat history as well.
    const response = yield smallModel.invoke([
        { role: "user", content: formattedPrompt },
    ]);
    return {
        messages: [response],
    };
});
exports.generateFollowup = generateFollowup;
