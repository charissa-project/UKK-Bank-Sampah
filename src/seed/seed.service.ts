import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    const passwordAdmin = await bcrypt.hash('admin123', 10);
    const passwordNasabah = await bcrypt.hash('password123', 10);

    // =========================
    // ADMIN
    // =========================
    const admin = await this.prisma.user.upsert({
      where: {
        username: 'admin_banksampah',
      },
      update: {},
      create: {
        username: 'admin_banksampah',
        password: passwordAdmin,
        role: 'ADMIN',
        adminBank: {
          create: {
            namaUnit: 'Bank Sampah Asri Jaya',
            namaPengelola: 'Admin Bank Sampah',
            telp: '081234567890',
          },
        },
      },
      include: {
        adminBank: true,
      },
    });

    // =========================
    // NASABAH 1
    // =========================
    const nasabah1 = await this.prisma.user.upsert({
      where: {
        username: 'Fadi',
      },
      update: {},
      create: {
        username: 'nasabah5',
        password: passwordNasabah,
        role: 'NASABAH',
        nasabah: {
          create: {
            namaNasabah: 'Fadi',
            alamat: 'Jl. Sudirman No. 120',
            telp: '081299998888',
            saldoPoin: 150,
          },
        },
      },
      include: {
        nasabah: true,
      },
    });

    // =========================
    // NASABAH 2
    // =========================
    const nasabah2 = await this.prisma.user.upsert({
      where: {
        username: 'nasabah6',
      },
      update: {},
      create: {
        username: 'nasabah6',
        password: passwordNasabah,
        role: 'NASABAH',
        nasabah: {
          create: {
            namaNasabah: 'Cindy',
            alamat: 'Jl. Mawar No. 20',
            telp: '081299998889',
            saldoPoin: 80,
          },
        },
      },
      include: {
        nasabah: true,
      },
    });

    // =========================
    // 4 KATEGORI SAMPAH
    // =========================
    const kategori1 = await this.prisma.kategoriSampah.create({
      data: {
        namaKategori: 'Botol Plastik PET',
        hargaPerKg: 3500,
        poinPerKg: 10,
        jenis: 'PLASTIK',
      },
    });

    const kategori2 = await this.prisma.kategoriSampah.create({
      data: {
        namaKategori: 'Kardus & Karton',
        hargaPerKg: 2000,
        poinPerKg: 5,
        jenis: 'KERTAS',
      },
    });

    const kategori3 = await this.prisma.kategoriSampah.create({
      data: {
        namaKategori: 'Kaleng Aluminium',
        hargaPerKg: 5000,
        poinPerKg: 15,
        jenis: 'LOGAM',
      },
    });

    const kategori4 = await this.prisma.kategoriSampah.create({
      data: {
        namaKategori: 'Botol Kaca',
        hargaPerKg: 2500,
        poinPerKg: 8,
        jenis: 'KACA',
      },
    });

    // =========================
    // 3 KATALOG HADIAH
    // =========================
    const hadiah1 = await this.prisma.hadiah.create({
      data: {
        namaHadiah: 'Minyak Goreng 1 Liter',
        poinDibutuhkan: 100,
        stok: 50,
      },
    });

    const hadiah2 = await this.prisma.hadiah.create({
      data: {
        namaHadiah: 'Voucher Pulsa Rp 25.000',
        poinDibutuhkan: 150,
        stok: 30,
      },
    });

    const hadiah3 = await this.prisma.hadiah.create({
      data: {
        namaHadiah: 'Tumbler',
        poinDibutuhkan: 200,
        stok: 20,
      },
    });

    // =========================
    // RIWAYAT SETOR
    // =========================
    const setor = await this.prisma.setorSampah.create({
      data: {
        kodeSetor: `STR-SEED-${Date.now()}`,
        tanggal: new Date('2026-08-26T10:00:00.000Z'),
        catatan: 'Sampah sudah dipilah',
        status: 'SELESAI',
        catatanAdmin: 'Berat sesuai timbangan',
        nasabahId: nasabah1.nasabah!.id,
        adminBankId: admin.adminBank!.id,
        detailSetor: {
          create: [
            {
              idKategoriSampah: kategori1.id,
              beratKg: 10,
              subtotalPoin: 100,
            },
            {
              idKategoriSampah: kategori2.id,
              beratKg: 5,
              subtotalPoin: 50,
            },
          ],
        },
      },
    });

    // =========================
    // RIWAYAT PENUKARAN
    // =========================
    await this.prisma.penukaranPoin.create({
      data: {
        kodePenukaran: `TKR-SEED-${Date.now()}`,
        tanggal: new Date('2026-08-27T10:00:00.000Z'),
        nasabahId: nasabah1.nasabah!.id,
        idSetor: setor.id,
        hadiahId: hadiah1.id,
        poinTerpakai: 100,
        status: 'SELESAI',
      },
    });

    return {
      statusCode: 201,
      success: true,
      message: 'Dummy sample data Bank Sampah berhasil dibuat!',
      data: {
        admin: {
          username: admin.username,
          password: 'admin123',
          namaUnit: admin.adminBank?.namaUnit,
        },
        nasabah1: {
          username: nasabah1.username,
          password: 'password123',
          namaNasabah: nasabah1.nasabah?.namaNasabah,
          saldoPoin: 150,
        },
        nasabah2: {
          username: nasabah2.username,
          password: 'password123',
          namaNasabah: nasabah2.nasabah?.namaNasabah,
          saldoPoin: 80,
        },
        kategoriSampahCount: 4,
        hadiahKatalogCount: 3,
      },
    };
  }
}