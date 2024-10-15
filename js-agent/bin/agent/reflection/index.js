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
exports.graph = exports.reflect = void 0;
const anthropic_1 = require("@langchain/anthropic");
const langgraph_1 = require("@langchain/langgraph");
const state_1 = require("./state");
const prompts_1 = require("./prompts");
const zod_1 = require("zod");
const utils_1 = require("../utils");
const reflect = (state, config) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const store = (0, utils_1.ensureStoreInConfig)(config);
    const assistantId = (_a = config.configurable) === null || _a === void 0 ? void 0 : _a.open_canvas_assistant_id;
    if (!assistantId) {
        throw new Error("`open_canvas_assistant_id` not found in configurable");
    }
    const memoryNamespace = ["memories", assistantId];
    const memoryKey = "reflection";
    const memories = yield store.get(memoryNamespace, memoryKey);
    const memoriesAsString = (memories === null || memories === void 0 ? void 0 : memories.value)
        ? (0, utils_1.formatReflections)(memories.value)
        : "No reflections found.";
    const generateReflectionsSchema = zod_1.z.object({
        styleRules: zod_1.z
            .array(zod_1.z.string())
            .describe("The complete new list of style rules and guidelines."),
        content: zod_1.z
            .array(zod_1.z.string())
            .describe("The complete new list of memories/facts about the user."),
    });
    const model = new anthropic_1.ChatAnthropic({
        model: "claude-3-5-sonnet-20240620",
        temperature: 0,
    }).withStructuredOutput(generateReflectionsSchema, {
        name: "generate_reflections",
    });
    const formattedSystemPrompt = prompts_1.REFLECT_SYSTEM_PROMPT.replace("{artifact}", (_c = (_b = state.artifact) === null || _b === void 0 ? void 0 : _b.content) !== null && _c !== void 0 ? _c : "No artifact found.").replace("{reflections}", memoriesAsString);
    const formattedUserPrompt = prompts_1.REFLECT_USER_PROMPT.replace("{conversation}", state.messages
        .map((msg) => `<${msg.getType()}>\n${msg.content}\n</${msg.getType()}>`)
        .join("\n\n"));
    const result = yield model.invoke([
        {
            role: "system",
            content: formattedSystemPrompt,
        },
        {
            role: "user",
            content: formattedUserPrompt,
        },
    ]);
    const newMemories = {
        styleRules: result.styleRules,
        content: result.content,
    };
    yield store.put(memoryNamespace, memoryKey, newMemories);
    return {};
});
exports.reflect = reflect;
const builder = new langgraph_1.StateGraph(state_1.ReflectionGraphAnnotation)
    .addNode("reflect", exports.reflect)
    .addEdge(langgraph_1.START, "reflect");
exports.graph = builder.compile();
