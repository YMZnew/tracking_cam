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


// delete useless mats.
// roi.delete(); hsvRoi.delete(); mask.delete(); low.delete(); high.delete(); hsvRoiVec.delete();

// Setup the termination criteria, either 10 iteration or move by atleast 1 pt
// let termCrit = new cv.TermCriteria(cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 10, 1);

let hsv = new cv.Mat(video.height, video.width, cv.CV_8UC3);
let hsvVec = new cv.MatVector();
hsvVec.push_back(hsv);
// let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
// let trackBox = null;

const FPS = 30;

function processVideo() {

        document.getElementById("numberOfDetected").innerText = "YMZ"
    try{
        if (video.ended) {
            console.log("YMA")
            // clean and stop.
            frame.delete(); dst.delete(); hsvVec.delete(); roiHist.delete(); hsv.delete();
            return;
        }
        let begin = Date.now();

        // start processing.
        cap.read(frame);
       
        let templ = cv.imread(target);
        let dst = new cv.Mat();
        let mask = new cv.Mat();
cv.matchTemplate(frame, templ, dst, cv.TM_CCOEFF, mask);
let result = cv.minMaxLoc(dst, mask);
let maxPoint = result.maxLoc;

// console.log(maxPoint.x+ " , "+ maxPoint.y);
      document.getElementById("numberOfDetected").innerText = "point : " +maxPoint.x+ " , "+ maxPoint.y +" value : " + result.maxVal;

        // find the keypoints with ORB
        // orb.detect(orig, kp1);
        // compute the descriptors with ORB 
        // orb.compute(orig, kp1, des);


        // console.log(good.size())
      // const matchingImage = new cv.Mat()
   //cv.drawMatchesKnn(orig, kp1, frame, kp2_cam, good, matchingImage);
       //   cv.drawMatchesKnn(orig,kp1,frame,kp2_cam,matches,dst);
      //    cv.imshow('canvasOutput', matchingImage);

//  

    //    [kp1, des, kp2_cam, des_cam, matches, good, matchingImage, matcher, orb].forEach(m => m.delete());
//          [kp1, des, kp2_cam, des_cam, matches, good, matcher, orb].forEach(m => m.delete());
          
            
        //else
        //console.log("is zero")
        //cv.drawMatchesKnn(orig,kp1,frame,kp2_cam,dm,dst);
        //cv.imshow('canvasOutput', dst);

        //const matchingImage = new cv.Mat();
       // cv.drawMatchesKnn(orig,des,frame,des_cam,dm,matchingImage)
        //cv.imshow('target', matchingImage);

        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    }catch(err){
             document.getElementById("numberOfDetected").innerText = "error11 : "+err;
    }
  
};

// schedule the first one.
setTimeout(processVideo, 0);
    }

  }
