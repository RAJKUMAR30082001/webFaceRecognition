import { Injectable } from '@angular/core';
import { LocalStroageService } from './local-stroage.service';
import { StudentCouchService } from './student-couch.service';
import { AdminService } from './admin.service';
declare const faceapi:any
interface AttendanceRecord {
  [regno: string]: number;
}
@Injectable({
  providedIn: 'root'
})

export class FaceApiService {

  constructor(private check:LocalStroageService,private stdService:StudentCouchService,private adminService:AdminService) { }
  public video: HTMLVideoElement | undefined;
  public displaySize: { width: number; height: number } = { width: 0, height: 0 }; // Provide initial values
  public discriptions: any[] = [];
  public flag: boolean = false;
  public promise: Promise<any[]> | undefined;
  public resize:any
  public attendanceRecordArray:AttendanceRecord[]=[]
  public periods:any
  public startTime!:string
  public subjectCode!:string
  public endTime!:string
  public labelArray:any[]=[]
  
  async loadModels(){
    try{
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('./assets/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./assets/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./assets/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('./assets/models')
      ])
  
    }
    catch(error){
      console.log(error)
    }
  }

  async FaceDetection(period:any,video?: HTMLVideoElement): Promise<any> {
    await this.loadModels()
    this.periods=period
    this.video=video
    this.getValues()
    this.labelFace()
    
  }

 async getValues(){
    console.log(this.periods.length)
    if(this.periods.length > 0)
    console.log(this.periods)
    else{
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0); 
  
      const timeDifference = midnight.getTime() - now.getTime();
      await new Promise(resolve => setTimeout(resolve, timeDifference));
  
     location.reload()
    }
   this.startTime=this.periods[0].startTime
   this.subjectCode=this.periods[0].subjectCode
    this.endTime=this.periods[0].endTime
    console.log(this.startTime)
    console.log(this.endTime)
    this.removeElement(this.periods[0])
    this.waitForStartTime()
    

  }
  removeElement(element: any) {
    this.periods.shift()
    console.log(this.periods)
  }
  async waitForStartTime() {
    const interval = setInterval(() => {
        console.log("waiting");
        if (this.getTime()>=this.getTimes(this.startTime)) {
            console.log("yes");
            this.detectFace()
            clearInterval(interval);
        }
    }, 5000);
}


  getTime():number{
    let date:Date=new Date()
    let hrs=date.getHours()
    let mins=date.getMinutes()
    let currentTime=hrs*60+mins
    return currentTime
    
  }
  getTimes(Time:string):number{
    let time=Time.split(" ")
    let start=time[0].split(":")
    if(time[1]==='pm' && start[0]!=='12'){
      console.log(time[0])
      return (Number(start[0])+12)*60 + Number(start[1])
    }
    return Number(start[0])*60 + Number(start[1])
  }
  getEndTime(){
    return this.getTimes(this.endTime)
  }

  async detectFace(){
    
    const faceScan=setInterval(async()=>{
    let results = await faceapi.detectAllFaces(this.video).withFaceLandmarks().withFaceDescriptors();
    console.log(results)
    console.log(this.getTime(),this.getTimes(this.startTime))
    if(this.getTime()>=this.getTimes(this.startTime)+20){
      console.log("yes end")
      this.updateRecord(faceScan)
    }
    if(results.length>0)
    this.findFace(results)

    
  },2000)
  }

  findFace(data:any){
    console.log(this.labelArray)
    const facematcher= new faceapi.FaceMatcher(this.labelArray)
    console.log(data)
    data.forEach((item:any)=>{
      let res=facematcher.findBestMatch(item.descriptor)
      let regno=res.toString().split(" ")[0]
      this.findPercentage(this.getTime(),regno);
    })
   
  }

  labelFace(){
    
    let FaceLabeledDescriptor=this.check.getFaceLandmark()
    FaceLabeledDescriptor.forEach((item:any)=>{
      let floatArray=new Float32Array(item.descriptors[0])
      console.log(item.label)
      let val=new faceapi.LabeledFaceDescriptors(item.label,[floatArray])
      this.labelArray.push(val)
    })
  }

  findPercentage(time:number,regno:string){
    let strTime=this.getTimes(this.startTime)
    let objOfPercentage:AttendanceRecord={}
    let percentage!:number
    if(time<=strTime+5){
      percentage=100
    }
    else if(time<=strTime+10){
      percentage=75
    }
    else if(time<=strTime+15){
      percentage=50
    }
    else if(time<=strTime+20){
     percentage=25
    }
    else{
      percentage=0
    }
    const presenceOfObject=this.attendanceRecordArray.find((item:any)=> regno in item)
    
    if(!presenceOfObject && regno!=='unknown'){
    objOfPercentage[regno]=percentage
    this.attendanceRecordArray.push(objOfPercentage)
    console.log(this.attendanceRecordArray)
  }
  }

  updateRecord(results:any){
    clearInterval(results)
    let totalHours:number=0
    this.adminService.getUrl().subscribe(data=>{
      totalHours=data.hours[this.subjectCode]
      data.hours[this.subjectCode]=totalHours+1
      // this.adminService.updateAdmin(data)
    })

    this.stdService.getFullDocument().subscribe(res => {
      let stdData = res['2024'];
  
      this.attendanceRecordArray.forEach(record => {
          const studentId = Object.keys(record)[0];
          const attendancePercentage = record[studentId];
          
          if (stdData.hasOwnProperty(studentId)) {
            stdData[studentId].numberOfClasses[this.subjectCode]+=1;
              stdData[studentId].attendanceRecord.forEach((attendanceRecord: any) => {
                  if (attendanceRecord.hasOwnProperty(this.subjectCode)) {
                    console.log(attendancePercentage,totalHours+1,attendanceRecord[this.subjectCode])
                    console.log(this.getPercentage(attendancePercentage,totalHours+1,attendanceRecord[this.subjectCode]))
                      attendanceRecord[this.subjectCode]=this.getPercentage(attendancePercentage,totalHours+1,attendanceRecord[this.subjectCode]); 
                      console.log(attendanceRecord[this.subjectCode])
                  }
              });
          }
          else{
            stdData[studentId].notification.push(`you are absent on ${new Date().getDate()} for  subject code ${this.subjectCode}`)
            stdData[studentId].attendanceRecord.forEach((attendanceRecord: any) => {
              if (attendanceRecord.hasOwnProperty(this.subjectCode)) {
                  attendanceRecord[this.subjectCode]=this.getPercentage(0,totalHours+1,attendanceRecord[this.subjectCode]); 
                 
              }
          });
          }
      });
      //this.stdService.updateDocument(res)
      // this.getValues()
  })
}
getPercentage(value: number,totalHours:number,currentPercentage:number):number{
      let newPercentage=(currentPercentage*totalHours)+value
      return newPercentage/totalHours
}


}
