import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStroageService } from './local-stroage.service';

@Injectable({
  providedIn: 'root'
})
export class StudentCouchService {

  readonly baseURL = 'http://localhost:5984/studentdatabase/studentDetails';
  readonly apiUrl="http://localhost:5984/studentdatabase"
  readonly username = 'rajkumar';
  readonly password = 'rajraina45';
  public year=new Date().getFullYear()

  constructor(private http: HttpClient,private check:LocalStroageService) { }
 

  getHeader(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`)
    });
  }
  getFullDocument():Observable<any>{
    return this.http.get<any>(this.baseURL, { headers: this.getHeader() })
  }
  updateDocument(data: any) {
    
    this.http.put(this.baseURL, data, { headers: this.getHeader() }).subscribe(
        (response: any) => {
          console.log('Student details added/updated successfully:', response);
        })
  }
  getViewUrl():string{
    return `${this.apiUrl}/_design/views/_view/faceLandmark`
  }
  showDetails(){
    this.http.get<any>(this.getViewUrl(),{headers : this.getHeader()}).subscribe((res: { rows: any[]; })=>{
      console.log(res.rows)
      let array=res.rows.map((item:any)=>{
        return item.value
      })
      this.check.setFaceLandmark(array)
    })
  }
}
