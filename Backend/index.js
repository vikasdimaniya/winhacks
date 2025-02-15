import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { getStreamingCompletion } from './llm.js'
dotenv.config()
const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => res.send('🫡'));

app.post('/llm', async (req, res) => {
    const { prompt, model } = req.body;
    try {
        const stream = await getStreamingCompletion({ userPrompt: prompt, model });

        for await (const part of stream) {
            if (model.includes('gpt')) {
                res.write(part.choices[0]?.delta?.content || "");
            } else if (model.includes('cohere')) {
                res.write(part.delta?.message?.content?.text || "");
            } else if (model.includes('gemini')) {
                res.write(part.result?.content || "");  // Gemini sample structure
            } else if (model.includes('huggingface')) {
                res.write(part.generated_text || "");
            }
        }
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing the request.');
    }
});

app.listen(process.env.PORT, () => console.log(`Server listening on PORT: ${process.env.PORT}`));
