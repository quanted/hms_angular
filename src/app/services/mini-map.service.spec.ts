import { TestBed } from '@angular/core/testing';

import { MiniMapService } from './mini-map.service';

describe('MiniMapService', () => {
  let service: MiniMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MiniMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
