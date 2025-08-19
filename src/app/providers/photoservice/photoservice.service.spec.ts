import { TestBed } from '@angular/core/testing';

import { PhotoService } from './photoservice.service';

describe('PhotoserviceService', () => {
  let service: PhotoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
