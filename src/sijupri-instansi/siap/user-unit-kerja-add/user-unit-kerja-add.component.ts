import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserUnitKerja } from '../../../modules/siap/models/user-unit-kerja.model';
import { Router } from '@angular/router';
import { UnitKerjaService } from '../../../modules/maintenance/services/unit-kerja.service';
import { UserUnitKerjaService } from '../../../modules/siap/services/user-unit-kerja.service';
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model';

@Component({
  selector: 'app-user-unit-kerja-add',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-unit-kerja-add.component.html',
  styleUrl: './user-unit-kerja-add.component.scss'
})
export class UserUnitKerjaAddComponent {
  userUnitKerja: UserUnitKerja = new UserUnitKerja();
  unitKerjaList: UnitKerja[];

  constructor(
    private unitKerjaService: UnitKerjaService,
    private userUnitKerjaService: UserUnitKerjaService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getUnitKerjaList();
  }

  getUnitKerjaList() {
    this.unitKerjaService.findAll().subscribe({
      next: (unitKerjaList: UnitKerja[]) => this.unitKerjaList = unitKerjaList
    })
  }

  submit() {
    this.userUnitKerjaService.save(this.userUnitKerja).subscribe({
      next: () => this.router.navigate(['/siap/user-unit-kerja'])
    })
  }
}
