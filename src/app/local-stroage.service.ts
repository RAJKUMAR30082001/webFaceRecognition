import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStroageService {

  constructor() { }
  setFaceLandmark(data:any[]){
    localStorage.setItem("faceLandmark",JSON.stringify(data));
  }
  getFaceLandmark(): any{
    const data=localStorage.getItem("faceLandmark")
    if(data)
    return JSON.parse(data);
  }
  removeFaceLandmark(){
    localStorage.removeItem("faceLandmark");
  }
  setAdminData(data:any){
    localStorage.setItem('admin',JSON.stringify(data))
  }
  getAdminData():any{
    let admin = localStorage.getItem('admin');
    if(admin){
      return  JSON.parse(admin)
    }
  }
  removeAdminData():any{
    localStorage.removeItem( 'admin')
  }
}
