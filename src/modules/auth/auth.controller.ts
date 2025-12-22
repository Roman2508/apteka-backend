import { Request } from "express"
import { Controller, Post, Get, Body, UseGuards, Req, HttpCode, HttpStatus } from "@nestjs/common"

import { LoginDto } from "./dto/login.dto"
import { LogoutDto } from "./dto/logout.dto"
import { AuthService } from "./auth.service"
import { JwtAuthGuard } from "../../shared/guards/jwt-auth.guard"
import { CurrentUser } from "../../shared/decorators/current-user.decorator"

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress
    const userAgent = req.headers["user-agent"]

    return this.authService.login(loginDto.username, loginDto.password, ipAddress, userAgent)
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Body() logoutDto: LogoutDto, @CurrentUser() user: any) {
    return this.authService.logout(user.id, logoutDto.sessionId)
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    const activeSession = await this.authService.getActiveSession(user.id)

    return {
      ...user,
      activeSession,
    }
  }
}
