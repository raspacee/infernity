import { initEmitter } from "./emitter";
import "./workers/ai-response-worker";

initEmitter();

console.log("All workers registered");
