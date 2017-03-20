// I'm implementing the experiment using a data structure that I call a **sequence**. The insight behind sequences is that many experiments consist of a sequence of largely homogeneous trials that vary based on a parameter. For instance, in this example experiment, a lot stays the same from trial to trial - we always have to present some number, the subject always has to make a response, and we always want to record that response. Of course, the trials do differ - we're displaying a different number every time. The idea behind the sequence is to separate what stays the same from what differs - to **separate code from data**. This results in **parametric code**, which is much easier to maintain - it's simple to add, remove, or change conditions, do randomization, and do testing.

// ## High-level overview
// Things happen in this order:
// 
// 1. Compute randomization parameters (which keys to press for even/odd and trial order), fill in the template <code>{{}}</code> slots that indicate which keys to press for even/odd, and show the instructions slide.
// 2. Set up the experiment sequence object.
// 3. When the subject clicks the start button, it calls <code>experiment.next()</code>
// 4. <code>experiment.next()</code> checks if there are any trials left to do. If there aren't, it calls <code>experiment.end()</code>, which shows the finish slide, waits for 1.5 seconds, and then uses mmturkey to submit to Turk.
// 5. If there are more trials left, <code>experiment.next()</code> shows the next trial, records the current time for computing reaction time, and sets up a listener for a key press.
// 6. The key press listener, when it detects either a P or a Q, constructs a data object, which includes the presented stimulus number, RT (current time - start time), and whether or not the subject was correct. This entire object gets pushed into the <code>experiment.data</code> array. Then we show a blank screen and wait 500 milliseconds before calling <code>experiment.next()</code> again.

// ## Helper functions

// Shows slides. We're using jQuery here - the **$** is the jQuery selector function, which takes as input either a DOM element or a CSS selector string.
function showSlide(id) {
  // Hide all slides
	$(".slide").hide();
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
        if (curTrial > 0) {trial.pushData(true);}
          showSlide("full-exit");
      }
  } 
}

// for (int i = 0; i < 20; i++) { faces[i] = i+1; }
// ## Configuration settings
var testContrast = [1,2,3,4,5],
    standardContrast = 3,
    allVerticalShifts = [
      {"up":"left","down":"right"},
      {"up":"right","down":"left"} ],
    testPos= ['left','right'],
    imgDir = "images/FaceStim/";

// Fill in the instructions template using jQuery's <code>html()</code> method. In particular,
// let the subject know which keys correspond to even/odd. Here, I'm using the so-called **ternary operator**, which is a shorthand for <code>if (...) { ... } else { ... }</code>

$("#up-key").text("UP");
$("#down-key").text("DOWN");

var factors = {
  face: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
  testContrast: [1,2,3,4,5],
  testPos: ['left','right'], //1=left, 2=right
  cue: ['standard','test']
}
// create full factorial design. rep = 1. unpack=false.
var full_design = jsPsych.randomization.factorial(factors, 1);

var imgArray = new Array();
function preload(callback) {
  showSlide("preloaded");
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
      callback()
    }
  });
}

// create mini factorial design for pracice trials (40)
var factors_practice = {
  face: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
  cue: ['standard','test']
}
var mini_design = jsPsych.randomization.factorial(factors_practice, 1);

// Show the instructions slide -- this is what we want subjects to see first.
showSlide("instructions");

function preloadComplete() {
    showSlide("preloaded");
    setTimeout(function() {showSlide("inst1")}, 700); 
}

var instruction2=function() {
    showSlide("inst2");
}

