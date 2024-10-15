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
exports.respondToQuery = void 0;
const openai_1 = require("@langchain/openai");
const utils_1 = require("../utils");
const utils_2 = require("@/agent/utils");
/**
 * Generate responses to questions. Does not generate artifacts.
 */
const respondToQuery = (state, config) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const smallModel = new openai_1.ChatOpenAI({
        model: "gpt-4o",
        temperature: 0.5,
    });
    const prompt = `You are an AI assistant tasked with responding to the users question.
  
The user has generated artifacts in the past. Use the following artifacts as context when responding to the users question.

You also have the following reflections on style guidelines and general memories/facts about the user to use when generating your response.
<reflections>
{reflections}
</reflections>

<artifacts>
{artifacts}
</artifacts>`;
    const store = (0, utils_2.ensureStoreInConfig)(config);
    const assistantId = (_a = config.configurable) === null || _a === void 0 ? void 0 : _a.assistant_id;
    if (!assistantId) {
        throw new Error("`assistant_id` not found in configurable");
    }
    const memoryNamespace = ["memories", assistantId];
    const memoryKey = "reflection";
    const memories = yield store.get(memoryNamespace, memoryKey);
    const memoriesAsString = (memories === null || memories === void 0 ? void 0 : memories.value)
        ? (0, utils_2.formatReflections)(memories.value)
        : "No reflections found.";
    const formattedPrompt = prompt
        .replace("{artifacts}", (0, utils_1.formatArtifacts)(state.artifacts))
        .replace("{reflections}", memoriesAsString);
    const response = yield smallModel.invoke([
        { role: "system", content: formattedPrompt },
        ...state.messages,
    ]);
    return {
        messages: [response],
    };
});
exports.respondToQuery = respondToQuery;
