import { Injectable } from '@angular/core';
import { LocalStroageService } from './local-stroage.service';
declare const faceapi:any
@Injectable({
  providedIn: 'root'
})
export class FaceApiService {

  constructor(private check:LocalStroageService) { }
  public video: HTMLVideoElement | undefined;
  public displaySize: { width: number; height: number } = { width: 0, height: 0 }; // Provide initial values
  public discriptions: any[] = [];
  public flag: boolean = false;
  public results: any;
  public promise: Promise<any[]> | undefined;
  public resize:any
  public attendanceRecordArray!:{[key:string]:number}
  public periods:any
  public startTime!:string
  public subjectCode!:string
  public endTime!:string
  
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
    if(time[1]==='pm'){
      return (Number(start[0])+12)*60 + Number(start[1])
    }
    return Number(start[0])*60 + Number(start[1])
  }
  getEndTime(){
    return this.getTimes(this.endTime)
  }

  async detectFace(){
    let FaceLabeledDescriptor=this.check.getFaceLandmark()
    const faceScan=setInterval(async()=>{
    this.results = await faceapi.detectAllFaces(this.video).withFaceLandmarks().withFaceDescriptors();
    
  },100)
  }
}
