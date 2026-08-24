import { IsNotEmpty, IsEnum } from 'class-validator';

export class UpdateEmergencyStatusDto {
  @IsNotEmpty()
  @IsEnum(['PENDING', 'CONTACTED', 'RESOLVED', 'CANCELLED'])
  status: string;
}
