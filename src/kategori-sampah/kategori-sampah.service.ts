import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

import {
  CreateKategoriSampahDto,
  JenisSampah,
} from './dto/create-kategori-sampah.dto.js';

import { UpdateKategoriSampahDto } from './dto/update-kategori-sampah.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@Injectable()
export class KategoriSampahService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly cloudinaryService: CloudinaryService,
) {}

  // Mapping dari format API -> format Prisma
  private mapJenisToPrisma(jenis: JenisSampah) {
    const jenisMap = {
      plastik: 'PLASTIK',
      kertas: 'KERTAS',
      logam: 'LOGAM',
      kaca: 'KACA',
    } as const;

    return jenisMap[jenis];
  }

  // Mapping dari format Prisma -> format API
  private mapJenisToApi(jenis: string) {
    const jenisMap: Record<string, string> = {
      PLASTIK: 'plastik',
      KERTAS: 'kertas',
      LOGAM: 'logam',
      KACA: 'kaca',
    };

    return jenisMap[jenis] ?? jenis;
  }

  // GET semua kategori
  async findAll() {
    const kategori = await this.prisma.kategoriSampah.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    const data = kategori.map((item) => ({
      ...item,
      jenis: this.mapJenisToApi(item.jenis),
    }));

    return {
      statusCode: 200,
      success: true,
      message: 'Data kategori sampah berhasil diambil',
      data,
    };
  }

  // POST kategori
  async create(
    dto: CreateKategoriSampahDto,
    file?: Express.Multer.File,
  ) {
    const foto = file
  ? await this.cloudinaryService.uploadImage(
      file,
      'bank-sampah/kategori-sampah',
    )
  : null;

    const kategori = await this.prisma.kategoriSampah.create({
      data: {
        namaKategori: dto.namaKategori,
        hargaPerKg: Number(dto.hargaPerKg),
        poinPerKg: Number(dto.poinPerKg),
        jenis: this.mapJenisToPrisma(dto.jenis),
        foto,
      },
    });

    return {
      statusCode: 201,
      success: true,
      message: 'Kategori sampah baru berhasil disimpan',
      data: {
        ...kategori,
        jenis: this.mapJenisToApi(kategori.jenis),
      },
    };
  }

  // GET detail kategori
  async findOne(id: string) {
    const kategori = await this.prisma.kategoriSampah.findUnique({
      where: {
        id,
      },
    });

    if (!kategori) {
      throw new NotFoundException(
        'Kategori sampah tidak ditemukan',
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Data kategori sampah berhasil diambil',
      data: {
        ...kategori,
        jenis: this.mapJenisToApi(kategori.jenis),
      },
    };
  }

  // PUT kategori
  async update(
    id: string,
    dto: UpdateKategoriSampahDto,
    file?: Express.Multer.File,
  ) {
    const existing = await this.prisma.kategoriSampah.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        'Kategori sampah tidak ditemukan',
      );
    }

    const foto = file
  ? await this.cloudinaryService.uploadImage(
      file,
      'bank-sampah/kategori-sampah',
    )
  : existing.foto;

    const updated = await this.prisma.kategoriSampah.update({
      where: {
        id,
      },
      data: {
        namaKategori: dto.namaKategori,
        hargaPerKg: Number(dto.hargaPerKg),
        poinPerKg: Number(dto.poinPerKg),
        jenis: this.mapJenisToPrisma(dto.jenis),
        foto,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Kategori sampah berhasil diperbarui',
      data: {
        ...updated,
        jenis: this.mapJenisToApi(updated.jenis),
      },
    };
  }

  // DELETE kategori
  async remove(id: string) {
    const existing = await this.prisma.kategoriSampah.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        'Kategori sampah tidak ditemukan',
      );
    }

    await this.prisma.kategoriSampah.delete({
      where: {
        id,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Kategori sampah berhasil dihapus',
      data: {
        id,
      },
    };
  }
}