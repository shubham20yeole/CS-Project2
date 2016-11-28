$( document ).ready(function() {
      $("#fblogindivsec").hide();
      $("#timestamp").val(new Date().valueOf());
 });
$(document).on("change","#file",function() { 

        var input = document.getElementById("file");
        var fReader = new FileReader();
        fReader.readAsDataURL(input.files[0]);
        fReader.onloadend = function(event){
        var img = document.getElementById("file");

        img.src = event.target.result;
        $('#image').attr('src',img.src);
        var fullPath = $("#file").val();
			if (fullPath) {
			    var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
			    var filename = fullPath.substring(startIndex);
			    if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
			        filename = filename.substring(1);
			    }
			    var namewillbe = filename.split('.');
			    var stamp = $("#timestamp").val();
			    var photoname = namewillbe[0]+"-"+stamp+"."+namewillbe[1];
			    var photolink = "https://s3.amazonaws.com/shubhambucket123/"+photoname;
			    $("#photolink").val(photolink);
			    $("#photoname").val(photoname);
			}       
        }
    });