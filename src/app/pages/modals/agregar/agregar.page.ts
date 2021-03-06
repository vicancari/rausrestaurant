import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AgregartarjetaPage } from '../agregartarjeta/agregartarjeta.page';
import { AgregarconfirmarPage } from '../agregarconfirmar/agregarconfirmar.page';
import { CreditCardService } from 'src/app/services/credit-card.service';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AgregarPage implements OnInit {

  data:any;
  value = '';
  public sum : number = 0;
  // public total(items){
  //   this.sum = 0;
  //   for(let i = 0; i<this.items.length; i++){
  //     this.sum = this.sum + this.items[i];    
  //   }
  //   return this.sum;
  // }
  erroMessage = '';

  // fontSize='32';


  constructor(private modalCtrl: ModalController , private creditCardService:CreditCardService) { }

  ngOnInit() {
    this.creditCardService.read_Items().then(data => {
       data.subscribe(e => {
        this.data = e;
        console.log(this.data);
      })
    });
  }

  async openAgregarTarjeta() {
    if(this.value == '0,00' || this.value == '0') {
      this.erroMessage = 'Debe ingresar el monto a recargar';
    } else {
      await this.modalCtrl.dismiss();
      const modal = await this.modalCtrl.create({
        component: AgregartarjetaPage,
        cssClass: 'sizeModalAgregarTajerta',
        backdropDismiss:false,
      });
      await modal.present();
    }
  }

  async openConfirmarAgregar(cardID) {
    console.log(this.value);
    if(this.value == '0,00' || this.value == '0') {
      this.erroMessage = 'Debe ingresar el monto a recargar';
    } else {
      this.erroMessage = '';
      await this.modalCtrl.dismiss();
      const modal = await this.modalCtrl.create({
        component: AgregarconfirmarPage,
        componentProps:{
          value: this.value,
          cardID:cardID
        },
        cssClass: 'sizeModalConfirmacion',
        backdropDismiss:false,
      });
      modal.onDidDismiss().then(data =>{
        this.value = null;
      });
      await modal.present();
    }
  }

  RemoveRecord(rowID){
    this.creditCardService.delete_Item(rowID);
  }

  inputSize(){
    // var x=document.getElementById("inputTarjetaValue");
    //     var initialSize= 25-this.value.length;
    //     initialSize=initialSize<=10?10:initialSize;
    // x.style.fontSize = initialSize + "px";

    // if (this.value.length >= 4 ){
    //   this.fontSize = '20';
    // }
    }

    async closeModal() {
    await this.modalCtrl.dismiss();
  }

  decimal(event){
    if(this.value.length == 0){
      if(event.key == '0') {
        event.preventDefault();
        // this.value = '0,00';
      }
      // else{
      //   this.value = '0,0'+this.value;
      // }
    }
    // else if(this.value.length > 4){
      
    //   console.log(this.value);
    // }
    
  }

}
