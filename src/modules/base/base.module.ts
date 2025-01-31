import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { QRCodeModule } from 'angularx-qrcode'

@NgModule({
  declarations: [],
  imports: [CommonModule, QRCodeModule],
  providers: [HttpClientModule]
})
export class BaseModule {}
