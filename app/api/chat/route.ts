import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';

// Check for the API key at the start
if (!process.env.GOOGLE_API_KEY) {
    throw new Error('Missing GOOGLE_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Specify that this route should be processed at the edge
export const runtime = 'edge';

// System message to fine-tune the model's behavior
const SYSTEM_MESSAGE = `You are an AI-powered customer support assistant for a software company. 
Your role is to provide helpful, friendly, and accurate responses to customer inquiries. 
You should always maintain a professional tone and prioritize customer satisfaction. 
If you're unsure about an answer, it's okay to say you don't know and offer to escalate the issue to a human representative. 
Please don't make up information or provide details about internal company processes you're not certain about.`;

export async function POST(req: Request) {
    try {
        // Parse the request body
        const { messages }: { messages: Message[] } = await req.json();

        // Validate the messages array
        if (!Array.isArray(messages) || messages.length === 0) {
            return new Response('Invalid or empty messages array', { status: 400 });
        }

        // Get the Gemini Pro model
        const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Convert messages to Gemini format, including the system message
        const geminiMessages = [
            { role: 'user', parts: [{ text: SYSTEM_MESSAGE }] },
            ...messages.map((message: Message) => ({
                role: message.role === 'user' ? 'user' : 'model',
                parts: [{ text: message.content }],
            }))
        ];

        // Start a chat session
        const chat: ChatSession = model.startChat({
            history: geminiMessages.slice(0, -1),
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
                topP: 1,
                topK: 1,
            },
        });

        // Send the last message to get a response
        const result = await chat.sendMessageStream(geminiMessages[geminiMessages.length - 1].parts[0].text);

        // Convert the response to a readable stream
        const stream = GoogleGenerativeAIStream(result);

        // Return the stream as a StreamingTextResponse
        return new StreamingTextResponse(stream);
    } catch (error: any) {
        console.error('Error in chat route:', error);
        return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}