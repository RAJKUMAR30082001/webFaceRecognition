import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StudentCouchService } from './student-couch.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private stdService: StudentCouchService,private http:HttpClient) { }
  private baseUrl=`${this.stdService.apiUrl}/Admin`
  private Auth=this.stdService.getHeader()

  getUrl():Observable<any>{
    return this.http.get<any>(this.baseUrl, { headers: this.Auth })
  }
  updateAdmin(data:any){
    this.http.put<any>(this.baseUrl,data,{headers:this.Auth}).subscribe(res=>{
      console.log("updated",res)
    })
  }
}
