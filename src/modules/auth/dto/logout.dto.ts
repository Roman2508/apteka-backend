import { IsInt } from 'class-validator';

export class LogoutDto {
  @IsInt()
  sessionId: number;
}
