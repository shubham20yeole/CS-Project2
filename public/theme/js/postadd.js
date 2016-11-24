
$(document).on("change","#file",function() { 
       var input = document.getElementById("file");
var fReader = new FileReader();
fReader.readAsDataURL(input.files[0]);
fReader.onloadend = function(event){
var img = document.getElementById("file");

img.src = event.target.result;
$("#showpath").text('Hello: <img src='+img.src+'>');
$("#showpath").append('Hello: <img id="" src='+img.src+'>');
}
    });

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