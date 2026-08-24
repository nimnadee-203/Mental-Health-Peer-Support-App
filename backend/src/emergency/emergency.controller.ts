import { Controller, Post, Get, Patch, Body, Param, Req } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { CreateEmergencyRequestDto } from './dto/create-emergency-request.dto';
import { UpdateEmergencyStatusDto } from './dto/update-emergency-status.dto';

@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateEmergencyRequestDto) {
    // SECURITY: Authenticated user ID must be derived from request (auth guard / token system)
    const userId = req.user.id;
    return this.emergencyService.create(userId, dto);
  }

  @Get('my-requests')
  async getMyRequests(@Req() req: any) {
    const userId = req.user.id;
    return this.emergencyService.getMyRequests(userId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id') requestId: string,
    @Body() dto: UpdateEmergencyStatusDto
  ) {
    const userId = req.user.id;
    return this.emergencyService.updateStatus(userId, requestId, dto.status);
  }
}
