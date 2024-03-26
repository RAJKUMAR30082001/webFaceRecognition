import { TestBed } from '@angular/core/testing';

import { StudentCouchService } from './student-couch.service';

describe('StudentCouchService', () => {
  let service: StudentCouchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentCouchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
