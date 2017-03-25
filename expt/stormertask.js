/* global $z, $, setTimeout, clearTimeout, innerStream, _, log, urlParams, location, Base64 */
function showSlide(id) {
  // Hide all slides
  $(".slide").hide();
  $(".zen-slide").hide();
  // Show just the slide we want to show
  $("#"+id).show();
}
var getITI = function() {
  return Math.floor(Math.random() * 500) + 1000 // 1000-1500ms
}

// Get a random integer less than n.
function randomInteger(n) {
  return Math.floor(Math.random()*n);
}

// Get a random element from an array (e.g., <code>random_element([4,8,7])</code> could return 4, 8, or 7). This is useful for condition randomization.
function randomElement(array) {
  return array[randomInteger(array.length)];
}

var wait = function(msec, fn) {
  setTimeout(fn, msec);
};

var instructionCount = 1; // Set the initial instruction page
var instructionPart = "instructions"; // Set the instruction prefix to start

var nextInstruction = function(){ // get next slide

if ($(window).width() <= 770) {
  $z.showSlide("screensmall");
} else {
    instructionCount++; // add instruction count
  $z.showSlide(instructionPart + instructionCount); // show slide
  $(document).scrollTop(0);// go to top of page

}
};

var hideHiddenEnable = function(id){
  $(".hideToShow").hide();
  $("#" + id).removeAttr("disabled");
}

var showHiddenDisable = function(id){
  $(".hideToShow").show();
  if(id) {
    $("#" + id).attr("disabled",true);
  }
}

function launchFullScreen(element) {
  if(element.requestFullScreen) {
    element.requestFullScreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  }
}

