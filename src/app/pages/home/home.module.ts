import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';

import { HorariosPage } from '../modals/horarios/horarios.page';
import { ModalAddproductPage } from '../modals/modal-addproduct/modal-addproduct.page';

import { EditavatarPage } from '../modals/editavatar/editavatar.page';
import { EditdireccionPage } from '../modals/editdireccion/editdireccion.page';


import { SharedModule } from '../sharedmodals/shared.module';





const routes: Routes = [
  {
    path: '',
    component: HomePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    HomePage,
    HorariosPage,
    EditavatarPage,
    ModalAddproductPage,
    EditdireccionPage,
  ],
  entryComponents: [
    HorariosPage,
    EditavatarPage,
    ModalAddproductPage,
    EditdireccionPage,
  ]
})
export class HomePageModule {}
