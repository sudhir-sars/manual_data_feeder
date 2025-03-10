
import mongoose, { Schema, model } from "mongoose";

export interface OptionDocument extends mongoose.Document {
    option_id: string;
    content?: string;
    option_image?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const OptionSchema = new Schema<OptionDocument>({
        option_id: { type: String, required: true },
        content: { type: String,  },
        option_image: { type: String, default: null },

      });

export const OptionModel =
  mongoose.models?.Option || model<OptionDocument>("Option", OptionSchema);
