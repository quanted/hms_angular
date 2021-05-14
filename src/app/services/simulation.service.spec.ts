import { TestBed } from "@angular/core/testing";

import { SimulationService } from "./simulation.service";

describe("SessionService", () => {
  let service: SimulationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimulationService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
