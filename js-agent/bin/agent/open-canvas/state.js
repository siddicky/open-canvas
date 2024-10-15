"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenCanvasGraphAnnotation = void 0;
const langgraph_1 = require("@langchain/langgraph");
/**
 * Concatenates the current state with the update.
 * It removes duplicates, prioritizing the update by `artifact.id`
 * @param {Artifact[]} state - The current state
 * @param {Artifact[]} update - The update to apply
 * @returns {Artifact[]} The updated state, removing duplicates.
 */
const artifactsReducer = (state, update) => {
    const updatedIds = new Set(update.map((a) => a.id));
    return state.filter((a) => !updatedIds.has(a.id)).concat(update);
};
exports.OpenCanvasGraphAnnotation = langgraph_1.Annotation.Root(Object.assign(Object.assign({}, langgraph_1.MessagesAnnotation.spec), { 
    /**
     * The ID of the artifact to perform some action on.
     */
    selectedArtifactId: (langgraph_1.Annotation), 
    /**
     * The part of the artifact the user highlighted. Use the `selectedArtifactId`
     * to determine which artifact the highlight belongs to.
     */
    highlighted: (langgraph_1.Annotation), 
    /**
     * The artifacts that have been generated in the conversation.
     */
    artifacts: (0, langgraph_1.Annotation)({
        reducer: artifactsReducer,
        default: () => [],
    }), 
    /**
     * The next node to route to. Only used for the first routing node/conditional edge.
     */
    next: (langgraph_1.Annotation), 
    /**
     * The language to translate the artifact to.
     */
    language: (langgraph_1.Annotation), 
    /**
     * The length of the artifact to regenerate to.
     */
    artifactLength: (langgraph_1.Annotation), 
    /**
     * Whether or not to regenerate with emojis.
     */
    regenerateWithEmojis: (langgraph_1.Annotation), 
    /**
     * The reading level to adjust the artifact to.
     */
    readingLevel: (langgraph_1.Annotation), 
    /**
     * Whether or not to add comments to the code artifact.
     */
    addComments: (langgraph_1.Annotation), 
    /**
     * Whether or not to add logs to the code artifact.
     */
    addLogs: (langgraph_1.Annotation), 
    /**
     * The programming language to port the code artifact to.
     */
    portLanguage: (langgraph_1.Annotation), 
    /**
     * Whether or not to fix bugs in the code artifact.
     */
    fixBugs: (langgraph_1.Annotation) }));