function exitFullscreen() {
  if(document.exitFullscreen) {
    document.exitFullscreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange', exitHandler);

function exitHandler()
{
  if (watchingFull) {
      if (!document.webkitIsFullScreen && !document.mozFullScreen && !(document.msFullscreenElement))
      {
        $(document.body).css("cursor","auto")
        dead = true;
        $(document).unbind('keydown');
        clearTimeout(timer);
          showSlide("full-exit");
      }
  } 
}


var endExperiment = function() {
  //$z.showSlide("thank-you"); // show the start of the questions
  window.opener.allData = allData; // save data to parent window
  window.opener.experiment.end(); // call the experiment end in parent window

  wait(500, function(){
    closeWindow();
  });
};

var closeWindow = function() {
  window.close();
};

function getTime(pageID) {
    recordTime = new Date(); // record the newest time
    diffTime = recordTime - lastTime; // record the difference from last time
    data = {
      question: "time_"+pageID,
      answer: diffTime
    };
    lastTime = recordTime; // replace the last time

    allData.time.push(data);
};

var saveFingerprint =  function() {
  new Fingerprint2().get(function(result, components){
  // console.log(result); //a hash, representing your device fingerprint
  // console.log(components); // an array of FP components
    allData.fingerprint=components;
  });
  data = {
    question: "fingerprint",
    answer: Fingerprint2
  };
  allData.data.push(data);

  fpSaved = new Date();
  data = {
    question: "startTime",
    answer: fpSaved
  };
  allData.time.push(data);

};

var lastTime = new Date(); // initialize time on load

// $z.showSlide("instructions1"); // This is where the task starts
showSlide("expt-start");

var imgArray = new Array();
function preload() {
  $z.showSlide("preloaded");
  for (i = 0; i < 20; i++) {
    for (j = 0; j < 5; j++) {
       imgArray[i*5+j] = new Image();
       imgArray[i*5+j].src = "images/FaceStim/img" + (i+1) + "_contrast" + (j+1) + ".png";
       // imgArray.push("images/FaceStim/img" + (i+1) + "_contrast" + (j+1) + ".png");
    }
  }
   var preloadDiv = $("<div class='hidden' style='display:none;'></div>").prependTo(document.body);
    // var preloadDiv = "<div class='hidden' style='display:none;'></div>";
    // console.log(preloadDiv)
  $.each(imgArray, function(i,source) {
    // console.log(source)
     // $("<img/>").attr("src", source).appendTo(preloadDiv);
     $(source).appendTo(preloadDiv);
    if (i == imgArray.length-1) {
      preloadComplete()
    }
  });
}

function preloadComplete() {
    $z.showSlide("preloaded");
    // setTimeout(nextInstruction(), 700); 
    wait(700, function() {nextInstruction();});
}

var exptFaces =[],
    pracFaces =[];
var randomize = function(){ // randomize to condition
  var x = Math.floor((Math.random() * 2)); // flip a coin
  if(x == 0) { // If tails, set condition and instruction prefix
     exptFaces = [1,2,3,4,5,6,7,8,9,10];
     pracFaces = [11,12,13,14,15,16,17,18,19,20];
  } else { // If heads, set condition and instruction prefix
    exptFaces = [11,12,13,14,15,16,17,18,19,20];
    pracFaces = [1,2,3,4,5,6,7,8,9,10];
  };
  // data ={
  //   question: "whichFaces",
  //   answer: x
  // };
  allData.whichFaces=x; //.push(data);
  factorize();
  nextInstruction();
};

function factorize() {
  var factors = {
  face: exptFaces,
  testContrast: [1,2,3,4,5],
  testPos: ['left','right'], //1=left, 2=right
  cue: ['standard','test']
  };
// create full factorial design. rep = 1. unpack=false.
  var full_design = jsPsych.randomization.factorial(factors, 1);
    experiment.trialSeq = full_design;

// create mini factorial design for pracice trials (40 trials) //
  var factors_practice = {
  face: pracFaces,
  cue: ['standard','test']
  // testPos: ['left','right']
  };
  var mini_design = jsPsych.randomization.factorial(factors_practice, 1);
  practice.pracSeq = mini_design;
  practice.secondPrac = mini_design;
};
///////////////////////////////////////////////////////////////////
// Set variables //
var curTrial = 0,
    blockCount = 0,
    onintro = false,
    onfeedback = false,
    onpracend = false;
    onbreak = false;
var dead = false;
var rerun = false;
var gotResp = false;
var allData ={};
var timer=[];
// allData.fingerprint = fingerprint;
// allData.practice=[];
allData.pracstim=[];
allData.pracresp=[];
// allData.experiment=[];
allData.exptstim=[];
allData.exptresp=[];
allData.fingerprint=[];
// allData.data= [];
allData.time = [];
allData.whichFaces=[];

var testContrast = [1,2,3,4,5],
    standardContrast = 3,
    practiceContrast = [1,5],
    allVerticalShifts = [
      {"up":"left","down":"right"},
      {"up":"right","down":"left"} ],
    testPos= ['left','right'],
    imgDir = "images/FaceStim/";


var pracRepeat=false;
//////////////////////////////////////////////////////////////////

// ## practice trials
var practice = {
  nTrial : 0,
  taskInstCount: 0, 
  taskInstText: ["Step 1: Fix your gaze on the fixation cross in the center of the screen. You must maintain your gaze on the cross throughout the experiment.",
        "Step 2: Wait for faces to show up while maintaining your gaze on the cross. A black dot will apprear during this time, but just ignore it -- it is irrelevant to the task.",
        "Step 3: Two faces will briefly appear to the left and right of the fixation cross. Judge which face appears to have higher contrast around the eye region while fixating on the cross. "+
        "It is very important that you DO NOT directly look at them. (Note: Faces will be flashed very briefly.)",
        "Step 4: You will have to report the vertical positioning (upward or downward) of the face that appears to have higher contrast. Use the two horizontal lines next to the fixation cross as reference. "+
        "In the example above, the face on the right has higher contrast and is shifted downward from the horizontal midline. Again, you shouldn't be looking at the faces but looking at the cross even if faces suddenly appear.",
        "Step 5: Press UP or DOWN arrow key AFTER faces disappear to report the positioning of the face you selected. The next trial will automatically start after you respond."],

  end: function() {
    
    onpracend=true;
    // if (!pracRepeat) {
    //   $(".hideToShow").show();
    // } else {
    //   $(".hideToShow").hide();
    // };
    pracEnd= new Date();
    data = {
      question: "pracStart",
      answer: pracStart
    };
    allData.time.push(data);
    data = {
      question: "pracEnd",
      answer: pracEnd
    };
    allData.time.push(data);

    showSlide("practice-end");
  },
  // pracAgain: function() {
  //   pracRepeat= true;
  //   practice.nTrial=15;
  //   practice.nextTrial();
  // },
  intro: function() {
    onintro=true;
    if (dead) {
      showSlide("full-exit");
    } else {
    showSlide("grey-blank");
    timer = setTimeout(practice.ready,5000);
    }
  },
  ready: function() {
    onintro=false;
    if (dead) {
          showSlide("full-exit");
    } else {
     $("#instText").text("Ready!");
     $("#instText").css("color","black");
     showSlide("fixation");
     // console.log(practice.nTrial);
     if (practice.nTrial>7 ) {
      timer=setTimeout(practice.fixation,readyTime);
     } else {
      timer=setTimeout(practice.fixateInst,1500);
     } 
    }
  },
  fixateInst: function() {
    if (dead) {
          showSlide("full-exit");
    } else {
    $("#instText").text("Fixate the cross");
    showSlide("fixation");
    timer=setTimeout(practice.fixation,1500);
    }
  },
  fixation: function() {
    if (dead) {
          showSlide("full-exit");
    } else {
    $("#instText").text("");
    showSlide("fixation");
    timer=setTimeout(practice.cue,thisITI);
    }
  },
      // cue
  cue: function() {
    if (dead) {
          showSlide("full-exit");
    } else {
      showSlide("cue");
      timer=setTimeout(practice.blank, 66); //70ms
    }
  },
    // blank
  blank: function() {
    if (dead) {
          showSlide("full-exit");
    } else {
    $("#instText").text("");
    showSlide("fixation");
    timer=setTimeout(practice.faces,blankDur);
   }
  },
  // faces
  faces: function() {
    if (dead) {
          showSlide("full-exit");
    } else {
    showSlide("present-faces");
    timer=setTimeout(practice.resp, faceDur);
    }
  },

  feedback: function() {
    onfeedback=true;
    if (dead) {
      showSlide("full-exit");
    } else {
      showSlide("fixation");
      timer=setTimeout(practice.nextTrial, 1500);

    }
  },

  nextTrial: function() {
    onfeedback=false;
    if (practice.nTrial==20) {
      practice.end();
      return;
    };

    practice.nTrial = practice.nTrial + 1;
    $("#ntrial").text(practice.nTrial);
    $("#instText").text("");
    // console.log(practice.nTrial);
      thisVerticalShifts = randomElement(allVerticalShifts);
      thisITI = getITI();
      thisTestContrast = randomElement(practiceContrast); // either level 1 or 5
      if (practice.nTrial <= 6) {
        faceDur = 528;
        blankDur = 165;
      } else if ((practice.nTrial <= 12) && (practice.nTrial > 6)) {//  after 6 trials
        faceDur = 264;
        blankDur = 165;
      } else {
        faceDur = 66;
        blankDur = 66;
      };

      var thisCond = practice.pracSeq.shift();
      // if (!pracRepeat) {
      //   var thisCond = practice.pracSeq.shift();
      // } else {
      //   var thisCond = practice.secondPrac.shift();
      // };
      
      var testFace = imgDir + "img" + thisCond.face + "_contrast" + thisTestContrast + ".png";
      var standardFace = imgDir + "img" + thisCond.face + "_contrast" + standardContrast + ".png";
      var thisCue = thisCond.cue;
      // var thisTestPos = thisCond.testPos;
      thisTestPos = randomElement(testPos);
      testLeft = (thisTestPos == "left");
      $("#left-face").attr('src', testLeft ? testFace:standardFace);
      $("#right-face").attr('src', testLeft ? standardFace:testFace);

      leftUp = (thisVerticalShifts["up"] == "left");
      $("#left-face").attr('class',leftUp ? "picture horAlign left-pos up":"picture horAlign left-pos down");
      $("#right-face").attr('class',leftUp ? "picture horAlign right-pos down":"picture horAlign right-pos up");
      // }
      //   }
//jquery add class
      testCued = (thisCue == "test");
      if ((testCued && testLeft) || (!testCued && !testLeft)) {
        var cueLoc = "leftCue"; // left cued        
        $("#cueing").attr('class', leftUp ? cueLoc+" horAlign up":cueLoc+" horAlign down");
      } else if ((testCued && !testLeft) || (!testCued && testLeft)) {
        var cueLoc = "rightCue";
        $("#cueing").attr('class', leftUp ? cueLoc+" horAlign down":cueLoc+" horAlign up");
      };
      
      if (testLeft) {
        if (leftUp) {
          var testVertical = "up";
          var standardVertical = "down";
        } else {
          var testVertical = "down";
          var standardVertical = "up";
        }
      } else {
        if (leftUp) {
          var testVertical = "down";
          var standardVertical = "up";
        } else {
          var testVertical = "up";
          var standardVertical = "down";
        }
      };

      // correct or incorrect
      if (thisTestContrast < 3) {
        correctAns  =  standardVertical;   //standard
      } else {
        correctAns = testVertical;
      };

      var pracCond = {
        stimcond: thisCond,
        face: thisCond.face,
        cue: thisCue,
        testContrast: thisTestContrast,
        vertical: thisVerticalShifts,
        testPos: thisTestPos,
        leftUp: leftUp,
        cueLoc: cueLoc,
        testVertical: testVertical,
        correctAns: correctAns,
        ITI: thisITI,
        trial: practice.nTrial
      };

      allData.pracstim.push(pracCond);
      // if (!pracRepeat){
      //   allData.practice.push(pracCond);
      // } else {
      //   allData.prac2.push(pracCond);
      // };
      
      readyTime =1000;
      if (practice.nTrial==1) {
        $("#introText").text("First, we will practice at a slow pace.");
        practice.intro();
      } else if (practice.nTrial==7){
        $("#introText").text("We will speed up a little bit...");
        practice.intro();
      } else if (practice.nTrial==13){
        $("#introText").text("Now, up to speed. It's FAST!");
        practice.intro();
      }else if (practice.nTrial>13){
        readyTime=500;
        practice.ready();
      } else {
        practice.ready();
      };
  },
  // response
  resp: function() {

    if (practice.nTrial < 13) {
        $("#instText").text("Up or Down?");
      } else {
        faceDur = 66;
        blankDur = 66;
        $("#instText").text("Up or Down?");
      };
    // Get the current time so we can compute reaction time later.
    
    if (dead) {
        return;
          showSlide("full-exit");
          
    } else {
      showSlide("fixation");
    };
    
    var startTime = (new Date()).getTime();
    // Set up a function to react to keyboard input. Functions that are used to react to user input are called *event handlers*. In addition to writing these event handlers, you have to *bind* them to particular events (i.e., tell the browser that you actually want the handler to run when the user performs an action). Note that the handler always takes an <code>event</code> argument, which is an object that provides data about the user input (e.g., where they clicked, which button they pressed).
    var keyPressHandler = function(event) {
      
      // A slight disadvantage of this code is that you have to test for numeric key values; instead of writing code that expresses "*do X if 'Q' was pressed*", you have to do the more complicated "*do X if the key with code 80 was pressed*". A library like [Keymaster](http://github.com/madrobby/keymaster) lets you write simpler code like <code>key('a', function(){ alert('you pressed a!') })</code>, but I've omitted it here. Here, we get the numeric key code from the event object
      var keyCode = event.which;
      
      if (keyCode != 38 && keyCode != 40) {
        // If a key that we don't care about is pressed, re-attach the handler (see the end of this script for more info)
        $(document).one("keydown", keyPressHandler);
        
      } else { 
        // console.log(keyCode)
        // If a valid key is pressed (code 80 is p, 81 is q),
        // record the reaction time (current time minus start time), which key was pressed, and what that means (even or odd).

        // $("#ntrial").text(experiment.nTrial);
        var endTime = (new Date()).getTime(),
            key = (keyCode == 38) ? "up" : "down",
            correct= (key == correctAns),
            response = {
              keypress: key,
              // stimulus: n,
              // accuracy: realParity == userParity ? 1 : 0,
              rt: endTime - startTime,
              correct: correct,
              trial: practice.nTrial
            };

        allData.pracresp.push(response);
        // if (!pracRepeat){
        //   allData.practice.resp.push(response);
        //  } else {
        //   allData.prac2.push(response);
        // };
          rerun=false;
          // setTimeout(practice.nextTrial, 500);
        if (correct) {
        $("#instText").text("Correct");
        $("#instText").css('color','green');
        } else {
        $("#instText").text("Incorrect");
        $("#instText").css('color','red');
        };
          practice.feedback();

        };
      
    }
 // Here, we actually bind the handler. We're using jQuery's <code>one()</code> function, which ensures that the handler can only run once. This is very important, because generally you only want the handler to run only once per trial. If you don't bind with <code>one()</code>, the handler might run multiple times per trial, which can be disastrous. For instance, if the user accidentally presses P twice, you'll be recording an extra copy of the data for this trial and (even worse) you will be calling <code>experiment.next</code> twice, which will cause trials to be skipped! That said, there are certainly cases where you do want to run an event handler multiple times per trial. In this case, you want to use the <code>bind()</code> and <code>unbind()</code> functions, but you have to be extra careful about properly unbinding.
    $(document).one("keydown", keyPressHandler);

    // if (!rerun){
    // $(document).one("keydown", keyPressHandler);
    // } else {
    //   return;
    // };
  },

  prerun: function() {
    $z.showSlide("prerun");
  },

  run: function() {
      document.getElementById("return-button").onclick = practice.runFromDead;
        // $("#return-button").attr("onclick",practice.runFromDead);
    document.getElementById("start-button").onclick = practice.nextTrial;
    launchFullScreen(document.documentElement);
    watchingFull = true;
    pracStart = new Date();
    practice.addFullscreenEvents_setupNext();
  },
  runFromDead: function() {
    // if (practice.nTrial > 0) {practice.nTrial = practice.nTrial - 1;}
    dead = false;
    launchFullScreen(document.documentElement)
    practice.addFullscreenEvents_setupNext();
  },
  setupNext: function() {
    if (!dead) {
      if (practice.nTrial > 0) {
        if (onintro) {
          document.getElementById("start-button").onclick = practice.intro;
          rerun=true;
          showSlide("trial-start");
        } else if (onfeedback) {
          document.getElementById("start-button").onclick = practice.nextTrial;
          rerun=true;
          showSlide("trial-start");
        } else {
        // if (curTrial > 2 && opener.turk.previewMode) {
        //   experiment.end();
        // } else {
          // trial.pushData(false);
          document.getElementById("start-button").onclick = practice.ready;
          rerun=true;
          showSlide("trial-start");
        }

        // }
      } else { //practice nTrial == 0 
        document.getElementById("start-button").onclick = practice.nextTrial;
        showSlide("trial-start");
      }

    } else {  // dead==true
      showSlide("full-exit");
    };
  },

  addFullscreenEvents_setupNext: function() {
    document.addEventListener('webkitfullscreenchange', exitHandler, false);
      document.addEventListener('mozfullscreenchange', exitHandler, false);
      document.addEventListener('fullscreenchange', exitHandler, false);
      document.addEventListener('MSFullscreenChange', exitHandler, false);
      if (onpracend) {
        showSlide("practice-end");
      } else {
        practice.setupNext();
      }
      
  },

  nextTaskInst: function() { // get next slide
    practice.taskInstCount++; // add instruction count
    if (practice.taskInstCount==6) {
      $z.showSlide("start-practice");
      $(document).scrollTop(0);
      practice.taskInstCount=0;
    } else if (practice.taskInstCount<6 && practice.taskInstCount>0) {
    $("#instImg").attr('src', "images/inst/step"+practice.taskInstCount+".jpg");
    $("#taskInstText").text(practice.taskInstText[practice.taskInstCount-1]);
    $z.showSlide("taskInst");
    $(document).scrollTop(0);
    }
  }
}


////////////////////////////////////////////////////////////////
var experiment = {
  // Parameters for this sequence.
  // nTrial : 0,
  end: function() {
    watchingFull = false;
    exptEnd= new Date();
    data = {
      question: "exptStart",
      answer: exptStart
    };
    allData.time.push(data);
    data = {
      question: "exptEnd",
      answer: exptEnd
    };
    allData.time.push(data);
    $("#introText").text("This window will now close and will return to the mTurk tab.");
    $("#introText").css("font-size","26px");
    $("#grey-blank").css("background-color","white");
    showSlide("grey-blank");
    $(document.body).css("cursor","auto")
    // $(".slide, .expt").hide();
    exitFullscreen();
    window.opener.allData = allData; // save data to parent window

    window.opener.experiment.end(); // call the experiment end in parent window

  wait(3000, function(){
    closeWindow();
  });
   
  },

  intro: function() {
    document.getElementById("return-button").onclick = experiment.runFromDead;
    onpracend=false;
    onintro=true;
    if (dead) {
      showSlide("full-exit");
    } else {
    showSlide("expt-start");
    }
  },
  ready: function() {
    onintro=false;
    $(document.body).css("cursor","none");
    if (dead) {
          showSlide("full-exit");
    } else {
     $("#instText").text("Ready!");
     $("#instText").css("color","black");
    showSlide("fixation");
    timer=setTimeout(experiment.fixateInst,1500);
    }
  },
  fixateInst: function(){
    if (dead) {
          showSlide("full-exit");
    } else {
     $("#instText").text("Fixate");
     showSlide("fixation");
    timer=setTimeout(experiment.fixation,1500);
    }
  },
  fixation: function() {
    $(document.body).css("cursor","none")
    if (dead) {
          showSlide("full-exit");
    } else {
    $("#instText").text("");
    showSlide("fixation");
    timer=setTimeout(experiment.cue,thisITI);
    }

  },
      // cue
  cue: function() {
    if (dead) {
          showSlide("full-exit");
    } else {
      showSlide("cue");
      timer=setTimeout(experiment.blank, 66); //70ms
    }
  },
    // blank
  blank: function() {
    if (dead) {
          showSlide("full-exit");
    } else {
    showSlide("fixation");
    timer=setTimeout(experiment.faces,66);
   }
  },
  // faces
  faces: function() {
    if (dead) {
          showSlide("full-exit");
    } else {
    showSlide("present-faces");
    gotResp=false;
    timer=setTimeout(experiment.resp, 66);
    faceOn = (new Date()).getTime();
    // Set up a function to react to keyboard input. Functions that are used to react to user input are called *event handlers*. In addition to writing these event handlers, you have to *bind* them to particular events (i.e., tell the browser that you actually want the handler to run when the user performs an action). Note that the handler always takes an <code>event</code> argument, which is an object that provides data about the user input (e.g., where they clicked, which button they pressed).
    var keyPressHandler = function(event) {
      // A slight disadvantage of this code is that you have to test for numeric key values; instead of writing code that expresses "*do X if 'Q' was pressed*", you have to do the more complicated "*do X if the key with code 80 was pressed*". A library like [Keymaster](http://github.com/madrobby/keymaster) lets you write simpler code like <code>key('a', function(){ alert('you pressed a!') })</code>, but I've omitted it here. Here, we get the numeric key code from the event object
      var keyCode = event.which;
      
      if (keyCode != 38 && keyCode != 40) {
        // If a key that we don't care about is pressed, re-attach the handler (see the end of this script for more info)
        $(document).one("keydown", keyPressHandler);
        
      } else {
        // If a valid key is pressed (code 80 is p, 81 is q),
        // record the reaction time (current time minus start time), which key was pressed, and what that means (even or odd).

        // $("#ntrial").text(experiment.nTrial);
        var endTime = (new Date()).getTime();
        gotResp = true;
        var key = (keyCode == 38) ? "up" : "down",
            
            response = {
              keypress: key,
              // stimulus: n,
              // accuracy: realParity == userParity ? 1 : 0,
              rt: endTime - faceOn,
              earlyresp: gotResp,
              trial: curTrial
            };
        
        allData.exptresp.push(response);
        rerun=false;
        // experiment.resp();
      }
  };
 // Here, we actually bind the handler. We're using jQuery's <code>one()</code> function, which ensures that the handler can only run once. This is very important, because generally you only want the handler to run only once per trial. If you don't bind with <code>one()</code>, the handler might run multiple times per trial, which can be disastrous. For instance, if the user accidentally presses P twice, you'll be recording an extra copy of the data for this trial and (even worse) you will be calling <code>experiment.next</code> twice, which will cause trials to be skipped! That said, there are certainly cases where you do want to run an event handler multiple times per trial. In this case, you want to use the <code>bind()</code> and <code>unbind()</code> functions, but you have to be extra careful about properly unbinding.
     // if (!rerun){
    $(document).one("keydown", keyPressHandler);
    // } else {
    }
  },

  nextTrial: function() {
    // If the number of remaining trials is 0, we're done, so call the end function.
    if (experiment.trialSeq.length == 0 || curTrial==200) {
      // setTimeout(experiment.end,2000);
      experiment.end();
      return;
    }
    // experiment.nTrial = experiment.nTrial + 1;
    curTrial++
    $("#ntrial").text(curTrial);
    $("#instText").text("");
    // console.log(curTrial);
      thisVerticalShifts = randomElement(allVerticalShifts);
      thisITI = getITI();
      var thisCond = experiment.trialSeq.shift();
      var testFace = imgDir + "img" + thisCond.face + "_contrast" + thisCond.testContrast + ".png";
      var standardFace = imgDir + "img" + thisCond.face + "_contrast" + standardContrast + ".png";
      var thisCue = thisCond.cue;

      testLeft = (thisCond.testPos == "left");
      $("#left-face").attr('src', testLeft ? testFace:standardFace);
      $("#right-face").attr('src', testLeft ? standardFace:testFace);

      leftUp = (thisVerticalShifts["up"] == "left");
      $("#left-face").attr('class',leftUp ? "picture horAlign left-pos up":"picture horAlign left-pos down");
      $("#right-face").attr('class',leftUp ? "picture horAlign right-pos down":"picture horAlign right-pos up");
      //jquery add class
      testCued = (thisCue == "test");
      if ((testCued && testLeft) || (!testCued && !testLeft)) {
        var cueLoc = "leftCue"; // left cued        
        $("#cueing").attr('class', leftUp ? cueLoc+" horAlign up":cueLoc+" horAlign down");
      } else if ((testCued && !testLeft) || (!testCued && testLeft)) {
        var cueLoc = "rightCue";
        $("#cueing").attr('class', leftUp ? cueLoc+" horAlign down":cueLoc+" horAlign up");
      };

      if (testLeft) {
        if (leftUp) {
          var testVertical = "up";
          var standardVertical = "down";
        } else {
          var testVertical = "down";
          var standardVertical = "up";
        }
      } else {
        if (leftUp) {
          var testVertical = "down";
          var standardVertical = "up";
        } else {
          var testVertical = "up";
          var standardVertical = "down";
        }
      };

      // // correct or incorrect
      // if (thisTestContrast < 3) {
      // var correctAns  =  standardVertical;   //standard
      // } else {
      //   correctAns = testVertical;
      // };

      var stimulus = {
        cue:thisCue,
        testContrast: thisCond.testContrast,
        face: thisCond.face,
        cue: thisCue,
        testPos:thisCond.testPos,
        leftUp: leftUp,
        cueLoc: cueLoc,
        testVertical: testVertical,
        ITI: thisITI,
        trial: curTrial
      };
      
      allData.exptstim.push(stimulus);

      if (curTrial==1) {
        experiment.ready();
      } else if (curTrial==68 || curTrial==135) {
        experiment.break();
      } else {
        experiment.fixation();
      };
      
  },
  // response
  resp: function() {
    $(document).unbind('keydown');
    // Get the current time so we can compute reaction time later.
    if (dead) {
          showSlide("full-exit");
    } else {
      showSlide("fixation");
    }
    var startTime = (new Date()).getTime();
    if (gotResp) {
      setTimeout(experiment.nextTrial,5000);
    } else {
    // Set up a function to react to keyboard input. Functions that are used to react to user input are called *event handlers*. In addition to writing these event handlers, you have to *bind* them to particular events (i.e., tell the browser that you actually want the handler to run when the user performs an action). Note that the handler always takes an <code>event</code> argument, which is an object that provides data about the user input (e.g., where they clicked, which button they pressed).
    var keyPressHandler = function(event) {
      // A slight disadvantage of this code is that you have to test for numeric key values; instead of writing code that expresses "*do X if 'Q' was pressed*", you have to do the more complicated "*do X if the key with code 80 was pressed*". A library like [Keymaster](http://github.com/madrobby/keymaster) lets you write simpler code like <code>key('a', function(){ alert('you pressed a!') })</code>, but I've omitted it here. Here, we get the numeric key code from the event object
      var keyCode = event.which;
      
      if (keyCode != 38 && keyCode != 40) {
        // If a key that we don't care about is pressed, re-attach the handler (see the end of this script for more info)
        $(document).one("keydown", keyPressHandler);
        
      } else {
        // If a valid key is pressed (code 80 is p, 81 is q),
        // record the reaction time (current time minus start time), which key was pressed, and what that means (even or odd).

        // $("#ntrial").text(experiment.nTrial);
        var endTime = (new Date()).getTime(),
            key = (keyCode == 38) ? "up" : "down",
            
            response = {
              keypress: key,
              // stimulus: n,
              // accuracy: realParity == userParity ? 1 : 0,
              rt: endTime - faceOn,
              earlyresp: gotResp,
              trial: curTrial
            };
        
        allData.exptresp.push(response);
        rerun=false;
        experiment.nextTrial();
      }
    };
 // Here, we actually bind the handler. We're using jQuery's <code>one()</code> function, which ensures that the handler can only run once. This is very important, because generally you only want the handler to run only once per trial. If you don't bind with <code>one()</code>, the handler might run multiple times per trial, which can be disastrous. For instance, if the user accidentally presses P twice, you'll be recording an extra copy of the data for this trial and (even worse) you will be calling <code>experiment.next</code> twice, which will cause trials to be skipped! That said, there are certainly cases where you do want to run an event handler multiple times per trial. In this case, you want to use the <code>bind()</code> and <code>unbind()</code> functions, but you have to be extra careful about properly unbinding.
     // if (!rerun){
    $(document).one("keydown", keyPressHandler);
  };
    // } else {
    //   return;
    // };
  },

  run: function () {
    onintro=false;
    document.getElementById("return-button").onclick = experiment.runFromDead;
    document.getElementById("start-button").onclick = experiment.nextTrial;
    launchFullScreen(document.documentElement);
    watchingFull = true;
    exptStart = new Date();
    experiment.addFullscreenEvents_setupNext();
  },
  runFromDead: function() {
    dead = false;
    launchFullScreen(document.documentElement)
    experiment.addFullscreenEvents_setupNext();
  },
  setupNext: function() {
    document.getElementById("return-button").onclick = experiment.runFromDead;
    if (!dead) {
      if (curTrial > 0) {

          document.getElementById("start-button").onclick = experiment.fixation;
          rerun=true;
          showSlide("trial-start");
        
        // }
      } else { //curTrial==0      
          document.getElementById("start-button").onclick = experiment.nextTrial;
          showSlide("trial-start");
      };

    } else {   //dead == true
      showSlide("full-exit");
    };
  },

  addFullscreenEvents_setupNext: function() {
    document.addEventListener('webkitfullscreenchange', exitHandler, false);
      document.addEventListener('mozfullscreenchange', exitHandler, false);
      document.addEventListener('fullscreenchange', exitHandler, false);
      document.addEventListener('MSFullscreenChange', exitHandler, false);

      if (onintro) {
        showSlide("expt-start")
      } else if (onbreak) {
        showSlide("break")

      } else {
        experiment.setupNext();
      };
      
  },
  break: function() {
    onbreak=true;
    $(document.body).css("cursor","auto")
    blockCount++;
    $("#block-completed").text(blockCount);
    showSlide("break");
  },
  nextBlock: function() {
    onbreak=false;
    document.getElementById("start-button").onclick = experiment.ready;
    showSlide("trial-start");
  }
}



