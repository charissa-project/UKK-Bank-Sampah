import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private roundNumber(value: number, decimal = 2) {
    return Number(value.toFixed(decimal));
  }

  async getSummary(userId: string) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: { userId },
    });

    if (!nasabah) {
      throw new NotFoundException('Data nasabah tidak ditemukan');
    }

    const setorSampah = await this.prisma.setorSampah.findMany({
      where: {
        nasabahId: nasabah.id,
        status: 'SELESAI',
      },
      include: {
        detailSetor: true,
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    const penukaranPoin = await this.prisma.penukaranPoin.findMany({
      where: {
        nasabahId: nasabah.id,
      },
      include: {
        hadiah: true,
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    let totalSampahDisetorKg = 0;
    let totalPoinDidapat = 0;

    for (const setor of setorSampah) {
      for (const detail of setor.detailSetor) {
        totalSampahDisetorKg += detail.beratKg;
        totalPoinDidapat += detail.subtotalPoin;
      }
    }

    let totalPoinDitukar = 0;

    for (const penukaran of penukaranPoin) {
      totalPoinDitukar += penukaran.poinTerpakai;
    }

    const setorTerakhir = setorSampah[0] ?? null;
    const tukarTerakhir = penukaranPoin[0] ?? null;

    let transaksiTerakhirSetor = null;

    if (setorTerakhir) {
      const beratKg = setorTerakhir.detailSetor.reduce(
        (total, detail) => total + detail.beratKg,
        0,
      );

      const poin = setorTerakhir.detailSetor.reduce(
        (total, detail) => total + detail.subtotalPoin,
        0,
      );

      transaksiTerakhirSetor = {
        kodeSetor: setorTerakhir.kodeSetor,
        tanggal: setorTerakhir.tanggal,
        beratKg: this.roundNumber(beratKg),
        poin: this.roundNumber(poin),
        status: 'selesai',
      };
    }

    let transaksiTerakhirTukar = null;

    if (tukarTerakhir) {
      transaksiTerakhirTukar = {
        kodePenukaran: tukarTerakhir.kodePenukaran,
        tanggal: tukarTerakhir.tanggal,
        hadiah: tukarTerakhir.hadiah.namaHadiah,
        poin: this.roundNumber(tukarTerakhir.poinTerpakai),
        status: this.mapStatusPenukaran(tukarTerakhir.status),
      };
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Data dashboard nasabah berhasil diambil',
      data: {
        saldoPoinSaatIni: this.roundNumber(nasabah.saldoPoin),
        totalSampahDisetorKg: this.roundNumber(totalSampahDisetorKg),
        totalPoinDidapat: this.roundNumber(totalPoinDidapat),
        totalPoinDitukar: this.roundNumber(totalPoinDitukar),
        transaksiTerakhirSetor,
        transaksiTerakhirTukar,
      },
    };
  }

  async getStats() {
    const totalNasabah = await this.prisma.nasabah.count();

    const totalKategoriSampah =
      await this.prisma.kategoriSampah.count();

    const totalTransaksiSetor =
      await this.prisma.setorSampah.count();

    const totalHadiah = await this.prisma.hadiah.count();

    const setorSampah = await this.prisma.setorSampah.findMany({
      where: {
        status: 'SELESAI',
      },
      include: {
        detailSetor: true,
      },
    });

    let totalBeratSampahKg = 0;
    let totalPoinTersalurkan = 0;

    for (const setor of setorSampah) {
      for (const detail of setor.detailSetor) {
        totalBeratSampahKg += detail.beratKg;
        totalPoinTersalurkan += detail.subtotalPoin;
      }
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Data statistik dashboard berhasil diambil',
      data: {
        totalNasabah,
        totalKategoriSampah,
        totalTransaksiSetor,
        totalHadiah,
        totalBeratSampahKg: this.roundNumber(totalBeratSampahKg),
        totalPoinTersalurkan: this.roundNumber(totalPoinTersalurkan),
      },
    };
  }

  private mapStatusPenukaran(status: string) {
    const statusMap: Record<string, string> = {
      DIPROSES: 'diproses',
      SELESAI: 'selesai',
    };

    return statusMap[status] ?? status;
  }
}