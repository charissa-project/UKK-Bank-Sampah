import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

import {
  CreateSetorSampahDto,
} from './dto/create-setor-sampah.dto.js';

import {
  StatusVerifikasi,
  VerifySetorSampahDto,
} from './dto/verify-setor-sampah.dto.js';

@Injectable()
export class SetorSampahService {
  constructor(private readonly prisma: PrismaService) {}

  private roundNumber(value: number, decimal = 2) {
    return Number(value.toFixed(decimal));
  }

  // Membuat kode setor seperti:
  // STR-202609-1001
  private async generateKodeSetor(tanggal: Date) {
    const tahun = tanggal.getFullYear();
    const bulan = String(tanggal.getMonth() + 1).padStart(2, '0');

    const awalBulan = new Date(tahun, tanggal.getMonth(), 1);
    const akhirBulan = new Date(
      tahun,
      tanggal.getMonth() + 1,
      1,
    );

    const jumlah = await this.prisma.setorSampah.count({
      where: {
        tanggal: {
          gte: awalBulan,
          lt: akhirBulan,
        },
      },
    });

    const nomor = String(jumlah + 1001);

    return `STR-${tahun}${bulan}-${nomor}`;
  }

  // POST /setor-sampah/pengajuan
  async create(
    userId: string,
    dto: CreateSetorSampahDto,
  ) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: {
        userId,
      },
    });

    if (!nasabah) {
      throw new NotFoundException(
        'Data nasabah tidak ditemukan',
      );
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException(
        'Minimal terdapat satu jenis sampah',
      );
    }

    const tanggal = new Date(dto.tanggal);

    if (isNaN(tanggal.getTime())) {
      throw new BadRequestException(
        'Format tanggal tidak valid',
      );
    }

    // Cek semua kategori sampah
    const kategoriIds = dto.items.map(
      (item) => item.kategoriSampahId,
    );

    const kategori = await this.prisma.kategoriSampah.findMany({
      where: {
        id: {
          in: kategoriIds,
        },
      },
    });

    if (kategori.length !== kategoriIds.length) {
      throw new BadRequestException(
        'Terdapat kategori sampah yang tidak ditemukan',
      );
    }

    const kodeSetor = await this.generateKodeSetor(tanggal);

    let totalBeratKg = 0;
    let estimasiTotalPoin = 0;

    const detailData = dto.items.map((item) => {
      const kategoriSampah = kategori.find(
        (k) => k.id === item.kategoriSampahId,
      );

      if (!kategoriSampah) {
        throw new BadRequestException(
          'Kategori sampah tidak ditemukan',
        );
      }

      const beratKg = Number(item.beratKg);

      const subtotalPoin = this.roundNumber(
        beratKg * kategoriSampah.poinPerKg,
      );

      totalBeratKg += beratKg;
      estimasiTotalPoin += subtotalPoin;

      return {
        idKategoriSampah: item.kategoriSampahId,
        beratKg,
        subtotalPoin,
      };
    });

    const setor = await this.prisma.setorSampah.create({
      data: {
        kodeSetor,
        tanggal,
        catatan: dto.catatan,
        status: 'MENUNGGU_KONFIRMASI',
        nasabahId: nasabah.id,

        detailSetor: {
          create: detailData,
        },
      },

      include: {
        detailSetor: true,
      },
    });

    return {
      statusCode: 201,
      success: true,
      message:
        'Pengajuan penyetoran sampah berhasil dibuat',
      data: {
        id: setor.id,
        kodeSetor: setor.kodeSetor,
        tanggal: setor.tanggal,
        status: 'menunggu_konfirmasi',
        totalBeratKg: this.roundNumber(totalBeratKg),
        estimasiTotalPoin: this.roundNumber(estimasiTotalPoin),
        catatan: setor.catatan,

        detailSetors: setor.detailSetor.map((detail) => ({
          kategoriSampahId: detail.idKategoriSampah,
          beratKg: this.roundNumber(detail.beratKg),
          subtotalPoin: this.roundNumber(detail.subtotalPoin),
        })),
      },
    };
  }

  // GET /setor-sampah/my-setor
  async findMySetor(
    userId: string,
    bulan?: string,
  ) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: {
        userId,
      },
    });

    if (!nasabah) {
      throw new NotFoundException(
        'Data nasabah tidak ditemukan',
      );
    }

    const where: any = {
      nasabahId: nasabah.id,
    };

    if (bulan) {
      const [tahun, nomorBulan] = bulan.split('-');

      if (!tahun || !nomorBulan) {
        throw new BadRequestException(
          'Format bulan harus YYYY-MM',
        );
      }

      where.tanggal = {
        gte: new Date(
          Number(tahun),
          Number(nomorBulan) - 1,
          1,
        ),
        lt: new Date(
          Number(tahun),
          Number(nomorBulan),
          1,
        ),
      };
    }

    const setor = await this.prisma.setorSampah.findMany({
      where,
      include: {
        detailSetor: {
          include: {
            kategoriSampah: true,
          },
        },
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    return {
      statusCode: 200,
      success: true,
      message:
        'Histori pengajuan penyetoran sampah berhasil diambil',
      data: setor.map((item) => ({
        id: item.id,
        kodeSetor: item.kodeSetor,
        tanggal: item.tanggal,
        status: this.mapStatusToApi(item.status),

        totalBeratKg: this.roundNumber(
          item.detailSetor.reduce(
            (total, detail) =>
              total + detail.beratKg,
            0,
          ),
        ),

        totalPoin: this.roundNumber(
          item.detailSetor.reduce(
            (total, detail) =>
              total + detail.subtotalPoin,
            0,
          ),
        ),

        catatan: item.catatan,

        detailSetors: item.detailSetor.map(
          (detail) => ({
            kategoriSampahId:
              detail.idKategoriSampah,

            beratKg: this.roundNumber(
              detail.beratKg,
            ),

            subtotalPoin:
              this.roundNumber(
                detail.subtotalPoin,
              ),

            kategoriSampah: {
              namaKategori:
                detail.kategoriSampah.namaKategori,

              jenis: this.mapJenisToApi(
                detail.kategoriSampah.jenis,
              ),
            },
          }),
        ),
      })),
    };
  }

  // GET /setor-sampah/admin/list
  async findAll(
    status?: string,
    bulan?: string,
  ) {
    const where: any = {};

    if (status) {
      const statusMap: Record<string, string> = {
        menunggu_konfirmasi:
          'MENUNGGU_KONFIRMASI',
        diverifikasi: 'DIVERIFIKASI',
        ditolak: 'DITOLAK',
        selesai: 'SELESAI',
      };

      if (!statusMap[status]) {
        throw new BadRequestException(
          'Status tidak valid',
        );
      }

      where.status = statusMap[status];
    }

    if (bulan) {
      const [tahun, nomorBulan] = bulan.split('-');

      if (!tahun || !nomorBulan) {
        throw new BadRequestException(
          'Format bulan harus YYYY-MM',
        );
      }

      where.tanggal = {
        gte: new Date(
          Number(tahun),
          Number(nomorBulan) - 1,
          1,
        ),
        lt: new Date(
          Number(tahun),
          Number(nomorBulan),
          1,
        ),
      };
    }

    const setor = await this.prisma.setorSampah.findMany({
      where,
      include: {
        nasabah: true,
        detailSetor: true,
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    return {
      statusCode: 200,
      success: true,
      message:
        'Seluruh data pengajuan penyetoran sampah berhasil diambil',

      data: setor.map((item) => ({
        id: item.id,
        kodeSetor: item.kodeSetor,
        tanggal: item.tanggal,

        nasabah: {
          namaNasabah: item.nasabah.namaNasabah,
          telp: item.nasabah.telp,
        },

        status: this.mapStatusToApi(item.status),

        totalBeratKg: this.roundNumber(
          item.detailSetor.reduce(
            (total, detail) =>
              total + detail.beratKg,
            0,
          ),
        ),

        totalPoin: this.roundNumber(
          item.detailSetor.reduce(
            (total, detail) =>
              total + detail.subtotalPoin,
            0,
          ),
        ),
      })),
    };
  }

  // GET /setor-sampah/:id
  async findOne(id: string) {
    const setor =
      await this.prisma.setorSampah.findUnique({
        where: {
          id,
        },

        include: {
          nasabah: true,

          detailSetor: {
            include: {
              kategoriSampah: true,
            },
          },
        },
      });

    if (!setor) {
      throw new NotFoundException(
        'Data penyetoran sampah tidak ditemukan',
      );
    }

    return {
      statusCode: 200,
      success: true,
      message:
        'Detail transaksi penyetoran sampah berhasil diambil',

      data: {
        id: setor.id,
        kodeSetor: setor.kodeSetor,
        tanggal: setor.tanggal,
        status: this.mapStatusToApi(setor.status),

        nasabah: {
          namaNasabah: setor.nasabah.namaNasabah,
          alamat: setor.nasabah.alamat,
          telp: setor.nasabah.telp,
        },

        totalBeratKg: this.roundNumber(
          setor.detailSetor.reduce(
            (total, detail) =>
              total + detail.beratKg,
            0,
          ),
        ),

        totalPoin: this.roundNumber(
          setor.detailSetor.reduce(
            (total, detail) =>
              total + detail.subtotalPoin,
            0,
          ),
        ),

        catatanAdmin: setor.catatanAdmin,

        detailSetors: setor.detailSetor.map(
          (detail) => ({
            kategori:
              detail.kategoriSampah.namaKategori,

            jenis: this.mapJenisToApi(
              detail.kategoriSampah.jenis,
            ),

            beratKg: this.roundNumber(
              detail.beratKg,
            ),

            poinPerKg: this.roundNumber(
              detail.kategoriSampah.poinPerKg,
            ),

            subtotalPoin: this.roundNumber(
              detail.subtotalPoin,
            ),
          }),
        ),
      },
    };
  }

  // PUT /setor-sampah/admin/verify/:id
  async verify(
    id: string,
    userId: string,
    dto: VerifySetorSampahDto,
  ) {
    const setor =
      await this.prisma.setorSampah.findUnique({
        where: {
          id,
        },

        include: {
          detailSetor: true,
          nasabah: true,
        },
      });

    if (!setor) {
      throw new NotFoundException(
        'Data penyetoran sampah tidak ditemukan',
      );
    }

    const admin = await this.prisma.adminBank.findUnique({
      where: {
        userId,
      },
    });

    if (!admin) {
      throw new NotFoundException(
        'Data admin bank tidak ditemukan',
      );
    }

    // Kalau ada data timbangan real,
    // update berat dan poin masing-masing item.
    if (dto.itemsReal) {
      for (const itemReal of dto.itemsReal) {
        const detail = setor.detailSetor.find(
          (d) =>
            d.idKategoriSampah ===
            itemReal.kategoriSampahId,
        );

        if (!detail) {
          throw new BadRequestException(
            'Kategori sampah pada timbangan real tidak ada dalam pengajuan',
          );
        }

        const kategori =
          await this.prisma.kategoriSampah.findUnique({
            where: {
              id: itemReal.kategoriSampahId,
            },
          });

        if (!kategori) {
          throw new NotFoundException(
            'Kategori sampah tidak ditemukan',
          );
        }

        const beratReal = Number(
          itemReal.beratKgReal,
        );

        const subtotalPoin = this.roundNumber(
          beratReal * kategori.poinPerKg,
        );

        await this.prisma.detailSetor.update({
          where: {
            id: detail.id,
          },

          data: {
            beratKg: beratReal,
            subtotalPoin,
          },
        });
      }
    }

    const updatedDetails =
      await this.prisma.detailSetor.findMany({
        where: {
          idSetor: setor.id,
        },
      });

    const totalPoin = this.roundNumber(
      updatedDetails.reduce(
        (total, detail) =>
          total + detail.subtotalPoin,
        0,
      ),
    );

    const previousStatus = setor.status;

    const statusMap = {
      diverifikasi: 'DIVERIFIKASI',
      ditolak: 'DITOLAK',
      selesai: 'SELESAI',
    } as const;

    const updated =
      await this.prisma.setorSampah.update({
        where: {
          id,
        },

        data: {
          status: statusMap[dto.status],
          catatanAdmin: dto.catatanAdmin,
          adminBankId: admin.id,
        },

        include: {
          detailSetor: true,
        },
      });

    // Saldo poin hanya ditambahkan ketika status menjadi
    // SELESAI dan sebelumnya belum SELESAI.
    if (
      dto.status === StatusVerifikasi.SELESAI &&
      previousStatus !== 'SELESAI'
    ) {
      await this.prisma.nasabah.update({
        where: {
          id: setor.nasabahId,
        },

        data: {
          saldoPoin: {
            increment: totalPoin,
          },
        },
      });
    }

    return {
      statusCode: 200,
      success: true,
      message:
        'Pengajuan penyetoran sampah berhasil diverifikasi',

      data: {
        id: updated.id,
        kodeSetor: updated.kodeSetor,
        status: dto.status,
        catatanAdmin: updated.catatanAdmin,
        totalPoin: this.roundNumber(totalPoin),

        detailSetors: updated.detailSetor.map(
          (detail) => ({
            kategoriSampahId:
              detail.idKategoriSampah,

            beratKg: this.roundNumber(
              detail.beratKg,
            ),

            subtotalPoin: this.roundNumber(
              detail.subtotalPoin,
            ),
          }),
        ),
      },
    };
  }

  private mapStatusToApi(status: string) {
    const statusMap: Record<string, string> = {
      MENUNGGU_KONFIRMASI:
        'menunggu_konfirmasi',
      DIVERIFIKASI: 'diverifikasi',
      DITOLAK: 'ditolak',
      SELESAI: 'selesai',
    };

    return statusMap[status] ?? status;
  }

  private mapJenisToApi(jenis: string) {
    const jenisMap: Record<string, string> = {
      PLASTIK: 'plastik',
      KERTAS: 'kertas',
      LOGAM: 'logam',
      KACA: 'kaca',
    };

    return jenisMap[jenis] ?? jenis;
  }
}