import { Injectable } from '@angular/core';
declare const faceapi:any
@Injectable({
  providedIn: 'root'
})
export class FaceApiService {

  constructor() { }
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
    this.results = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
    console.log("results:",this.results);
    return this.results;
  }

  getValues(){
   this.startTime=this.periods[0].startTime
   this.subjectCode=this.periods[0].subjectCode
   this.removeElement(this.periods[0])

  }
  findClosestMatch(){
    if(this.startTime===this.getTime()){}
  }

  removeElement(element:any){
    this.periods.splice(this.periods.indexOf(element),1)
  }

  getTime():string{
    let hours:string=''
    let date:Date=new Date()
    let hrs=date.getHours()
    let mins=date.getMinutes()
    let amOrpm!:string
    if(hrs>12){
      hours=String(hrs-12)
      amOrpm="pm"
    }
    else if(hrs<10){
      hours= "0"+String(hrs)
      amOrpm='am'
    }
  
    return `${hours}:${mins} ${amOrpm}`
  }
}
