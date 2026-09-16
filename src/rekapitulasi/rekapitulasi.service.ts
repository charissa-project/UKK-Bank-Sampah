import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RekapitulasiService {
  constructor(private readonly prisma: PrismaService) {}

  private roundNumber(value: number, decimal = 2) {
    return Number(value.toFixed(decimal));
  }

  async getBulanan(bulan: string) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(bulan)) {
      throw new BadRequestException('Format bulan harus YYYY-MM');
    }

    const [tahun, nomorBulan] = bulan.split('-').map(Number);

    const tanggalMulai = new Date(tahun, nomorBulan - 1, 1);
    const tanggalAkhir = new Date(tahun, nomorBulan, 1);

    // Ambil transaksi setor yang sudah selesai pada bulan tersebut
    const setorSampah = await this.prisma.setorSampah.findMany({
      where: {
        tanggal: {
          gte: tanggalMulai,
          lt: tanggalAkhir,
        },
        status: 'SELESAI',
      },
      include: {
        detailSetor: {
          include: {
            kategoriSampah: true,
          },
        },
      },
    });

    // Ambil transaksi penukaran pada bulan tersebut
    const penukaranPoin = await this.prisma.penukaranPoin.findMany({
      where: {
        tanggal: {
          gte: tanggalMulai,
          lt: tanggalAkhir,
        },
      },
    });

    let totalKg = 0;
    let totalEstimasiPembayaranRupiah = 0;
    let totalPoinDiterbitkan = 0;

    const breakdownJenisSampah = {
      plastik: {
        tonaseKg: 0,
        rupiah: 0,
        poin: 0,
      },
      kertas: {
        tonaseKg: 0,
        rupiah: 0,
        poin: 0,
      },
      logam: {
        tonaseKg: 0,
        rupiah: 0,
        poin: 0,
      },
      kaca: {
        tonaseKg: 0,
        rupiah: 0,
        poin: 0,
      },
    };

    for (const setor of setorSampah) {
      for (const detail of setor.detailSetor) {
        const berat = detail.beratKg;
        const harga = detail.kategoriSampah.hargaPerKg;
        const poin = detail.subtotalPoin;

        totalKg += berat;
        totalEstimasiPembayaranRupiah += berat * harga;
        totalPoinDiterbitkan += poin;

        const jenis = detail.kategoriSampah.jenis.toLowerCase();

        if (jenis in breakdownJenisSampah) {
          const key = jenis as keyof typeof breakdownJenisSampah;

          breakdownJenisSampah[key].tonaseKg += berat;
          breakdownJenisSampah[key].rupiah += berat * harga;
          breakdownJenisSampah[key].poin += poin;
        }
      }
    }

    const totalTransaksiPenukaran = penukaranPoin.length;

    const totalPoinTerpakai = penukaranPoin.reduce(
      (total, item) => total + item.poinTerpakai,
      0,
    );

    const totalTon = totalKg / 1000;

    return {
      statusCode: 200,
      success: true,
      message: `Rekapitulasi Bank Sampah Bulan ${nomorBulan}/${tahun} berhasil diambil`,
      data: {
        periode: bulan,

        rekapitulasiTonase: {
          totalKg: this.roundNumber(totalKg),
          totalTon: this.roundNumber(totalTon, 4),
          totalEstimasiPembayaranRupiah: this.roundNumber(
            totalEstimasiPembayaranRupiah,
          ),
          totalPoinDiterbitkan: this.roundNumber(totalPoinDiterbitkan),
        },

        breakdownJenisSampah: {
          plastik: {
            tonaseKg: this.roundNumber(
              breakdownJenisSampah.plastik.tonaseKg,
            ),
            rupiah: this.roundNumber(
              breakdownJenisSampah.plastik.rupiah,
            ),
            poin: this.roundNumber(
              breakdownJenisSampah.plastik.poin,
            ),
          },

          kertas: {
            tonaseKg: this.roundNumber(
              breakdownJenisSampah.kertas.tonaseKg,
            ),
            rupiah: this.roundNumber(
              breakdownJenisSampah.kertas.rupiah,
            ),
            poin: this.roundNumber(
              breakdownJenisSampah.kertas.poin,
            ),
          },

          logam: {
            tonaseKg: this.roundNumber(
              breakdownJenisSampah.logam.tonaseKg,
            ),
            rupiah: this.roundNumber(
              breakdownJenisSampah.logam.rupiah,
            ),
            poin: this.roundNumber(
              breakdownJenisSampah.logam.poin,
            ),
          },

          kaca: {
            tonaseKg: this.roundNumber(
              breakdownJenisSampah.kaca.tonaseKg,
            ),
            rupiah: this.roundNumber(
              breakdownJenisSampah.kaca.rupiah,
            ),
            poin: this.roundNumber(
              breakdownJenisSampah.kaca.poin,
            ),
          },
        },

        rekapitulasiPenukaranPoin: {
          totalTransaksiPenukaran,
          totalPoinTerpakai: this.roundNumber(totalPoinTerpakai),
        },
      },
    };
  }
}