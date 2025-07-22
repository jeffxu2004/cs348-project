// utility module for providing embedding interface
import { pipeline } from "@xenova/transformers";

let embeddingPipeline = null;
async function getEmbeddingPipeline() {
    if (!embeddingPipeline) {
        embeddingPipeline = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );
    }
    return embeddingPipeline;
}

async function generateEmbedding(text) {
    const extractor = await getEmbeddingPipeline();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
}

export { generateEmbedding };
