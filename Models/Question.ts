import mongoose, { Schema, model } from "mongoose";

export interface QuestionDocument extends mongoose.Document {
  subject: string;
  content: string;
  image?: string;
  type: string;
  options?: mongoose.Types.ObjectId[];
  solution?: mongoose.Types.ObjectId;
  tags: string[];
  dificulty_level: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const QuestionSchema = new Schema<QuestionDocument>({
  subject: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, default: null },
  type: { type: String, default: "mcq" },
  tags: { type: [String], required: true, default: [] },
  options: [{ type: Schema.Types.ObjectId, ref: "Option", default: null }],
  solution: { type: Schema.Types.ObjectId, ref: "Solution", default: null },
  dificulty_level: { type: Number, default: 5 },
}, { timestamps: true });

export const QuestionModel =
  mongoose.models.Question || model<QuestionDocument>("Question", QuestionSchema);
