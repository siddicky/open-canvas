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
exports.reflectNode = void 0;
const langgraph_sdk_1 = require("@langchain/langgraph-sdk");
const reflectNode = (state, config) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const langGraphClient = new langgraph_sdk_1.Client({
        apiUrl: `http://localhost:${process.env.PORT}`,
        defaultHeaders: {
            "X-API-KEY": process.env.LANGCHAIN_API_KEY,
        },
    });
    const selectedArtifact = state.selectedArtifactId
        ? state.artifacts.find((art) => art.id === state.selectedArtifactId)
        : state.artifacts[state.artifacts.length - 1];
    const reflectionInput = {
        messages: state.messages,
        artifact: selectedArtifact,
    };
    const reflectionConfig = {
        configurable: {
            // Ensure we pass in the current graph's assistant ID as this is
            // how we fetch & store the memories.
            open_canvas_assistant_id: (_a = config.configurable) === null || _a === void 0 ? void 0 : _a.assistant_id,
        },
    };
    const newThread = yield langGraphClient.threads.create();
    // Create a new reflection run, but do not `wait` for it to finish.
    // Intended to be a background run.
    yield langGraphClient.runs.create(
    // We enqueue the memory formation process on the same thread.
    // This means that IF this thread doesn't receive more messages before `afterSeconds`,
    // it will read from the shared state and extract memories for us.
    // If a new request comes in for this thread before the scheduled run is executed,
    // that run will be canceled, and a **new** one will be scheduled once
    // this node is executed again.
    newThread.thread_id, 
    // Pass the name of the graph to run.
    "reflection", {
        input: reflectionInput,
        config: reflectionConfig,
        // This memory-formation run will be enqueued and run later
        // If a new run comes in before it is scheduled, it will be cancelled,
        // then when this node is executed again, a *new* run will be scheduled
        multitaskStrategy: "enqueue",
        // This lets us "debounce" repeated requests to the memory graph
        // if the user is actively engaging in a conversation. This saves us $$ and
        // can help reduce the occurrence of duplicate memories.
        afterSeconds: 15,
    });
    return {};
});
exports.reflectNode = reflectNode;
