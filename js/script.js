var isMobile = false;
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
	isMobile = true;
}

function smooth_scrolling() {
	$('a').click(function(){
		$('html, body').animate({
			scrollTop: $( $(this).attr('href') ).offset().top
		}, 500);
		return false;
	});
}

function banner_opacity() {
	var banner_opacity_mouseover = 0.93;
    var banner_opacity_mouseout = 0.66;
	var banner = $('#navigation_bar');
    banner.mouseover(function(){
		banner.css("opacity", banner_opacity_mouseover);
    });
    banner.mouseout(function(){
		banner.css("opacity", banner_opacity_mouseout);
    });
	var b_pos = banner.offset().top;
	$(window).scroll(function (){ // binds the following to when the user scrolls
		var y = $(this).scrollTop();
		if(y == 0){
			banner_opacity_mouseover = 0.93;
            banner_opacity_mouseout = 0.66;
		} else {
			banner_opacity_mouseover = 0.70;
            banner_opacity_mouseout = 0.5;
		}
		banner.stop().animate({
						'opacity':banner_opacity_mouseout				
						},400);
	});
}

$(document).ready( function() { /* executes first */
	console.log('document is ready');
    banner_opacity();
    if(isMobile){
        console.log('Mobile detected');
    } else {
		console.log('Desktop detected.');
	}
});

window.onload = function(){ /* executes secondly */
    console.log('window is loaded');
    smooth_scrolling();
};

$(window).resize(function() {
	console.log('window was resized');
});