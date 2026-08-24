import { IsNotEmpty, IsEnum, IsString } from 'class-validator';

export class CreateEmergencyRequestDto {
  @IsNotEmpty()
  @IsEnum(['IMMEDIATE_DANGER', 'MEDICAL', 'MENTAL_HEALTH', 'TRUSTED_CONTACT'])
  type: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
