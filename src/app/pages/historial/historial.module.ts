import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { HistorialPage } from './historial.page';

import { ExpandableComponent } from "../../components/expandable/expandable.component";

const routes: Routes = [
  {
    path: '',
    component: HistorialPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    HistorialPage,
    ExpandableComponent
  ],
  entryComponents: [
    ExpandableComponent
  ]
})
export class HistorialPageModule {}
