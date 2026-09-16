require('dotenv/config');

const fs = require('fs');
const path = require('path');

const { v2: cloudinary } = require('cloudinary');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

function uploadImage(filePath, folder, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result.secure_url);
      },
    );
  });
}

function getLocalFilePath(foto) {
  if (!foto) return null;

  // Contoh:
  // /uploads/hadiah/pin.jpg
  // /uploads/kategori-sampah/plastik.jpg

  const cleanPath = foto.replace(/^[/\\]+/, '');

  return path.join(process.cwd(), cleanPath);
}

function getPublicId(foto) {
  const fileName = path.basename(foto);
  return path.parse(fileName).name;
}

async function migrateHadiah() {
  console.log('\n========================================');
  console.log('MIGRASI FOTO HADIAH');
  console.log('========================================');

  const hadiahList = await prisma.hadiah.findMany({
    where: {
      foto: {
        not: null,
      },
    },
  });

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const hadiah of hadiahList) {
    const foto = hadiah.foto;

    // Sudah Cloudinary → skip
    if (foto.startsWith('https://res.cloudinary.com/')) {
      console.log(`SKIP  : ${hadiah.namaHadiah} → sudah Cloudinary`);
      skipped++;
      continue;
    }

    const localPath = getLocalFilePath(foto);

    if (!localPath || !fs.existsSync(localPath)) {
      console.log(`GAGAL : ${hadiah.namaHadiah}`);
      console.log(`       File tidak ditemukan: ${localPath}`);
      failed++;
      continue;
    }

    try {
      const publicId = getPublicId(foto);

      console.log(`UPLOAD: ${hadiah.namaHadiah}`);
      console.log(`       File: ${localPath}`);

      const cloudinaryUrl = await uploadImage(
        localPath,
        'bank-sampah/hadiah',
        publicId,
      );

      await prisma.hadiah.update({
        where: {
          id: hadiah.id,
        },
        data: {
          foto: cloudinaryUrl,
        },
      });

      console.log(`BERHASIL: ${cloudinaryUrl}`);
      migrated++;
    } catch (error) {
      console.log(`GAGAL : ${hadiah.namaHadiah}`);
      console.log(`       ${error.message}`);
      failed++;
    }
  }

  console.log('\nHasil Hadiah:');
  console.log(`  Berhasil : ${migrated}`);
  console.log(`  Dilewati : ${skipped}`);
  console.log(`  Gagal    : ${failed}`);
}

async function migrateKategoriSampah() {
  console.log('\n========================================');
  console.log('MIGRASI FOTO KATEGORI SAMPAH');
  console.log('========================================');

  const kategoriList = await prisma.kategoriSampah.findMany({
    where: {
      foto: {
        not: null,
      },
    },
  });

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const kategori of kategoriList) {
    const foto = kategori.foto;

    // Sudah Cloudinary → skip
    if (foto.startsWith('https://res.cloudinary.com/')) {
      console.log(`SKIP  : ${kategori.namaKategori} → sudah Cloudinary`);
      skipped++;
      continue;
    }

    const localPath = getLocalFilePath(foto);

    if (!localPath || !fs.existsSync(localPath)) {
      console.log(`GAGAL : ${kategori.namaKategori}`);
      console.log(`       File tidak ditemukan: ${localPath}`);
      failed++;
      continue;
    }

    try {
      const publicId = getPublicId(foto);

      console.log(`UPLOAD: ${kategori.namaKategori}`);
      console.log(`       File: ${localPath}`);

      const cloudinaryUrl = await uploadImage(
        localPath,
        'bank-sampah/kategori-sampah',
        publicId,
      );

      await prisma.kategoriSampah.update({
        where: {
          id: kategori.id,
        },
        data: {
          foto: cloudinaryUrl,
        },
      });

      console.log(`BERHASIL: ${cloudinaryUrl}`);
      migrated++;
    } catch (error) {
      console.log(`GAGAL : ${kategori.namaKategori}`);
      console.log(`       ${error.message}`);
      failed++;
    }
  }

  console.log('\nHasil Kategori Sampah:');
  console.log(`  Berhasil : ${migrated}`);
  console.log(`  Dilewati : ${skipped}`);
  console.log(`  Gagal    : ${failed}`);
}

async function main() {
  console.log('\n========================================');
  console.log('MIGRASI FOTO LOKAL → CLOUDINARY');
  console.log('========================================');

  console.log(`Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);

  try {
    await prisma.$connect();

    await migrateHadiah();
    await migrateKategoriSampah();

    console.log('\n========================================');
    console.log('MIGRASI SELESAI');
    console.log('========================================');
    console.log('File lokal TIDAK dihapus.');
  } catch (error) {
    console.error('\nMIGRASI GAGAL:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();