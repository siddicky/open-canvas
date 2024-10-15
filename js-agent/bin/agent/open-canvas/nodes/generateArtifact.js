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
exports.generateArtifact = void 0;
const openai_1 = require("@langchain/openai");
const prompts_1 = require("../prompts");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const utils_1 = require("@/agent/utils");
/**
 * Generate a new artifact based on the user's query.
 */
const generateArtifact = (state, config) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
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
    const modelWithArtifactTool = smallModel.bindTools([
        {
            name: "generate_artifact",
            schema: zod_1.z.object({
                type: zod_1.z
                    .enum(["code", "text"])
                    .describe("The content type of the artifact generated."),
                language: zod_1.z
                    .string()
                    .describe("The language of the artifact to generate. " +
                    " If generating code, it should be the programming language. " +
                    "For programming languages, ensure it's one of the following" +
                    "'javascript' | 'typescript' | 'cpp' | 'java' | 'php' | 'python' | 'other'"),
                artifact: zod_1.z
                    .string()
                    .describe("The content of the artifact to generate."),
                title: zod_1.z
                    .string()
                    .describe("A short title to give to the artifact. Should be less than 5 words."),
            }),
        },
    ], { tool_choice: "generate_artifact" });
    const formattedNewArtifactPrompt = prompts_1.NEW_ARTIFACT_PROMPT.replace("{reflections}", memoriesAsString);
    const response = yield modelWithArtifactTool.invoke([
        { role: "system", content: formattedNewArtifactPrompt },
        ...state.messages,
    ], { runName: "generate_artifact" });
    const newArtifact = {
        id: (_b = response.id) !== null && _b !== void 0 ? _b : (0, uuid_1.v4)(),
        content: (_d = (_c = response.tool_calls) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.args.artifact,
        title: (_f = (_e = response.tool_calls) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.args.title,
        type: (_h = (_g = response.tool_calls) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.args.type,
        language: (_k = (_j = response.tool_calls) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.args.language,
    };
    return {
        artifacts: [newArtifact],
    };
});
exports.generateArtifact = generateArtifact;
