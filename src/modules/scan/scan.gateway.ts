import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ScanGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.split(' ')[1];
      if (!token) {
        // Allow connection without token for now, but maybe restrict actions?
        // Or just disconnect. For simplicity, let's try to verify if present.
        return;
      }
      const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      });
      // Join a room based on userId so all devices of the same user can communicate
      const userId = payload.sub;
      client.join(`user-${userId}`);
      console.log(`Client connected: ${client.id}, User: ${userId}`);
    } catch (e: any) {
      console.log('Connection auth failed', e?.message);
      // client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { userId: number }, @ConnectedSocket() client: Socket) {
    client.join(`user-${data.userId}`);
    return { event: 'joined', data: `user-${data.userId}` };
  }

  @SubscribeMessage('checkStatus')
  handleCheckStatus(@MessageBody() data: { userId: number }, @ConnectedSocket() client: Socket) {
    // Broadcast to the user's room asking for status (PC should respond)
    // We exclude the sender (mobile) from the broadcast if possible, or just broadcast to room
    client.to(`user-${data.userId}`).emit('requestStatus');
  }

  @SubscribeMessage('statusUpdate')
  handleStatusUpdate(@MessageBody() data: { userId: number; status: string; location: string }) {
    // PC sends this. Broadcast to all (specifically mobile needs it)
    this.server.to(`user-${data.userId}`).emit('statusUpdated', data);
  }

  @SubscribeMessage('scanData')
  handleScanData(@MessageBody() data: { userId: number; scanData: any }) {
    // Mobile sends this. Send to PC.
    this.server.to(`user-${data.userId}`).emit('scanDataReceived', data.scanData);
  }
}
