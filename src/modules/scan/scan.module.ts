import { Module } from '@nestjs/common';
import { ScanGateway } from './scan.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: {
        expiresIn: '24h',
      },
    }),
  ],
  providers: [ScanGateway],
})
export class ScanModule {}
