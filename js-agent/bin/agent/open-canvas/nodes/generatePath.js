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
exports.generatePath = void 0;
const openai_1 = require("@langchain/openai");
const prompts_1 = require("../prompts");
const utils_1 = require("../utils");
const zod_1 = require("zod");
/**
 * Routes to the proper node in the graph based on the user's query.
 */
const generatePath = (state) => __awaiter(void 0, void 0, void 0, function* () {
    if (state.highlighted) {
        return {
            next: "updateArtifact",
            selectedArtifactId: state.highlighted.id,
        };
    }
    if (state.language ||
        state.artifactLength ||
        state.regenerateWithEmojis ||
        state.readingLevel) {
        return {
            next: "rewriteArtifactTheme",
        };
    }
    if (state.addComments ||
        state.addLogs ||
        state.portLanguage ||
        state.fixBugs) {
        return {
            next: "rewriteCodeArtifactTheme",
        };
    }
    // Use either the currently selected artifact, or the most recent artifact if no artifact is selected.
    const selectedArtifact = state.selectedArtifactId
        ? state.artifacts.find((artifact) => artifact.id === state.selectedArtifactId)
        : state.artifacts[state.artifacts.length - 1];
    const allArtifactsButSelected = state.artifacts.filter((a) => a.id !== state.selectedArtifactId);
    // Call model and decide if we need to respond to a users query, or generate a new artifact
    const formattedPrompt = prompts_1.ROUTE_QUERY_PROMPT.replace("{recentMessages}", state.messages
        .slice(-3)
        .map((message) => `${message._getType()}: ${message.content}`)
        .join("\n\n"))
        .replace("{artifacts}", allArtifactsButSelected.length
        ? (0, utils_1.formatArtifacts)(allArtifactsButSelected, true)
        : "No artifacts found.")
        .replace("{selectedArtifact}", selectedArtifact
        ? (0, utils_1.formatArtifacts)([selectedArtifact], true)
        : "No artifacts found.");
    const modelWithTool = new openai_1.ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
    }).withStructuredOutput(zod_1.z.object({
        route: zod_1.z.enum(["updateArtifact", "respondToQuery", "generateArtifact"]),
        artifactId: zod_1.z
            .string()
            .optional()
            .describe("The ID of the artifact to update, if applicable."),
    }), {
        name: "route_query",
    });
    const result = yield modelWithTool.invoke([
        {
            role: "user",
            content: formattedPrompt,
        },
    ]);
    if (result.route === "updateArtifact") {
        return {
            // Only route to the `updateArtifact` node if highlighted text is present.
            // Otherwise we need to rewrite the entire artifact.
            next: "rewriteArtifact",
            selectedArtifactId: result.artifactId,
        };
    }
    else {
        return {
            next: result.route,
        };
    }
});
exports.generatePath = generatePath;
