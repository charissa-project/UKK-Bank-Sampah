import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateHadiahDto } from './dto/create-hadiah.dto.js';
import { UpdateHadiahDto } from './dto/update-hadiah.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@Injectable()
export class HadiahService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly cloudinaryService: CloudinaryService,
) {}

  async findAll() {
    const hadiah = await this.prisma.hadiah.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Data hadiah berhasil diambil',
      data: hadiah,
    };
  }

  async create(
    dto: CreateHadiahDto,
    file?: Express.Multer.File,
  ) {
    const foto = file
  ? await this.cloudinaryService.uploadImage(
      file,
      'bank-sampah/hadiah',
    )
  : null;

    const hadiah = await this.prisma.hadiah.create({
      data: {
        namaHadiah: dto.namaHadiah,
        poinDibutuhkan: Number(dto.poinDibutuhkan),
        stok: Number(dto.stok),
        foto,
      },
    });

    return {
      statusCode: 201,
      success: true,
      message: 'Hadiah baru berhasil disimpan',
      data: hadiah,
    };
  }

  async findOne(id: string) {
    const hadiah = await this.prisma.hadiah.findUnique({
      where: { id },
    });

    if (!hadiah) {
      throw new NotFoundException(
        'Hadiah tidak ditemukan',
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Data hadiah berhasil diambil',
      data: hadiah,
    };
  }

  async update(
    id: string,
    dto: UpdateHadiahDto,
    file?: Express.Multer.File,
  ) {
    const existing = await this.prisma.hadiah.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        'Hadiah tidak ditemukan',
      );
    }

    const foto = file
  ? await this.cloudinaryService.uploadImage(
      file,
      'bank-sampah/hadiah',
    )
  : existing.foto;

    const updated = await this.prisma.hadiah.update({
      where: { id },
      data: {
        namaHadiah: dto.namaHadiah,
        poinDibutuhkan: Number(dto.poinDibutuhkan),
        stok: Number(dto.stok),
        foto,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Hadiah berhasil diperbarui',
      data: updated,
    };
  }

  async remove(id: string) {
    const existing = await this.prisma.hadiah.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        'Hadiah tidak ditemukan',
      );
    }

    await this.prisma.hadiah.delete({
      where: { id },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Hadiah berhasil dihapus',
      data: { id },
    };
  }
}