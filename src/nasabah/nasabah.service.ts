import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateNasabahDto } from './dto/create-nasabah.dto.js';
import { UpdateNasabahDto } from './dto/update-nasabah.dto.js';

@Injectable()
export class NasabahService {
  constructor(private readonly prisma: PrismaService) {}

  // GET SEMUA NASABAH
  async findAll() {
    const nasabah = await this.prisma.nasabah.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Data nasabah berhasil diambil',
      data: nasabah,
    };
  }

  // TAMBAH NASABAH
  async create(dto: CreateNasabahDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (existingUser) {
      throw new ConflictException('Username sudah digunakan');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

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
          tanggalLahir: new Date(dto.tanggalLahir),
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
      message: 'Nasabah berhasil ditambahkan',
      data: user.nasabah,
    };
  }

  // GET DETAIL NASABAH
  async findOne(id: string) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    if (!nasabah) {
      throw new NotFoundException('Nasabah tidak ditemukan');
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Data nasabah berhasil diambil',
      data: nasabah,
    };
  }

  // UPDATE NASABAH
  async update(id: string, dto: UpdateNasabahDto) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: {
        id,
      },
    });

    if (!nasabah) {
      throw new NotFoundException('Nasabah tidak ditemukan');
    }

    const updated = await this.prisma.nasabah.update({
      where: {
        id,
      },
      data: {
        ...(dto.namaLengkap !== undefined && {
          namaNasabah: dto.namaLengkap,
        }),
        ...(dto.noTelepon !== undefined && {
          telp: dto.noTelepon,
        }),
        ...(dto.alamat !== undefined && {
          alamat: dto.alamat,
        }),
        ...(dto.tanggalLahir !== undefined && {
          tanggalLahir: new Date(dto.tanggalLahir),
        }),
        ...(dto.foto !== undefined && {
          foto: dto.foto,
        }),
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Data nasabah berhasil diperbarui',
      data: updated,
    };
  }

  // DELETE NASABAH
  async remove(id: string) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: {
        id,
      },
    });

    if (!nasabah) {
      throw new NotFoundException('Nasabah tidak ditemukan');
    }

    await this.prisma.user.delete({
      where: {
        id: nasabah.userId,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Nasabah berhasil dihapus',
      data: null,
    };
  }
}