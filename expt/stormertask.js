

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
      callback()
    }
  });
}

function preloadComplete() {
    $z.showSlide("preloaded");
    setTimeout(nextInstruction(), 1000); 
}