// ## PRESCREENING ## //
// ## practice trials
var practice = {
  pracStart: new Date(),
  pracSeq: mini_design,
  pracData: [],
  contrastTest: [],
  nTrial : 0,

  end: function() {

  },
  ready: function() {
     $("#instText").text("Ready!");
     showSlide("fixation");
    setTimeout(practice.fixateInst,1500);

  },
  fixateInst: function() {
    $("#instText").text("Fixate the cross");
    showSlide("fixation");
    setTimeout(practice.fixation,1200);
  },
  fixation: function() {
    $("#instText").text("");
    showSlide("fixation");
    setTimeout(practice.cue,thisITI);

  },
      // cue
  cue: function() {
      showSlide("cue");
      setTimeout(practice.blank, 66); //70ms
    },
    // blank
  blank: function() {
    showSlide("fixation");
    setTimeout(practice.faces,blankDur);
  },
  // faces
  faces: function() {
    showSlide("present-faces");
    setTimeout(practice.resp, faceDur)
  },

  faceTest: function() {
    // Check whether the participant can actually see the contrast differences on their screen
    showSlide("present-faces");
    var startTime = (new Date()).getTime();
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
            
            contrastTest = {
              keypress: key,
              // stimulus: n,
              // accuracy: realParity == userParity ? 1 : 0,
              rt: endTime - startTime
            };
        
        practice.contrastTest.push(contrastTest);
        // Temporarily clear the number.
        // $("#number").text("");
        setTimeout(practice.nextTrial, 500);
         // experiment.nextTrial();
      }

  }
},

  nextTrial: function() {
    // If the number of remaining trials is 0, we're done, so call the end function.
    if (practice.pracSeq.length == 0) {
      practice.end();
      return;
    };
    practice.nTrial = practice.nTrial + 1;
    $("#ntrial").text(practice.nTrial);
    $("#instText").text("");
    
      thisVerticalShifts = randomElement(allVerticalShifts);
      thisITI = getITI();
      thisTestContrast = randomElement(testContrast);
      if (practice.nTrial < 6) {
        faceDur = 330;
        blankDur = 132;
        $("#instText").text("Respond");
      } else if ((practice.nTrial < 16) && (practice.nTrial > 5)) {//  after 5 trials
        faceDur = 132;
        blankDur = 132;
        $("#instText").text("Respond");
      } else {
        faceDur = 66;
        blankDur = 66;
        $("#instText").text("");
      };

      var thisCond = practice.pracSeq.shift();
      var testFace = imgDir + "img" + thisCond.face + "_contrast" + thisTestContrast + ".png";
      var standardFace = imgDir + "img" + thisCond.face + "_contrast" + standardContrast + ".png";
      var thisCue = thisCond.cue;
      
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

      var pracData = {
        stimulus: thisCond,
        vertical: thisVerticalShifts,
        testLoc: thisTestPos,
        leftUp: leftUp,
        cueLoc: cueLoc,
        ITI: thisITI

      };

      // practice.data.push(data);
      practice.ready();

  },
  // response
  resp: function() {

    if (practice.nTrial < 16) {
        $("#instText").text("Up or Down");
      } else {
        faceDur = 66;
        blankDur = 66;
        $("#instText").text("");
      };
    // Get the current time so we can compute reaction time later.
    
    showSlide("fixation");
    var startTime = (new Date()).getTime();
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
            
            pracData = {
              keypress: key,
              rt: endTime - startTime
            };
        
        practice.pracData.push(pracData);
        // Temporarily clear the number.
        // $("#number").text("");
        setTimeout(practice.nextTrial, 500);
         // experiment.nextTrial();
      }
  };
 // Here, we actually bind the handler. We're using jQuery's <code>one()</code> function, which ensures that the handler can only run once. This is very important, because generally you only want the handler to run only once per trial. If you don't bind with <code>one()</code>, the handler might run multiple times per trial, which can be disastrous. For instance, if the user accidentally presses P twice, you'll be recording an extra copy of the data for this trial and (even worse) you will be calling <code>experiment.next</code> twice, which will cause trials to be skipped! That said, there are certainly cases where you do want to run an event handler multiple times per trial. In this case, you want to use the <code>bind()</code> and <code>unbind()</code> functions, but you have to be extra careful about properly unbinding.
    $(document).one("keydown", keyPressHandler);
  }
}



// ## The main event
// I implement the sequence as an object with properties and methods. The benefit of encapsulating everything in an object is that it's conceptually coherent (i.e. the <code>data</code> variable belongs to this particular sequence and not any other) and allows you to **compose** sequences to build more complicated experiments. For instance, if you wanted an experiment with, say, a survey, a reaction time test, and a memory test presented in a number of different orders, you could easily do so by creating three separate sequences and dynamically setting the <code>end()</code> function for each sequence so that it points to the next. **More practically, you should stick everything in an object and submit that whole object so that you don't lose data (e.g. randomization parameters, what condition the subject is in, etc). Don't worry about the fact that some of the object properties are functions -- mmturkey (the Turk submission library) will strip these out.**

