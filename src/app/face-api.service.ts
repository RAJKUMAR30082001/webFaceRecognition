import { Injectable } from '@angular/core';
import { LocalStroageService } from './local-stroage.service';
declare const faceapi:any
interface AttendanceRecord {
  [regno: string]: number;
}
@Injectable({
  providedIn: 'root'
})

export class FaceApiService {

  constructor(private check:LocalStroageService) { }
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

  getValues(){
    console.log(this.periods.length)
    if(this.periods.length > 0)
    console.log(this.periods)
   this.startTime=this.periods[0].startTime
   this.subjectCode=this.periods[0].subjectCode
    this.endTime=this.periods[0].endTime
    console.log(this.getTimes(this.startTime))
    console.log(this.getTimes(this.endTime))
    console.log(this.getTime())
    this.waitForStartTime()
  //  this.removeElement(this.periods[0])

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

  removeElement(element:any){
    this.periods.splice(this.periods.indexOf(element),1)
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
    
    // const faceScan=setInterval(async()=>{
    let results = await faceapi.detectAllFaces(this.video).withFaceLandmarks().withFaceDescriptors();
    console.log(results)
    if(results.length>0)
    await this.findFace(results)
  // },100)
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
    objOfPercentage[regno]=percentage
    this.attendanceRecordArray.push(objOfPercentage)
    console.log(this.attendanceRecordArray)
  }
}
