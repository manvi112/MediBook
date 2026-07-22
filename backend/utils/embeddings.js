import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const getEmbeddings = async (texts) => {
  const response = await cohere.embed({
    texts,
    model: 'embed-english-v3.0',
    inputType: 'search_document',
  });
  return response.embeddings;
};


const getEmbedding = async (text) => {
  const response = await cohere.embed({
    texts: [text],
    model: 'embed-english-v3.0',
    inputType: 'search_query',
  });
  return response.embeddings[0];
};


export { getEmbeddings, getEmbedding };