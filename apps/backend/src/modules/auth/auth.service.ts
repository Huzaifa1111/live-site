import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email } });

    // Safety check: if user doesn't exist or has no password, validation fails
    if (!user || !user.password) {
      return null;
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        const { password: _, ...result } = user;
        return result;
      }
    } catch (error) {
      console.error('Password comparison error:', error);
    }

    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = this.usersRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      phone: registerDto.phone,
      verificationOtp: otp,
      otpExpiresAt,
    });

    try {
      const savedUser = await this.usersRepository.save(user);

      // Send OTP email
      try {
        await this.emailService.sendOtpEmail(
          savedUser.email,
          savedUser.name,
          otp,
        );
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        // Continue even if email fails
      }

      return {
        requiresVerification: true,
        email: savedUser.email,
        message: 'Registration successful. Please verify your email with the OTP sent to your email.',
      };
    } catch (error) {
      throw new Error('Failed to register user');
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const user = await this.usersRepository.findOne({
      where: { email: verifyOtpDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.verificationOtp || !user.otpExpiresAt) {
      throw new UnauthorizedException('No OTP found or expired');
    }

    if (user.verificationOtp !== verifyOtpDto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (new Date() > user.otpExpiresAt) {
      throw new UnauthorizedException('OTP expired');
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.verificationOtp = null;
    user.otpExpiresAt = null;
    await this.usersRepository.save(user);

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: true,
      },
    };
  }

  async resendOtp(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new ConflictException('Email already verified');
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationOtp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await this.usersRepository.save(user);

    // Send OTP email
    try {
      await this.emailService.sendOtpEmail(user.email, user.name, otp);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new Error('Failed to send OTP email');
    }

    return { message: 'OTP resent successfully' };
  }

  async getProfile(userId: string) {
    const { ObjectId } = require('mongodb');
    const user = await this.usersRepository.findOne({ where: { _id: new ObjectId(userId) } as any });
    if (!user) {
      throw new NotFoundException('User on profile get not found');
    }

    const { password, verificationOtp, otpExpiresAt, ...userProfile } = user;
    return userProfile;
  }

  async googleLogin(req) {
    if (!req.user) {
      throw new UnauthorizedException('No user from google');
    }

    const { email, name, googleId, picture } = req.user;

    let user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      // Create new user if doesn't exist
      user = this.usersRepository.create({
        email,
        name,
        googleId: googleId as string,
        picture,
        isEmailVerified: true, // Google emails are already verified
      });
      await this.usersRepository.save(user);
    } else {
      // Update existing user with Google info if missing
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.picture) {
        user.picture = picture;
        updated = true;
      }
      if (updated) {
        await this.usersRepository.save(user);
      }
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }
}