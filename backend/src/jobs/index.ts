import { initEmitter } from "./emitter";
import "./workers/ai-response-worker";
import "./workers/flashcards-worker";

initEmitter();

console.log("All workers registered");
