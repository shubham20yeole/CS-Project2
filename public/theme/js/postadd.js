$( document ).ready(function() {
    $("#timestamp").val(new Date().valueOf());
});
 
$(document).on("change","#file",function() { 
        var input = document.getElementById("file");
        var fReader = new FileReader();
        fReader.readAsDataURL(input.files[0]);
        fReader.onloadend = function(event){
        var img = document.getElementById("file");

        img.src = event.target.result;
        $("#image1").val(img.src);
       
        }
    });
$(document).on("click","#uploadimage",function() { 
   $.post( "/uploadimages/", { timestamp: $("#timestamp").val(), image1: $("#image1").val()})
    .done(function( data ) {
        $( "#showpath" ).append('<div style="font-weight: bold; background-color: #f9f7f8; padding: 2%; color: #3F51B5">Image 1 Uploaded Successfully</div>').addClass("animated slideInDown");
    });
});

$(document).on("click","#uploadimage2",function() { 
   $.post( "/uploadimages2/", { timestamp: $("#timestamp").val(), image2: $("#image2").val()})
    .done(function( data ) {
        $( "#image1" ).append('<div style="font-weight: bold; background-color: #f9f7f8; padding: 2%; color: #3F51B5">Uploaded Successfully</div>').addClass("animated slideInDown");
    });
});

$(document).on("click","#uploadimage3",function() { 
   $.post( "/uploadimages3/", { timestamp: $("#timestamp").val(), image3: $("#image3").val()})
    .done(function( data ) {
        $( "#image1" ).append('<div style="font-weight: bold; background-color: #f9f7f8; padding: 2%; color: #3F51B5">Uploaded Successfully</div>').addClass("animated slideInDown");
    });
});

$(document).on("click","#uploadimage4",function() { 
   $.post( "/uploadimages4/", { timestamp: $("#timestamp").val(), image4: $("#image4").val()})
    .done(function( data ) {
        $( "#image1" ).append('<div style="font-weight: bold; background-color: #f9f7f8; padding: 2%; color: #3F51B5">Uploaded Successfully</div>').addClass("animated slideInDown");
    });
});


$(document).on("change","#file2",function() { 
        var input = document.getElementById("file2");
        var fReader = new FileReader();
        fReader.readAsDataURL(input.files[0]);
        fReader.onloadend = function(event){
        var img = document.getElementById("file2");

        img.src = event.target.result;
        $("#image2").val(img.src);
        }
    });

$(document).on("change","#file3",function() { 
        var input = document.getElementById("file3");
        var fReader = new FileReader();
        fReader.readAsDataURL(input.files[0]);
        fReader.onloadend = function(event){
        var img = document.getElementById("file3");

        img.src = event.target.result;
        $("#image3").val(img.src);
        }
    });

$(document).on("change","#file4",function() { 
        var input = document.getElementById("file4");
        var fReader = new FileReader();
        fReader.readAsDataURL(input.files[0]);
        fReader.onloadend = function(event){
        var img = document.getElementById("file4");

        img.src = event.target.result;
        $("#image4").val(img.src);
        }
    });
var date = new Date(Date.UTC(2013, 1, 1, 14, 0, 0));
var options = {
    weekday: "long", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit"
};
$("#posttime").val(date.toLocaleTimeString("en-us", options));



// $(document).on("change","#file2",function() { 
//         var input = document.getElementById("file");
//         var fReader = new FileReader();
//         fReader.readAsDataURL(input.files[0]);
//         fReader.onloadend = function(event){
//         var img = document.getElementById("file");

//         img.src = event.target.result;

//         $("#image2").text(img.src);
//         $("#showpath").append('Hello: <img id="" src='+img.src+'>');
//         }
//     });

// (function($){
//     // document onReady wrapper
//     $(document).ready(function(){
//         // check for the nefarious IE
//         if($.browser.msie) {
//             // capture the file input fields
//             var fileInput = $('input[type="file"]');
//             // add presentational <span> tags "underneath" all file input fields for styling
//             fileInput.after(
//                 $(document.createElement('span')).addClass('file-underlay')
//             );
//             // bind onClick to get the file-path and update the style <div>
//             fileInput.click(function(){
//                 // need to capture $(this) because setTimeout() is on the
//                 // Window keyword 'this' changes context in it
//                 var fileContext = $(this);
//                 // capture the timer as well as set setTimeout()
//                 // we use setTimeout() because IE pauses timers when a file dialog opens
//                 // in this manner we give ourselves a "pseudo-onChange" handler
//                 var ieBugTimeout = setTimeout(function(){
//                     // set vars
//                     var filePath     = fileContext.val(),
//                         fileUnderlay = fileContext.siblings('.file-underlay');
//                     // check for IE's lovely security speil
//                     if(filePath.match(/fakepath/)) {
//                         // update the file-path text using case-insensitive regex
//                         filePath = filePath.replace(/C:\\fakepath\\/i, '');
//                     }
//                     // update the text in the file-underlay <span>
//                     fileUnderlay.text(filePath);
//                     $("#showpath").text(filePath);
//                     // clear the timer var
//                     clearTimeout(ieBugTimeout);
//                 }, 10);
//             });
//         }
//     });
// })(jQuery);