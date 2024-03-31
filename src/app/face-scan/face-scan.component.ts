import { Component, Renderer2 } from '@angular/core';
import { FaceApiService } from '../face-api.service';
import { AdminService } from '../admin.service';
import { StudentCouchService } from '../student-couch.service';
import { LocalStroageService } from '../local-stroage.service';

@Component({
  selector: 'app-face-scan',
  templateUrl: './face-scan.component.html',
  styleUrls: ['./face-scan.component.scss']
})
export class FaceScanComponent {
  public imageUrl?: string;
  public video?: HTMLVideoElement;
  public holidayArray:string[]=[]
  public schedulePeriod!:[]


  constructor(private faceapI:FaceApiService, private render: Renderer2,private adminService:AdminService,private stdService:StudentCouchService,private check:LocalStroageService) { }

  ngOnInit() {
    this.stdService.showDetails()
    this.video = this.render.selectRootElement("#myVideo") as HTMLVideoElement;
    this.adminService.getUrl().subscribe(res=>{
      this.check.setAdminData(res)
      res.holiday.forEach((item: any)=>{
        let key=Object.keys(item)[0]
        if(this.getMonths()===key){
          this.holidayArray=Object.values(item)
          console.log(this.holidayArray)
          this.loadPeriod()
        }
      })
    })
    // console.log(this.holidayArray)
   
  }

  async streamVideo(period:any) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (this.video) {
        this.video.srcObject = stream;
        this.video.addEventListener('play', async() => {
          try{
            let results=await this.faceapI.FaceDetection(period,this.video)
            console.log("Result", results);
         
        }catch(error){
          console.log(error)
        }
        })
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  }
  getMonths():string{
    let monthNumber = new Date().getMonth();


    const monthNames = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];


    
      return monthNames[monthNumber]
      }
      getDays():string{
      

      let dayOfWeekNumber = new Date().getDay();
      
      
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
      return dayNames[dayOfWeekNumber];
    }
  getDates():string{
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    console.log(formattedDate)
    return formattedDate;

  }
  loadPeriod(){
    console.log(this.holidayArray)
    if(!this.holidayArray.includes(this.getDates())){
      this.check.getAdminData().schedule.forEach((i:any)=>{
        let key=Object.keys(i)
        console.log(key)
        key.forEach((j:string)=>{
          if(j===this.getDays().toLowerCase()){
          this.schedulePeriod=i[j]
          this.streamVideo(this.schedulePeriod)
          }
        })
      })
      // this.stdService.showDetails()
  
    }else{
      alert("holiday")
    }
  }

}
