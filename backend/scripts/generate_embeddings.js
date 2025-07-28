// one-time script for embedding the sample data

import mysql from "mysql2/promise";
import { pipeline } from "@xenova/transformers";
import cliProgress from 'cli-progress';

const connection = await mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "pass",
    database: "movie_app",
});

let embeddingPipeline = null;

async function getEmbeddingPipeline() {
    if (!embeddingPipeline) {
        console.log("Loading embedding model...");
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

async function generateAndInsertEmbeddings() {
    try {
        // Get all movies with plots
        const [movies] = await connection.execute(
            "SELECT tconst, primary_title, plot FROM title WHERE plot IS NOT NULL"
        );

        console.log(`Found ${movies.length} movies to process`);
        const progressBar = new cliProgress.SingleBar({
            format: 'Processing Movies |{bar}| {percentage}% | {value}/{total} | Current: {movie}',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        });
        // only do 10 movies for now
        //let len = Math.min(10, movies.length);
        let len = movies.length
        progressBar.start(len, 0, { movie: 'Starting...' });
        for (let i = 0; i < len; i++) {
            const movie = movies[i];

            // Combine title and plot for better embeddings
            const textToEmbed = `${movie.primary_title}. ${movie.plot}`;

            // Generate embedding
            const embedding = await generateEmbedding(textToEmbed);
            progressBar.update(i, {movie: movie.primary_title})

            if (embedding.length !== 384) {
                console.log(
                    `Warning: Embedding has ${embedding.length} dimensions, expected 384`
                );
                continue;
            }

            await connection.execute(
                "UPDATE title SET embedding = Vec_FromText(?) WHERE tconst = ?",
                [JSON.stringify(embedding), movie.tconst]
            );
        }
        progressBar.stop();
        console.log("All embeddings generated successfully!");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
    }
}

generateAndInsertEmbeddings();
