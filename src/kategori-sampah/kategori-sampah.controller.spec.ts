import { Test, TestingModule } from '@nestjs/testing';
import { KategoriSampahController } from './kategori-sampah.controller.js';

describe('KategoriSampahController', () => {
  let controller: KategoriSampahController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KategoriSampahController],
    }).compile();

    controller = module.get<KategoriSampahController>(KategoriSampahController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
