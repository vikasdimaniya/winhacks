import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { getStreamingCompletion } from './llm.js'
dotenv.config()
const app = express()

app.use(express.json())
app.use(cors())

const matches = []

app.get('/', (req, res) => res.send('🫡'))

app.post('/llm', async (req, res) => {
    const data = req.body;
    const stream = await getStreamingCompletion({ userPrompt: data?.prompt, model: data?.model });
    if (data?.model?.indexOf('gpt') > -1) {
        for await (const part of stream) {
            // Uncomment below if you want to check chunk time generation
            // const chunkTime = (Date.now() - starttime) / 1000;
            // process.stdout.write(part.choices[0]?.delta || "");
            // console.log("chunk time:", chunkTime);
            res.write(part.choices[0]?.delta.content || "");
        }
    } else {
        for await (const part of stream) {
            if (part.type === 'content-delta') {
                res.write(part.delta?.message?.content?.text || "");
            }
        }
    }
    res.end();
})

app.listen(process.env.PORT, () => console.log("Server listening on PORT: "+process.env.PORT))