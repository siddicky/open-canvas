"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graph = void 0;
const langgraph_1 = require("@langchain/langgraph");
const state_1 = require("./state");
const generatePath_1 = require("./nodes/generatePath");
const generateFollowup_1 = require("./nodes/generateFollowup");
const generateArtifact_1 = require("./nodes/generateArtifact");
const rewriteArtifact_1 = require("./nodes/rewriteArtifact");
const rewriteArtifactTheme_1 = require("./nodes/rewriteArtifactTheme");
const updateArtifact_1 = require("./nodes/updateArtifact");
const respondToQuery_1 = require("./nodes/respondToQuery");
const rewriteCodeArtifactTheme_1 = require("./nodes/rewriteCodeArtifactTheme");
const reflect_1 = require("./nodes/reflect");
const defaultInputs = {
    selectedArtifactId: undefined,
    highlighted: undefined,
    next: undefined,
    language: undefined,
    artifactLength: undefined,
    regenerateWithEmojis: undefined,
    readingLevel: undefined,
    addComments: undefined,
    addLogs: undefined,
    fixBugs: undefined,
    portLanguage: undefined,
};
const routeNode = (state) => {
    if (!state.next) {
        throw new Error("'next' state field not set.");
    }
    return new langgraph_1.Send(state.next, Object.assign({}, state));
};
const cleanState = (_) => {
    return Object.assign({}, defaultInputs);
};
const builder = new langgraph_1.StateGraph(state_1.OpenCanvasGraphAnnotation)
    // Start node & edge
    .addNode("generatePath", generatePath_1.generatePath)
    .addEdge(langgraph_1.START, "generatePath")
    // Nodes
    .addNode("respondToQuery", respondToQuery_1.respondToQuery)
    .addNode("rewriteArtifact", rewriteArtifact_1.rewriteArtifact)
    .addNode("rewriteArtifactTheme", rewriteArtifactTheme_1.rewriteArtifactTheme)
    .addNode("rewriteCodeArtifactTheme", rewriteCodeArtifactTheme_1.rewriteCodeArtifactTheme)
    .addNode("updateArtifact", updateArtifact_1.updateArtifact)
    .addNode("generateArtifact", generateArtifact_1.generateArtifact)
    .addNode("generateFollowup", generateFollowup_1.generateFollowup)
    .addNode("cleanState", cleanState)
    .addNode("reflect", reflect_1.reflectNode)
    // Initial router
    .addConditionalEdges("generatePath", routeNode, [
    "updateArtifact",
    "rewriteArtifactTheme",
    "rewriteCodeArtifactTheme",
    "respondToQuery",
    "generateArtifact",
    "rewriteArtifact",
])
    // Edges
    .addEdge("generateArtifact", "generateFollowup")
    .addEdge("updateArtifact", "generateFollowup")
    .addEdge("rewriteArtifact", "generateFollowup")
    .addEdge("rewriteArtifactTheme", "generateFollowup")
    .addEdge("rewriteCodeArtifactTheme", "generateFollowup")
    // End edges
    .addEdge("respondToQuery", "cleanState")
    // Only reflect if an artifact was generated/updated.
    .addEdge("generateFollowup", "reflect")
    .addEdge("reflect", "cleanState")
    .addEdge("cleanState", langgraph_1.END);
exports.graph = builder.compile();
