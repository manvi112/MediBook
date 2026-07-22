import mongoose from 'mongoose';

const knowledgeChunkSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    specialization: { type: String },
    source: { type: String },
  },
  { timestamps: true }
);

const knowledgeChunkModel = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);

export default knowledgeChunkModel;