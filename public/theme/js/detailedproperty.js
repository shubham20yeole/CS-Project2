$( document ).ready(function() {
	$("#contactdiv").hide();
    var features = $("#features").val();
    var images = $("#allimages").val();
	var x = features.split(','); // have to quote regular expressions with /
	var y = images.split(' '); // have to quote regular expressions with /
	var xL = x.length;
	var yL = y.length;
	for(i=0; i<xL; i++){
		$('#append').append('<li>'+x[i]+'</li>'); // do what
	}
	var imagestoappend = "";
	for(j=0; j<yL; j++){
		imagestoappend = imagestoappend + '<img src="'+y[j]+'" alt="img">'; // do what
	}

	$(".aa-propersties-details-img").html(imagestoappend);
	$("#ctnprpbtn").click(function() {

		$("#contactdiv").before("<br><br><br>");
		$("#contactdiv").show().addClass("animated swing");

		$("#clicktoscroll").click();
	});
});
