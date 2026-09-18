import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePenukaranPoinDto } from './dto/create-penukaran-poin.dto.js';
import {
  StatusPenukaranApi,
  UpdateStatusPenukaranDto,
} from './dto/update-status-penukaran.dto.js';
import PDFDocument from 'pdfkit';

@Injectable()
export class PenukaranPoinService {
  constructor(private readonly prisma: PrismaService) {}

  private roundNumber(value: number, decimal = 2) {
    return Number(value.toFixed(decimal));
  }

  private async generateKodePenukaran(tanggal: Date) {
    const tahun = tanggal.getFullYear();
    const bulan = String(tanggal.getMonth() + 1).padStart(2, '0');

    const awalBulan = new Date(tahun, tanggal.getMonth(), 1);
    const akhirBulan = new Date(tahun, tanggal.getMonth() + 1, 1);

    const jumlah = await this.prisma.penukaranPoin.count({
      where: {
        tanggal: {
          gte: awalBulan,
          lt: akhirBulan,
        },
      },
    });

    const nomor = String(jumlah + 5001);

    return `TKR-${tahun}${bulan}-${nomor}`;
  }

  async create(userId: string, dto: CreatePenukaranPoinDto) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: { userId },
    });

    if (!nasabah) {
      throw new NotFoundException(
        'Data nasabah tidak ditemukan',
      );
    }

    const hadiah = await this.prisma.hadiah.findUnique({
      where: { id: dto.hadiahId },
    });

    if (!hadiah) {
      throw new NotFoundException(
        'Hadiah tidak ditemukan',
      );
    }

    if (hadiah.stok <= 0) {
      throw new BadRequestException(
        'Stok hadiah sudah habis',
      );
    }

    if (nasabah.saldoPoin < hadiah.poinDibutuhkan) {
      throw new BadRequestException(
        `Saldo poin Anda (${nasabah.saldoPoin} poin) tidak mencukupi untuk menukar hadiah ini (${hadiah.poinDibutuhkan} poin).`,
      );
    }

    const tanggal = new Date();
    const kodePenukaran =
      await this.generateKodePenukaran(tanggal);

    const hasil = await this.prisma.$transaction(async (tx) => {
      const updatedNasabah = await tx.nasabah.update({
        where: { id: nasabah.id },
        data: {
          saldoPoin: {
            decrement: hadiah.poinDibutuhkan,
          },
        },
      });

      const updatedHadiah = await tx.hadiah.update({
        where: { id: hadiah.id },
        data: {
          stok: {
            decrement: 1,
          },
        },
      });

      const penukaran =
        await tx.penukaranPoin.create({
          data: {
            kodePenukaran,
            tanggal,
            nasabahId: nasabah.id,
            hadiahId: hadiah.id,
            poinTerpakai: hadiah.poinDibutuhkan,
            status: 'DIPROSES',
          },
        });

      return {
        penukaran,
        saldoPoin: updatedNasabah.saldoPoin,
        hadiah: updatedHadiah,
      };
    });

    return {
      statusCode: 201,
      success: true,
      message: 'Penukaran poin berhasil diajukan',
      data: {
        id: hasil.penukaran.id,
        kodePenukaran: hasil.penukaran.kodePenukaran,
        tanggal: hasil.penukaran.tanggal,
        hadiahId: hasil.penukaran.hadiahId,
        poinTerpakai: this.roundNumber(
          hasil.penukaran.poinTerpakai,
        ),
        sisaSaldoPoin: this.roundNumber(
          hasil.saldoPoin,
        ),
        status: 'diproses',
        hadiah: {
          namaHadiah: hasil.hadiah.namaHadiah,
        },
      },
    };
  }

  async findMyPenukaran(userId: string) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: { userId },
    });

    if (!nasabah) {
      throw new NotFoundException(
        'Data nasabah tidak ditemukan',
      );
    }

    const data = await this.prisma.penukaranPoin.findMany({
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

    return {
      statusCode: 200,
      success: true,
      message:
        'Histori penukaran poin nasabah berhasil diambil',
      data: data.map((item) => ({
        id: item.id,
        kodePenukaran: item.kodePenukaran,
        tanggal: item.tanggal,
        poinTerpakai: this.roundNumber(
          item.poinTerpakai,
        ),
        status: this.mapStatusToApi(item.status),
        hadiah: {
          namaHadiah: item.hadiah.namaHadiah,
          poinDibutuhkan: this.roundNumber(
            item.hadiah.poinDibutuhkan,
          ),
        },
      })),
    };
  }

  async findAll(bulan?: string) {
    const where: any = {};

    if (bulan) {
      const [tahun, nomorBulan] = bulan.split('-');

      if (
        !tahun ||
        !nomorBulan ||
        Number(nomorBulan) < 1 ||
        Number(nomorBulan) > 12
      ) {
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

    const data = await this.prisma.penukaranPoin.findMany({
      where,
      include: {
        nasabah: true,
        hadiah: true,
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    return {
      statusCode: 200,
      success: true,
      message:
        'Seluruh transaksi penukaran poin berhasil diambil',
      data: data.map((item) => ({
        id: item.id,
        kodePenukaran: item.kodePenukaran,
        tanggal: item.tanggal,
        nasabah: {
          namaNasabah: item.nasabah.namaNasabah,
          telp: item.nasabah.telp,
        },
        hadiah: {
          namaHadiah: item.hadiah.namaHadiah,
          poinDibutuhkan: this.roundNumber(
            item.hadiah.poinDibutuhkan,
          ),
        },
        poinTerpakai: this.roundNumber(
          item.poinTerpakai,
        ),
        status: this.mapStatusToApi(item.status),
      })),
    };
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusPenukaranDto,
  ) {
    const existing =
      await this.prisma.penukaranPoin.findUnique({
        where: { id },
      });

    if (!existing) {
      throw new NotFoundException(
        'Transaksi penukaran poin tidak ditemukan',
      );
    }

    const statusMap = {
      diproses: 'DIPROSES',
      selesai: 'SELESAI',
    } as const;

    const updated =
      await this.prisma.penukaranPoin.update({
        where: { id },
        data: {
          status: statusMap[dto.status],
        },
      });

    return {
      statusCode: 200,
      success: true,
      message:
        'Status transaksi penukaran poin berhasil diperbarui',
      data: {
        id: updated.id,
        status: dto.status,
      },
    };
  }

  async findNota(id: string): Promise<Buffer> {
  const data = await this.prisma.penukaranPoin.findUnique({
    where: { id },
    include: {
      nasabah: true,
      hadiah: true,
    },
  });

  if (!data) {
    throw new NotFoundException(
      'Transaksi penukaran poin tidak ditemukan',
    );
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A5',
      margin: 40,
    });

    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => {
      buffers.push(chunk);
    });

    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });

    doc.on('error', reject);

    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('BANK SAMPAH', {
        align: 'center',
      });

    doc
      .fontSize(12)
      .font('Helvetica')
      .text('NOTA PENUKARAN POIN', {
        align: 'center',
      });

    doc.moveDown();

    doc
      .fontSize(10)
      .text('================================');

    doc.moveDown(0.5);

    doc
      .font('Helvetica-Bold')
      .text(`Kode Penukaran : ${data.kodePenukaran}`);

    doc
      .font('Helvetica')
      .text(
        `Tanggal        : ${data.tanggal.toLocaleDateString(
          'id-ID',
        )}`,
      );

    doc.moveDown();

    doc
      .font('Helvetica-Bold')
      .text('DATA NASABAH');

    doc
      .font('Helvetica')
      .text(
        `Nama           : ${data.nasabah.namaNasabah}`,
      );

    doc.text(
      `Telepon        : ${data.nasabah.telp}`,
    );

    doc.moveDown();

    doc
      .font('Helvetica-Bold')
      .text('DATA PENUKARAN');

    doc
      .font('Helvetica')
      .text(
        `Hadiah         : ${data.hadiah.namaHadiah}`,
      );

    doc.text(
      `Poin Terpakai  : ${this.roundNumber(
        data.poinTerpakai,
      )} poin`,
    );

    doc.text(
      `Status         : ${this.mapStatusToApi(
        data.status,
      )}`,
    );

    doc.moveDown();

    doc
      .fontSize(10)
      .text('================================');

    doc.moveDown();

    doc
      .fontSize(11)
      .text('Terima kasih telah menggunakan layanan', {
        align: 'center',
      });

    doc.text('Bank Sampah.', {
      align: 'center',
    });

    doc.end();
  });
}

  private mapStatusToApi(status: string) {
    const statusMap: Record<string, string> = {
      DIPROSES: 'diproses',
      SELESAI: 'selesai',
    };

    return statusMap[status] ?? status;
  }
}