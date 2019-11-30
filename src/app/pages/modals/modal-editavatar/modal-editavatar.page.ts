import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModalController, Platform, NavParams } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Camera, CameraOptions } from '@ionic-native/Camera/ngx';
import { AuthService } from 'src/app/services/auth.service';

const STORAGE_KEY = 'my_images';
@Component({
  selector: 'app-modal-editavatar',
  templateUrl: './modal-editavatar.page.html',
  styleUrls: ['./modal-editavatar.page.scss'],
})
export class ModalEditavatarPage implements OnInit {

  public value:any = 'assets/img/avatar.png';
  aImages: any = [{image: 'assets/img/avatar.png'}];
  avatar = 'assets/img/avatar.png';
  image;
  public type = this.navParams.get('type');
  id;

  images = [];

  constructor(private modalCtrl: ModalController, private storage: Storage,private camera: Camera,private authService: AuthService, public platform: Platform, public navParams: NavParams,
    ) { }

  ngOnInit() {
    this.storage.get('avatar').then(res =>{
      console.log(res);
      if(res)
        this.avatar = res;
      console.log(this.avatar);
    });

    console.log(this.avatar);
    console.log(this.aImages[0].image);

  }

  async closeModal() {
    await this.modalCtrl.dismiss();
  }

 pickImage(type) {
   
    // let destinationType = this.camera.DestinationType.FILE_URI;
    // if(this.platform.is('ios')){
    //   destinationType = this.camera.DestinationType.NATIVE_URI;
    // }
    const options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      // destinationType: destinationType,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.aImages = {image:base64Image} ;
      if(type == 'create'){
        this.authService.createAvatar(this.aImages).then((response) => {
          response.subscribe((data) => {
            console.log(data);
            this.storage.set('avatar',data);
            this.getAvatar(data.id);
        }, err => {
            console.error(err);
          });
       });
      }else{
        this.authService.updateAvatar(this.id,this.aImages).then((response) => {
          response.subscribe((data) => {
            console.log(data);
            this.storage.set('avatar',data);
            this.getAvatar(data.id);
        }, err => {
            console.error(err);
          });
       });
      }
    
    }, (err) => {
      // Handle error
    });
  }

  getAvatar(id){
    this.authService.getAvatar(id).then(response => {
      response.subscribe((data) => {
        this.avatar = data.image;
        console.log(this.avatar);
     }, err => {
      console.log(err);
    });
    });
  }

}
