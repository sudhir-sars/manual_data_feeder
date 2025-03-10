
import mongoose, { Schema, model } from "mongoose";

export interface SolutionDocument extends mongoose.Document {
    answer: string;
    explanation?: string;
    solution_image?: string;
    solution_equation?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const SolutionSchema = new Schema<SolutionDocument>({
    answer: { type: String, required: true },
    explanation: { type: String },
    solution_image: { type: String, default: null },
  
  });

export const SolutionModel =
  mongoose.models?.Solution || model<SolutionDocument>("Solution", SolutionSchema);
