"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatArtifacts = void 0;
const formatArtifacts = (messages, truncate) => messages
    .map((artifact) => {
    const content = truncate
        ? `${artifact.content.slice(0, 500)}${artifact.content.length > 500 ? "..." : ""}`
        : artifact.content;
    return `Title: ${artifact.title}\nID: ${artifact.id}\nContent: ${content}`;
})
    .join("\n\n");
exports.formatArtifacts = formatArtifacts;
