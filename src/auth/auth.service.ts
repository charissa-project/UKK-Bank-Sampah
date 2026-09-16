import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterAdminDto } from './dto/register-admin.dto.js';
import { RegisterNasabahDto } from './dto/register-nasabah.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateToken(payload: {
    userId: string;
    username: string;
    role: string;
  }): string {
    return this.jwtService.sign(payload);
  }

  // LOGIN
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const passwordValid = await this.comparePassword(
      dto.password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const token = this.generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Login berhasil',
      data: {
        accessToken: token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
    };
  }

  // REGISTER NASABAH
  async registerNasabah(dto: RegisterNasabahDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (existingUser) {
      throw new ConflictException('Username sudah digunakan');
    }

    const hashedPassword = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        role: 'NASABAH',
        nasabah: {
          create: {
            namaNasabah: dto.namaNasabah,
            alamat: dto.alamat,
            telp: dto.telp,
            foto: dto.foto,
          },
        },
      },
      include: {
        nasabah: true,
      },
    });

    return {
      statusCode: 201,
      success: true,
      message: 'Nasabah berhasil didaftarkan',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        nasabah: user.nasabah,
      },
    };
  }

  // REGISTER ADMIN
  async registerAdmin(dto: RegisterAdminDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (existingUser) {
      throw new ConflictException('Username sudah digunakan');
    }

    const hashedPassword = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        role: 'ADMIN',
        adminBank: {
          create: {
            namaUnit: dto.namaUnit,
            namaPengelola: dto.namaPengelola,
            telp: dto.telp,
          },
        },
      },
      include: {
        adminBank: true,
      },
    });

    return {
      statusCode: 201,
      success: true,
      message: 'Admin berhasil didaftarkan',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        adminBank: user.adminBank,
      },
    };
  }

  // GET ME
  async me(user: {
    userId: string;
    username: string;
    role: string;
  }) {
    const foundUser = await this.prisma.user.findUnique({
      where: {
        id: user.userId,
      },
      include: {
        nasabah: true,
        adminBank: true,
      },
    });

    if (!foundUser) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Data user berhasil diambil',
      data: {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
        nasabah: foundUser.nasabah,
        adminBank: foundUser.adminBank,
      },
    };
  }
}

