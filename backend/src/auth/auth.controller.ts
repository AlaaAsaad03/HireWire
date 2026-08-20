import { Body, Controller, Patch, Post, Delete, UseGuards, ValidationPipe, Request, Get } from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {


    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body(ValidationPipe) registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body(ValidationPipe) loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req: any) {
        return this.authService.getUserProfile(req.user.id);
    }

    // ⭐ CHANGE PASSWORD (fix typo)
    @Patch('change-password')
    @UseGuards(JwtAuthGuard)
    async changePassword(
        @Request() req: any,
        @Body() body: { currentPassword: string; newPassword: string }
    ) {
        return this.authService.changePassword(
            req.user.id,
            body.currentPassword,
            body.newPassword
        );
    }

    // ⭐ UPDATE PROFILE
    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(
        @Request() req: any,
        @Body() body: { firstName: string; lastName: string }
    ) {
        return this.authService.updateProfile(req.user.id, body);
    }

    // ⭐ DELETE ACCOUNT
    @Delete('account')
    @UseGuards(JwtAuthGuard)
    async deleteAccount(@Request() req: any) {
        return this.authService.deleteAccount(req.user.id);
    }
}