import OpenAI from 'openai';
import { CohereClientV2 } from 'cohere-ai';
import { HfInference } from '@huggingface/inference';  // Hugging Face Inference
import dotenv from 'dotenv';
dotenv.config();

const cohere = new CohereClientV2({ token: process.env.COHERE_API_KEY });
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);  // Hugging Face setup

const systemMessage = {
  role: "system",
  content:
    "You are a developer. You are supposed to generate code only and follow the given format of the output."
};
function getCompletePrompt(userPrompt) {
  return `Generate a functional component in React to achieve "${userPrompt}". It should include: Comments explaining the logic for clarity. Key Inputs: 1. Use inline css for better styling. Have a nicely designed user interface design. 2. To use any React inbuilt features like state or ref use the React keyword and use it, for example: React.useState() 3. Make sure the entire snippet is just a single component. 4. The entire app should have a maximum height of 500px assumption while generating. Expected Output: Single Code Snippet of React functional component alone without any import or export statements. Do not answer anything else other than React Code. Follow the exact same format. No Explanation. Use the format as stated in the example, do not change it. Output Format: const ComponentName = () => { return (<div></div>) } render(<ComponentName />). Make sure no back ticks and language name needed. Render method format: render(<COMPONENT_NAME/>). do not include any dom related syntax.`;
}

export const getStreamingCompletion = async ({ userPrompt, model = "gpt-3.5-turbo" }) => {
  if (model.includes('gpt')) {
    return client.chat.completions.create({
      model,
      messages: [systemMessage, { role: "user", content: getCompletePrompt(userPrompt) }],
      stream: true,
    });
  } else if (model.includes('cohere')) {
    return await cohere.chatStream({
      model: 'command-r-plus-08-2024',
      messages: [{ role: 'user', content: getCompletePrompt(userPrompt) }],
    });
  } else if (model.includes('gemini')) {
    // Placeholder for Google Gemini API integration
    return fetchGeminiStream(getCompletePrompt(userPrompt));  // Assume a function to fetch Gemini response
  } else if (model.includes('huggingface')) {
    return hf.textGeneration({
      model: 'gpt2',  // Use an appropriate Hugging Face model
      inputs: getCompletePrompt(userPrompt),
      options: { wait_for_model: true },
    });
  } else {
    throw new Error(`Unsupported model: ${model}`);
  }
};

// Example function for Gemini support
const fetchGeminiStream = async (prompt) => {
  // Add actual Gemini API integration here
  return [
    { result: { content: `Generated text for: ${prompt}` } }  // Mock response
  ];
};
