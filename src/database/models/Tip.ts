import { Schema, model, type InferSchemaType } from "mongoose";

export const tipSchema = new Schema({
  commonName: { type: String, required: true },
  scientificName: { type: String, required: true },
  careLevel: { type: String, required: true },
  water: { type: String, required: true },
  light: { type: String, required: true },
  tip: { type: String, required: true },
  image: { type: String, required: true },
  sharedBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
});

export const Tip = model("Tip", tipSchema, "tips");

export type TipSchemaStructure = InferSchemaType<typeof tipSchema>;
