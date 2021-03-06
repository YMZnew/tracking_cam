

function onUtilsReady(){
    alert("YMZ ready");
    console.log("YMZ ready");
}

function onOpenCvReady() {


    cv['onRuntimeInitialized']=()=>{
    console.log("YMZ")
    // alert("YMZ");
    let video = document.getElementById('videoInput');
    let utils = new Utils('errorOutput');

    if (navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia) {
        // define a Promise that'll be used to load the webcam and read its frames
        const webcamPromise = navigator.mediaDevices
          .getUserMedia({
            video:{ facingMode: { exact: "environment" }},
            audio: false,
          })
          .then(stream => {
            // pass the current frame to the window.stream
            window.stream = stream;
            // pass the stream to the videoRef
            video.srcObject = stream;
            video.play();
            
          }, (error) => {
            console.log("Couldn't start the webcam")
            console.error(error)
          });
        }

    

    // video.play();

let cap = new cv.VideoCapture(video);

// take first frame of the video
let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
cap.read(frame);

// hardcode the initial location of window
let trackWindow = new cv.Rect(0, 0, 50, 50);

// set up the ROI for tracking
let roi = frame.roi(trackWindow);
let hsvRoi = new cv.Mat();
cv.cvtColor(roi, hsvRoi, cv.COLOR_RGBA2RGB);
cv.cvtColor(hsvRoi, hsvRoi, cv.COLOR_RGB2HSV);
let mask = new cv.Mat();
let lowScalar = new cv.Scalar(30, 30, 0);
let highScalar = new cv.Scalar(180, 180, 180);
let low = new cv.Mat(hsvRoi.rows, hsvRoi.cols, hsvRoi.type(), lowScalar);
let high = new cv.Mat(hsvRoi.rows, hsvRoi.cols, hsvRoi.type(), highScalar);
cv.inRange(hsvRoi, low, high, mask);
let roiHist = new cv.Mat();
let hsvRoiVec = new cv.MatVector();
hsvRoiVec.push_back(hsvRoi);
cv.calcHist(hsvRoiVec, [0], mask, roiHist, [180], [0, 180]);
cv.normalize(roiHist, roiHist, 0, 255, cv.NORM_MINMAX);

// delete useless mats.
roi.delete(); hsvRoi.delete(); mask.delete(); low.delete(); high.delete(); hsvRoiVec.delete();

// Setup the termination criteria, either 10 iteration or move by atleast 1 pt
// let termCrit = new cv.TermCriteria(cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 10, 1);

let hsv = new cv.Mat(video.height, video.width, cv.CV_8UC3);
let hsvVec = new cv.MatVector();
hsvVec.push_back(hsv);
// let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
// let trackBox = null;

const FPS = 30;
function processVideo() {
    try {
        
        if (video.ended) {
            console.log("YMA")
            // clean and stop.
            frame.delete(); dst.delete(); hsvVec.delete(); roiHist.delete(); hsv.delete();
            return;
        }
        let begin = Date.now();

        // start processing.
        cap.read(frame);
       
        let orig = cv.imread(target);
        var orb = new cv.ORB(1000);
        let des = new cv.Mat();
        let img3 = new cv.Mat();
        var kp1 = new cv.KeyPointVector();
        // find the keypoints with ORB
        // orb.detect(orig, kp1);
        // compute the descriptors with ORB 
        // orb.compute(orig, kp1, des);

        orb.detectAndCompute(orig,new cv.Mat(),kp1,des)

        var kp2_cam = new cv.KeyPointVector();
        // orb.detect(frame,kp2_cam);
        var des_cam=new cv.Mat();   
        // orb.compute(frame, kp2_cam, des_cam);
        orb.detectAndCompute(frame,new cv.Mat(),kp2_cam,des_cam);

        // cv.drawKeypoints(orig, kp1, img3, [0, 255, 0, 255]);
        // cv.imshow('canvasOutput', img3);

 
        let matches = new cv.DMatchVectorVector();
        let matcher = new cv.BFMatcher();

        // console.log(des)
        // console.log(des_cam)
        //cv.drawKeypoints(frame, kp2_cam, img3, [0, 255, 0, 255]);
        let dst = new cv.Mat();
        if(des_cam.cols != 0 && des_cam.rows != 0){
            //console.log("not zero")
        matcher.knnMatch(des,des_cam,matches,2);
        const ratio = .75, good = new cv.DMatchVector();
        // const t = new cv.DMatchVector();
        for (let i = 0; i < matches.size(); i++) {
          const m = matches.get(i).get(0), n = matches.get(i).get(1);
            try{
          if (m.distance < ratio * n.distance) {
            // t.push_back(m);
            good.push_back(m);
          }
            }catch(err){
            }
        }

        points1 = [];
        points2 = [];
        document.getElementById("numberOfDetected").innerText = "number of features well matched = "+good.size();

        if(good.size() > 15){

          for(let i=0 ; i< good.size() ; i++){
            // console.log(kp1.get());
            points1.push(kp1.get(good.get(i).queryIdx).pt);
            points2.push(kp2_cam.get(good.get(i).trainIdx).pt);
          }

          // let rs = new cv.Mat();
          let srcPoints = cv.matFromArray(points1.length, 2, cv.CV_32F,points1);
          let dstPoints = cv.matFromArray(points2.length, 2, cv.CV_32F,points2);
          let rs = cv.findHomography(srcPoints,dstPoints,cv.RANSAC,5);
          if(rs.cols > 0 && !rs.empty()){
          
            // console.log(orig.width);
            // console.log(orig.h);
            var obj_corners = [];
    obj_corners[0] = {x:0, y: 0};
    obj_corners[1] = {x: 320, y: 0};
    obj_corners[2] = {x: 320, y: 240};
    obj_corners[3] = {x:0, y:240};
    // console.log(rs);

    let corners = cv.matFromArray(4, 2, cv.CV_32FC2,obj_corners);

    let pT = new cv.matFromArray(4, 2,cv.CV_32FC2,[]);
    // let pT = corners;
    // console.log(rs.type() + " " + JSON.stringify(rs.size()) + " "+rs.channels());
    // console.log(pT.type() + " " + JSON.stringify(pT.size()) + " "+pT.channels());
    // console.log(corners.type() + " " + JSON.stringify(corners.size()) + " "+corners.channels());
            cv.perspectiveTransform(corners,pT,rs);

            var c = document.getElementById("canvasOutput");
var ctx = c.getContext("2d");


cv.imshow('canvasOutput',frame)



        let p = pT.data64F

        ctx.beginPath();              
ctx.lineWidth = "5";
ctx.strokeStyle = "green";  // Green path
ctx.moveTo(p[0],[1]);
ctx.lineTo(p[2], p[3]);
ctx.lineTo(p[4], [5]);
ctx.lineTo(p[6], p[7]);

ctx.stroke();

            // for(let i =0 ; i< pT.size(); i++){
            //   p = pT[i];
            //     // console.log(pT[i].x);
            // }
            
            console.log(p);
            
          }else{
            console.log("YMZ - zero");
          }

          

        
        }



        // console.log(good.size())
      // const matchingImage = new cv.Mat()
   //cv.drawMatchesKnn(orig, kp1, frame, kp2_cam, good, matchingImage);
       //   cv.drawMatchesKnn(orig,kp1,frame,kp2_cam,matches,dst);
      //    cv.imshow('canvasOutput', matchingImage);

//  

    //    [kp1, des, kp2_cam, des_cam, matches, good, matchingImage, matcher, orb].forEach(m => m.delete());
//          [kp1, des, kp2_cam, des_cam, matches, good, matcher, orb].forEach(m => m.delete());
          
            
    }
        //else
        //console.log("is zero")
        //cv.drawMatchesKnn(orig,kp1,frame,kp2_cam,dm,dst);
        //cv.imshow('canvasOutput', dst);

        //const matchingImage = new cv.Mat();
       // cv.drawMatchesKnn(orig,des,frame,des_cam,dm,matchingImage)
        //cv.imshow('target', matchingImage);

        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    
    } catch (err) {
        utils.printError(err);
    }
};

// schedule the first one.
setTimeout(processVideo, 0);
    }

  }
