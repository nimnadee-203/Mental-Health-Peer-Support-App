import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type EmergencyRequestDocument = EmergencyRequest & Document;

@Schema({ timestamps: true })
export class EmergencyRequest {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: ['IMMEDIATE_DANGER', 'MEDICAL', 'MENTAL_HEALTH', 'TRUSTED_CONTACT'],
  })
  type: string;

  @Prop({
    type: String,
    required: true,
    enum: ['PENDING', 'CONTACTED', 'RESOLVED', 'CANCELLED'],
    default: 'PENDING',
    index: true,
  })
  status: string;

  @Prop({
    type: String,
    required: true,
  })
  description: string;
}

export const EmergencyRequestSchema = SchemaFactory.createForClass(EmergencyRequest);

// Compound index for query efficiency matching the Express pattern
EmergencyRequestSchema.index({ userId: 1, createdAt: -1 });
