function onUtilsReady(){
    alert("YMZ ready");
    console.log("YMZ ready");
}


function processVideo() {
    window.stats.begin();

    const frame = getFrame();
//     if (window.shouldTrack) {
//         let res;
//         if (++frames % 120 == 0) { // reset tracking every 60 frames in case tracking gets lost
//             res = window.tracker.resetTracking(frame, window.width, window.height);
//         }
//         else {
//             res = window.tracker.track(frame, window.width, window.height);
//         }

//         if (res.valid) {
//             window.tracker.transformElem(res.H, window.arElem);
//             drawCorners(res.corners);
//         }
//         else {
//             clearOverlayCtx(window.overlayCanv.getContext("2d"));
//             window.arElem.style.display = "none";
//         }
//     }

//     window.stats.end();

     requestAnimationFrame(processVideo);
}


function onOpenCvReady() {


    cv['onRuntimeInitialized']=()=>{
    console.log("YMZ")
    // alert("YMZ");
    let video = document.getElementById('videoInput');
    let utils = new Utils('errorOutput');


window.videoElem = video;
    window.videoElem.setAttribute("autoplay", "");
    window.videoElem.setAttribute("muted", "");
    window.videoElem.setAttribute("playsinline", "");

    if (navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia) {
        // define a Promise that'll be used to load the webcam and read its frames
        const webcamPromise = navigator.mediaDevices
          .getUserMedia({
            video:{ facingMode: { exact: "environment" }},
            audio: false,
          })
          .then(stream => {
            // pass the current frame to the window.stream
            window.videoElem.srcObject = stream;
            // pass the stream to the videoRef
            //video.srcObject = stream;
           // video.play();
window.videoElem.play();
            
          }, (error) => {
            console.log("Couldn't start the webcam")
            console.error(error)
          });
        }

    

    // video.play();

window.videoCanv = document.createElement("canvas");



//let cap = new cv.VideoCapture(video);


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
let templ = cv.imread(target);

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
       
      
        let dst = new cv.Mat();
        let mask = new cv.Mat();
cv.matchTemplate(frame, templ, dst, cv.TM_CCOEFF_NORMED, mask);
let result = cv.minMaxLoc(dst, mask);
let maxPoint = result.maxLoc;

let color = new cv.Scalar(255, 0, 0, 255);
let point = new cv.Point(maxPoint.x + templ.cols, maxPoint.y + templ.rows);
cv.rectangle(frame, maxPoint, point, color, 2, cv.LINE_8, 0);
cv.imshow('canvasOutput', frame);

mask.delete();
dst.delete();

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
