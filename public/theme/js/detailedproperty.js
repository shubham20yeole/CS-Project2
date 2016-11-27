$( document ).ready(function() {
	$("#contactdiv").hide();
    var features = $("#features").val();
	var x = features.split(','); // have to quote regular expressions with /
	var xL = x.length;
	for(i=0; i<xL; i++){
		$('#append').append('<li>'+x[i]+'</li>'); // do what
	}
	$("#ctnprpbtn").click(function() {

		$("#contactdiv").before("<br><br><br>");
		$("#contactdiv").show().addClass("animated swing");

		$("#clicktoscroll").click();
	});
});