var experiment = {

  // An array to store the data that we're collecting.
  extpStart: new Date(),

  // Parameters for this sequence.
  trialSeq: full_design,

  // Experiment-specific parameters - which keys map to odd/even
  // An array to store the data that we're collecting.
  data: [],
  stimCond: [],
  nTrial: 0,
  // The function that gets called when the sequence is finished.
    end: function() {
      watchingFull = false;
    exitFullscreen();
    // Show the finish slide.
    showSlide("finished");
    // Wait 1.5 seconds and then submit the whole experiment object to Mechanical Turk (mmturkey filters out the functions so we know we're just submitting properties [i.e. data])
    setTimeout(function() { turk.submit(experiment) }, 1500);

    var json = JSON.stringify(experiment)
    console.log(json)
  },

  // The work horse of the sequence - what to do on every trial.
    nextTrial: function() {

         // If the number of remaining trials is 0, we're done, so call the end function.
    if (experiment.trialSeq.length == 0) {
      setTimeout(experiment.end,3000);
      return;
    }
    experiment.nTrial = experiment.nTrial + 1;
    $("#ntrial").text(experiment.nTrial);
    $("#instText").text("");

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

      var stimulus = {
        // stimulus: thisCond,
        cue: thisCue,
        testPos: thisCond.testPos,
        testContrast: thisCond.testContrast,
        face: thisCond.face,
        leftUp: leftUp,
        cueLoc: cueLoc,
        ITI: thisITI

      };

      experiment.stimCond.push(stimulus);

        experiment.fixation();
    },

    ready: function() {
     $("#instText").text("Ready!");
     showSlide("fixation");
    setTimeout(experiment.nextTrial,3000);

    },

    // fixation (ITI)
    fixation: function() {
      showSlide("fixation");
      setTimeout(experiment.cue,thisITI);
    },

    // cue
    cue: function() {
      showSlide("cue");
      setTimeout(experiment.blank, 66); //70ms
    },

    // blank
  blank: function() {
    showSlide("fixation");
    setTimeout(experiment.faces,66);
  },

  // faces
  faces: function() {
    showSlide("present-faces");
    setTimeout(experiment.resp, 66)

  },
    // response
  resp: function() {

    // Get the current time so we can compute reaction time later.
    var startTime = (new Date()).getTime();
    showSlide("fixation");
    
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
            
            data = {
              keypress: key,
              // stimulus: n,
              // accuracy: realParity == userParity ? 1 : 0,
              rt: endTime - startTime
            };
        
        experiment.data.push(data);
        // Temporarily clear the number.
        // $("#number").text("");
        setTimeout(experiment.nextTrial);
         // experiment.nextTrial();
      }
  };
  // Here, we actually bind the handler. We're using jQuery's <code>one()</code> function, which ensures that the handler can only run once. This is very important, because generally you only want the handler to run only once per trial. If you don't bind with <code>one()</code>, the handler might run multiple times per trial, which can be disastrous. For instance, if the user accidentally presses P twice, you'll be recording an extra copy of the data for this trial and (even worse) you will be calling <code>experiment.next</code> twice, which will cause trials to be skipped! That said, there are certainly cases where you do want to run an event handler multiple times per trial. In this case, you want to use the <code>bind()</code> and <code>unbind()</code> functions, but you have to be extra careful about properly unbinding.
    $(document).one("keydown", keyPressHandler);
  },

  addFullscreenEvents_setupNext: function() {
    document.addEventListener('webkitfullscreenchange', exitHandler, false);
      document.addEventListener('mozfullscreenchange', exitHandler, false);
      document.addEventListener('fullscreenchange', exitHandler, false);
      document.addEventListener('MSFullscreenChange', exitHandler, false);
      experiment.ready();
  },

  run: function() {
    launchFullScreen(document.documentElement)
    experiment.addFullscreenEvents_setupNext();
    watchingFull = true;
  },

  runFromDead: function() {
    if (curTrial > 0) {curTrial = curTrial - 1;}
    dead = false;
    launchFullScreen(document.documentElement)
    experiment.addFullscreenEvents_setupNext();
  }



}


