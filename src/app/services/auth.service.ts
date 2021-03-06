import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Restaurant } from '../models/restaurant';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import {  Observable, throwError } from 'rxjs';
import { Storage } from '@ionic/storage';
import { LoadingService } from './loading.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  	private snapshotChangesSubscription: any;

	url = environment.url;
	token: string;
	uid;
	direction;
  
	// Http Options
	httpOptions = {
		headers: new HttpHeaders({
		'Content-Type': 'application/json'
		})
	}

	// Handle API errors
	handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			// A client-side or network error occurred. Handle it accordingly.
			console.error('An error occurred:', error.error.message);
		} else {
			// The backend returned an unsuccessful response code.
			// The response body may contain clues as to what went wrong,
			console.error(
				`Backend returned code ${error.status}, ` +
				`body was: ${error.error}`);
		}
		// return an observable with a user-facing error message
		return throwError(
		'Something bad happened; please try again later.');
	};


  	constructor(
		private http: HttpClient,
		private storage: Storage,
		public loading: LoadingService,
		private afs: AngularFirestore,
		public afAuth: AngularFireAuth,
	) {}

	registerUser(value): Observable<Restaurant>{
		this.loading.showLoader();
		console.log(value);
		value.categories = [];
		if(value.tags){
			for (let index = 0; index < value.tags.length; index++) {
				// delete value.tags[index].value;
				console.log(value.tags[index]);
				value.categories.push( {name: value.tags[index].display });
				// delete value.tags[index].display;
			}
		}

		delete value.address;
		delete value.tags;
		
		return this.http.post<Restaurant>(`${this.url}restaurants`, JSON.stringify(value), this.httpOptions)
		.pipe(
			catchError(e => {
				this.loading.hideLoader();
				return throwError(e);
			})
		)
	}
  
	loginUser(value){
		this.loading.showLoader();
		return new Promise<any>((resolve, reject) => {
			firebase.auth().signInWithEmailAndPassword(value.username, value.password)
			.then(
				res => {     
					this.loading.hideLoader();    
					resolve(res)
				},
				err =>{ 
					this.loading.hideLoader();
					console.log('login auth service error'+ err) ; 
					reject(err) ;
				}
			)
		})
	}

	getToken(value): Observable<any>{
		return this.http.post(`${this.url}auth/login`, JSON.stringify({uid:value}), this.httpOptions)
		.pipe(
			catchError(e => {
				console.error(e);
				throw new Error(e);
			})
		)
	}
  
	logoutUser(){
		return new Promise((resolve, reject) => {
			if(firebase.auth().currentUser){
				firebase.auth().signOut()
				.then(() => {
					this.storage.clear();
					console.log("LOG Out");
					resolve();
				}).catch((error) => {
					reject();
				});
			}
		})
	}
  
	userDetails(){
		return firebase.auth().currentUser;
	}

	async getProfile(): Promise<any> {
		await this.storage.get('_token').then(res=>{
			this.token = res.token;
		});

		await this.storage.get('_uid').then(res=>{
			this.uid = res;
		});

		return this.http.get(this.url+'restaurants/'+this.uid,{
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'Authorization': this.token,
			})
		}).pipe(
			catchError(this.handleError)
		);
	}

	async me(): Promise <any>{
		await this.storage.get('_token').then(res=>{
			this.token = res.token;
		});
		await this.storage.get('_uid').then(res=>{
			this.uid = res;
		});
		return this.http.get(this.url+'auth/me/'+this.uid,{
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				'Authorization': this.token,
			}),
			// params:{
			// 	id : this.uid,
			// }
		}).pipe(
			catchError(this.handleError)
		)
	}

	async updateProfile(item): Promise<any> {
		await this.storage.get('_token').then(res=>{
			this.token = res.token;
		});

		await this.storage.get('_uid').then(res=>{
			this.uid = res;
		});

		let data = {
			uid : this.uid,
			business_name: item.business_name,
			lat: '40',
			lng: '-49.00012',
			phone: item.phone,
		}

		return this.http.put<Restaurant>(this.url+'restaurants/update/', JSON.stringify(data),{
			headers: new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': this.token,
			})
		}).pipe(
			catchError(this.handleError)
		)
	}

	async updateAddress(item): Promise<any>{
		console.log(item);
		await this.storage.get('direction').then((data)=>{
			console.log(data);
			if(data){
			  data.extra.lines.pop();
			  this.direction = data;
			}else{
			  console.log('no posee direction');
			  this.direction = item;
			}
		});

		  await this.storage.get('_uid').then(res=>{
			this.uid = res;
		});

		let data = {
			uid: this.uid,
			direction : {
				street: item.street,
				lat: this.direction.position.lat.toString(),
				lng: this.direction.position.lng.toString(),
				zipcode: this.direction.postalCode,
				city: this.direction.locality,
				state: this.direction.adminArea,
				country: this.direction.country,
			  }
		};

		console.log(data);

		return this.http.put<Restaurant>(this.url+'restaurants/update/direction', JSON.stringify(data),{
			headers: new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': this.token,
			})
		}).pipe(
			catchError(this.handleError)
		)
	}

    updateAvatar(record): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			let currentUser = firebase.auth().currentUser.uid;
			console.log(this.token);

			let data = {
				uid: currentUser,
				img: record.image
			}

			this.http.put(this.url + 'users/photo', JSON.stringify(data),{
				headers: new HttpHeaders({
					'Content-Type': 'application/json',
					'Authorization': this.token,
				})
			}).subscribe( 
				res => resolve(res),
				err => reject(err)
			);

			/* this.afs.collection('restaurantes').doc(currentUser).collection('avatar').doc('imagen').set(record)
			.then(
				res => resolve(res),
				err => reject(err)
			) */
    	})
 	}

	createAvatar(record) {
		 return new Promise<any>((resolve, reject) => {
			let currentUser = firebase.auth().currentUser;

			let data = {
				uid: currentUser,
				img: record
			}

			this.http.put(this.url + 'users/photo', JSON.stringify(data),{
				headers: new HttpHeaders({
					'Content-Type': 'application/json',
					'Authorization': this.token,
				})
			}).subscribe( 
				res => resolve(res),
				err => reject(err)
			);

			/*let currentUser = firebase.auth().currentUser;
			console.log(currentUser);

			this.afs.collection('restaurantes').doc(currentUser.uid).collection('avatar').doc('imagen').set(record)
			.then(
				res => resolve(res),
				err => reject(err)
			) */
		});
	}
	
	readAvatar() {
		return new Promise<any>((resolve, reject) => {
			this.afAuth.user.subscribe(currentUser => {
				if(currentUser){
					this.snapshotChangesSubscription = this.afs.collection('restaurantes').doc(currentUser.uid).collection('avatar').snapshotChanges();
					resolve(this.snapshotChangesSubscription);
				}
			})
		})
	}

	getAvatar(){
		return new Promise<any>((resolve, reject) => {
			this.afAuth.user.subscribe(currentUser => {
				if(currentUser){
					this.snapshotChangesSubscription = this.afs.doc<any>('restaurantes/' + currentUser.uid + '/avatar/imagen').valueChanges()
					.subscribe(snapshots => {
						resolve(snapshots);
					}, err => {
						reject(err)
					})
				}
			})
		});
	}

}
