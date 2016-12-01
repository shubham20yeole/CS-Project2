$( document ).ready(function() {
	$(".link").click(function() {
		alert();
	});
 });
$(document).on("click",".link",function() { 
	var id = $(this).attr('id');
    $.post( "searchproperty", { timestamp: id})
    .done(function( property ) {	
    	var staddress = property.staddress+", "+property.city+", "+property.state+", "+property.zip+", "+property.country;			
    	$('#viewimage').attr('src',property.image1);
		$("#title").text(property.title);
    	$("#cost").text(property.cost);
    	$("#address").text(staddress);
    	$("#description").text(property.discription);
    	$("#features").text(property.title);
    });
});