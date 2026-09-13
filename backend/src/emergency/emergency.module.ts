import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmergencyController } from './emergency.controller';
import { EmergencyService } from './emergency.service';
import { EmergencyRequest, EmergencyRequestSchema } from './schemas/emergency-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmergencyRequest.name, schema: EmergencyRequestSchema },
    ]),
  ],
  controllers: [EmergencyController],
  providers: [EmergencyService],
})
export class EmergencyModule {}
