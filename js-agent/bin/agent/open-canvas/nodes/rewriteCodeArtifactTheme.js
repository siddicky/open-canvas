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
exports.rewriteCodeArtifactTheme = void 0;
const openai_1 = require("@langchain/openai");
const prompts_1 = require("../prompts");
const rewriteCodeArtifactTheme = (state) => __awaiter(void 0, void 0, void 0, function* () {
    const smallModel = new openai_1.ChatOpenAI({
        model: "gpt-4o",
        temperature: 0.5,
    });
    const selectedArtifact = state.artifacts.find((artifact) => artifact.id === state.selectedArtifactId);
    if (!selectedArtifact) {
        throw new Error("No artifact found with the selected ID");
    }
    let formattedPrompt = "";
    if (state.addComments) {
        formattedPrompt = prompts_1.ADD_COMMENTS_TO_CODE_ARTIFACT_PROMPT;
    }
    else if (state.portLanguage) {
        let newLanguage = "";
        switch (state.portLanguage) {
            case "typescript":
                newLanguage = "TypeScript";
                break;
            case "javascript":
                newLanguage = "JavaScript";
                break;
            case "cpp":
                newLanguage = "C++";
                break;
            case "java":
                newLanguage = "Java";
                break;
            case "php":
                newLanguage = "PHP";
                break;
            case "python":
                newLanguage = "Python";
                break;
        }
        formattedPrompt = prompts_1.PORT_LANGUAGE_CODE_ARTIFACT_PROMPT.replace("{newLanguage}", newLanguage);
    }
    else if (state.addLogs) {
        formattedPrompt = prompts_1.ADD_LOGS_TO_CODE_ARTIFACT_PROMPT;
    }
    else if (state.fixBugs) {
        formattedPrompt = prompts_1.FIX_BUGS_CODE_ARTIFACT_PROMPT;
    }
    else {
        throw new Error("No theme selected");
    }
    // Insert the code into the artifact placeholder in the prompt
    formattedPrompt = formattedPrompt.replace("{artifactContent}", selectedArtifact.content);
    const newArtifactValues = yield smallModel.invoke([
        { role: "user", content: formattedPrompt },
    ]);
    const newArtifact = Object.assign(Object.assign({}, selectedArtifact), { 
        // Ensure the new artifact's language is updated, if necessary
        language: state.portLanguage || selectedArtifact.language, content: newArtifactValues.content });
    return {
        artifacts: [newArtifact],
    };
});
exports.rewriteCodeArtifactTheme = rewriteCodeArtifactTheme;
