import Groq from 'groq-sdk';
import knowledgeChunkModel from '../models/knowledgeChunk.js';
import { getEmbedding } from '../utils/embeddings.js';
import cosineSimilarity from '../utils/cosineSimilarity.js';
import {
  patientTools,
  doctorTools,
  executePatientTool,
  executeDoctorTool,
} from '../utils/chatTools.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// retrieving top 3 relevant chunks from knowledge base
const retrieveContext = async (query) => {
  const queryEmbedding = await getEmbedding(query);
  const chunks = await knowledgeChunkModel.find();

  const ranked = chunks
    .map(chunk => ({
      text: chunk.text,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);

  return ranked.map(r => r.text).join('\n\n');
};

export const chat = async (req, res) => {
  try {
    const { messages } = req.body;
    const role = req.session.role;
    const userId = req.session.userId;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'Messages are required' });
    }

    // get the latest user message for RAG retrieval
    const latestUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!latestUserMessage) {
      return res.status(400).json({ success: false, message: 'No user message found' });
    }

    // RAG — retrieve relevant context
    const context = await retrieveContext(latestUserMessage.content);

    // build system prompt
    const systemPrompt = `You are MediBook Assistant, a helpful medical appointment booking chatbot.

Use the following knowledge base to answer questions about medical specializations and symptoms:
${context}

${role === 'patient'
        ? `You are helping a patient. You can:
- Suggest which doctor specialization they should see based on their symptoms
- Find doctors by specialization or city using the find_doctors tool
- Check doctor availability using the check_availability tool
- Show their appointments using the get_my_appointments tool
- For booking appointments, tell them the doctorId and available slots, then ask them to confirm before booking`
        : `You are helping a doctor. You can:
- Show their appointments using the get_doctor_appointments tool
- Update appointment status using the update_appointment_status tool`
      }

Always be helpful, professional, and concise. If you don't know something, say so.
Always use the available tools when the user asks about doctors, appointments, or availability. Never make up doctor information — always use the find_doctors tool.`;


    // select tools based on role
    const tools = role === 'patient' ? patientTools : doctorTools;

    // build messages array for Groq
    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    console.log('Tools being sent:', JSON.stringify(tools, null, 2));
    console.log('Role:', role);

    // first Groq call
    let response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      tools,
      tool_choice: 'auto',
      max_tokens: 1024,
    });

    let responseMessage = response.choices[0].message;

    // tool calling loop
    while (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      // add assistant message to history
      groqMessages.push(responseMessage);

      // execute each tool call
      for (const toolCall of responseMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        let toolResult;
        if (role === 'patient') {
          toolResult = await executePatientTool(toolName, args, userId);
        } else {
          toolResult = await executeDoctorTool(toolName, args, userId);
        }

        // add tool result to messages
        groqMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }

      // second Groq call with tool results
      response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        tools,
        tool_choice: 'auto',
        max_tokens: 1024,
      });

      responseMessage = response.choices[0].message;
    }

    res.status(200).json({
      success: true,
      message: responseMessage.content,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};