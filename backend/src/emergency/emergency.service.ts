import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmergencyRequest, EmergencyRequestDocument } from './schemas/emergency-request.schema';
import { CreateEmergencyRequestDto } from './dto/create-emergency-request.dto';

@Injectable()
export class EmergencyService {
  constructor(
    @InjectModel(EmergencyRequest.name)
    private readonly emergencyRequestModel: Model<EmergencyRequestDocument>
  ) {}

  async create(userId: string, dto: CreateEmergencyRequestDto) {
    const request = new this.emergencyRequestModel({
      userId: new Types.ObjectId(userId),
      type: dto.type,
      status: 'PENDING',
      description: dto.description,
    });
    const saved = await request.save();
    return {
      success: true,
      requestId: (saved._id as Types.ObjectId).toString(),
      status: saved.status,
    };
  }

  async getMyRequests(userId: string) {
    return this.emergencyRequestModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(userId: string, requestId: string, status: string) {
    const request = await this.emergencyRequestModel.findById(requestId).exec();
    if (!request) {
      throw new NotFoundException('Emergency request not found.');
    }
    if (request.userId.toString() !== userId) {
      throw new ForbiddenException('Forbidden. You do not own this request.');
    }
    request.status = status;
    return request.save();
  }
}
