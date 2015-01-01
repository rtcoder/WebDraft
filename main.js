var canvas,
	ctx,
	randomId,
	isDrawing = false,
	points = [ ],
	paint = {
		key : {
			Ctrl  : false,//press Control (Ctrl)
			Shift : false,//press Shift
			Alt   : false,//press Alt
			Enter : false,//press Enter
			Esc   : false,//press Escape (Esc)
			f11   : false,//press F11
			f12   : false //press F12
		},
		click : {
			left  : false, //left mouse button
			right : false  //right mouse button
		},
		mPosition : {
			x : 0,
			y : 0
		},
		draw : {
			width       : 600,
			height      : 400,
			thisParrent : "#drawHandler",
			selectorId  : "#draw",
			bg          : "url('pic/transparent.png') repeat",
		},
		shadow : {
			isShadow : false,
			blur     : 1,
			color    : "#232324"
		},
		size : 10,
		sensitivityPoints : 1000,
		color : "#000000",
		selectTool : "pencil"
	};
function makeid(){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for( var i=0; i < 15; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}
function resize(){
	$("html, body, #paint").css({
		"width"  : $(window).width(),
		"height" : $(window).height()
	})
	$("#content").css({
		"width"  : $(window).width(),
		"height" : $(window).height() - 30
	}).perfectScrollbar()
	$("#resizer").css({
		marginLeft : ( $("#content").width() - $("#resizer").width() )/2+"px",
		marginTop  : ( $("#content").height() - $("#resizer").height() )/2+"px"
	})
	var i = 0,
		w = 0;
	$(".tools").each(function(){
		w += $(".tools#t"+i).width()+5
		$(this).css({
			marginLeft : w,
			marginTop  : 10
		})
		i++;
	})
}
function drawPos(){
	var image = ctx.getImageData(0, 0 , paint.draw.width, paint.draw.height);
	$(paint.draw.selectorId).css({
		"width"  : paint.draw.width,
		"height" : paint.draw.height
	})
	$(paint.draw.thisParrent).css({
		"background" : paint.draw.bg,
		"width"      : paint.draw.width,
		"height"     : paint.draw.height
	})
	$("canvas")
		.attr("width" , paint.draw.width)
		.attr("height" , paint.draw.height)
	if(paint.draw.width >= $("#content").width()){
		$(paint.draw.thisParrent).css({"margin-left" : "0px"})
	}else{
		$(paint.draw.thisParrent).css({"margin-left" : ($("#content").width() - paint.draw.width)/2})
	}
	if(paint.draw.height >= $("#content").height()){
		$(paint.draw.thisParrent).css({"margin-top" :"0px"})
	}else{
		$(paint.draw.thisParrent).css({"margin-top":($("#content").height() - paint.draw.height)/2})
	}
	$("#content").perfectScrollbar()
	ctx.putImageData(image, 0, 0)
	$("title").text("WebDraft v1.0 ["+paint.draw.width+" x "+paint.draw.height+"]")
	$("html, body, #paint").fadeIn()
}
function drawStyle(){
	ctx.lineWidth = paint.size;
	ctx.lineJoin = ctx.lineCap = 'round';
	if(paint.shadow.isShadow === true){
		ctx.shadowBlur = paint.shadow.blur;
		ctx.shadowColor = paint.shadow.color;
	}else{
		ctx.shadowBlur = 0;
	}
	ctx.strokeStyle = paint.color;//line color
}
function erase(){
	ctx.clearRect(paint.mPosition.x,paint.mPosition.y,paint.size,paint.size);
	points = [ ]
}
function drawing(){
	ctx.beginPath()
	ctx.moveTo(paint.mPosition.x, paint.mPosition.y);
	drawStyle();
	ctx.lineTo(paint.mPosition.x, paint.mPosition.y);
	ctx.stroke();
}
function drawWeb(){
	ctx.beginPath();
	drawStyle();
	ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
	ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
	ctx.stroke();
	for (var i = 0, len = points.length; i < len; i++) {
		dx = points[i].x - points[points.length-1].x;
		dy = points[i].y - points[points.length-1].y;
		d = dx * dx + dy * dy;
		if (d < paint.sensitivityPoints) {
			ctx.beginPath();
			drawStyle();
			ctx.moveTo( points[points.length-1].x + (dx * 0.2), points[points.length-1].y + (dy * 0.2));
			ctx.lineTo( points[i].x - (dx * 0.2), points[i].y - (dy * 0.2));
			ctx.stroke();
		}
	}
}
function mousePosition(event){
	paint.mPosition.x = event.pageX - parseInt( $(paint.draw.selectorId).offset().left ),
	paint.mPosition.y = event.pageY - parseInt( $(paint.draw.selectorId).offset().top );
	$("#mousePosition").text(paint.mPosition.x+" , "+paint.mPosition.y)
}
function init(){
	randomId = makeid()//generare random id for canvas selector
	$(paint.draw.selectorId).append('<canvas id="'+randomId+'" width="'+paint.draw.width+'" height="'+paint.draw.height+'"></canvas>');
	canvas = document.getElementById(randomId);
	ctx = canvas.getContext('2d');
	//events on #draw
	$(paint.draw.selectorId).find("canvas#"+randomId)
		.hover(function(){
			ctx.beginPath()
			ctx.stroke();
		})
		.bind("contextmenu",function(event){
			event.preventDefault()
			paint.click.right = true;
			paint.click.left  = false;
		})
		.mousedown(function(event){
			paint.click.left = true;
			if(!paint.click.right && paint.click.left){
				points.push({ x: paint.mPosition.x, y: paint.mPosition.y });
				switch( paint.selectTool ){
					case "pencil" :
						drawing()
					break;
					case "eraser" :
						erase()
					break;
				}
			}
		})
		.mouseup(function() {
			paint.click.left  = false;
			paint.click.right = false;
			ctx.beginPath()
			ctx.stroke();
		})
		.mousemove(function(event){
			mousePosition(event);
			if(paint.click.left && !paint.click.right){
				points.push({ x: paint.mPosition.x, y: paint.mPosition.y });
				switch(paint.selectTool){
					case "pencil" :
						drawStyle();
						ctx.lineTo(paint.mPosition.x, paint.mPosition.y);
						ctx.stroke();
					break;
					case "common" :
						drawWeb()
					break;
					case "eraser" :
						erase()
					break;
				}
			}
		})
		.mouseleave(function(){
			$("#mousePosition").empty()
			ctx.stroke();
		})
}
$(window)
	.resize(function(){
		resize();
		drawPos();
	})
	.bind('mousewheel DOMMouseScroll', function(event) {
		if(paint.key.Ctrl === true){ event.preventDefault() } //press control - do nothing
		if(paint.key.Alt === true){}
	});
$(document)
	.keydown(function(event){
		if(paint.key.f12 === true || event.keyCode == 123){ event.preventDefault() }
		if(paint.key.f11 === true || event.keyCode == 122){ event.preventDefault() }
		if(paint.key.Ctrl === true || event.keyCode == 17){ event.preventDefault() }
	})
	.ready(function(event){
		$("#isShadow").button()
		var pointStyle="",
		kolo;
		init();
		//draggable .tools & #resizer
		$(".tools")
			.draggable({
				//snap    : true,
				handle  : ".title",
				opacity : 0.75
			})
			.css("position","absolute")
		$("#resizer")
			.draggable({
				//snap    : true,
				opacity : 0.75
			})
			.css("position","absolute")
		//switch tool panels visibility
		$(".toggle_visibility").click(function(){
			var switcher = $(this),
				panel    = switcher.parent(),
				icon     = switcher.find(".fa");
			panel.find(".show_hide").slideToggle()
			switch(icon.attr("class")){
				case "fa fa-chevron-down" :
					icon.removeClass("fa fa-chevron-down").addClass("fa fa-chevron-up")
				break;
				case "fa fa-chevron-up" :
					icon.removeClass("fa fa-chevron-up").addClass("fa fa-chevron-down")
				break;
			}
		})
		//Save button Click event
		$("#btnSave").click(function(){
			html2canvas($(paint.draw.selectorId),{
				onrendered: function(canvas){
					var img = canvas.toDataURL()
					window.open(img);
				}
			});
		});
		$(".paintTool").click(function(){
			$(".paintTool").removeClass("active");
			$(this).addClass("active")
			if($(this).attr("id") == "common"){
				$("#sensitivityPoints_slider").show()
			}else{
				$("#sensitivityPoints_slider").hide()
			}
		})
		$("#resizeDraw").click(function(){
			$("#resizer").fadeIn()
			$("input[type=number]#drawWidth").val(paint.draw.width)
			$("input[type=number]#drawHeight").val(paint.draw.height)
			$("#resizeinfo").html(paint.draw.width+" <i class='fa fa-times'></i> "+paint.draw.height)
		})
		$("#cancel").click(function(){
			$("#resizer").fadeOut();
			$("input[type=number]#drawWidth").val(paint.draw.width)
			$("input[type=number]#drawHeight").val(paint.draw.height)
		})
		$("#apply").click(function(){
			$("#resizer").fadeOut();
			paint.draw.width=$("input[type=number]#drawWidth").val()
			paint.draw.height=$("input[type=number]#drawHeight").val()
			drawPos()
		})
		//Clear button Click event
		$("#btnCLear").click(function(){
			$(paint.draw.selectorId).empty()
			points = [ ];
			init();
		})
		//changing size
		$("input[type=range]#pointSize").change(function(){
			paint.size = $(this).val();
			$("#pointSizeValue").text("size:"+$(this).val()+"px")
		})
		//changing shadow blur
		$("input[type=range]#ShadowBlur").change(function(){
			paint.shadow.blur = $(this).val();
			$("#ShadowBlurValue").text("shadow:"+$(this).val()+"px")
		})
		//changing sensitivity of common points
		$("input[type=range]#sensitivityPoints").change(function(){
			paint.sensitivityPoints = $(this).val();
			$("#sensitivityPointsValue").text("sensitivity:"+$(this).val()/1000+"%")
		})
		//choosing pencil
		$("#pencil").click(function(){
			paint.selectTool = "pencil";
		})
		//choosing pencil
		$("#common").click(function(){
			paint.selectTool = "common";
		})
		//choosing pencil
		$("#eraser").click(function(){
			paint.selectTool = "eraser";
		})
		//setting first Color
		$("#generalColor").click(function(){
			$("input[type=color]#firstColor").click()
		})
		//setting second Color
		$("#backgroundColor").click(function(){
			$("input[type=color]#secondColor").click()
		})
		//setting shadow Color
		$("#shadowColor").click(function(){
			$("input[type=color]#shadowColorVal").click()
		})
		//changing first color input
		$("input[type=color]#firstColor").change(function(){
			$("#generalColor .color").css({"background" : $(this).val()})
			paint.color = $(this).val()
		})
		//changing second color input
		$("input[type=color]#shadowColorVal").change(function(){
			$("#shadowColor .color").css({"background" : $(this).val()})
			paint.shadow.color = $(this).val()
		})
		$("#resizer input[type=number]")
			.change(function(){
				var xSize=parseInt($("input[type=number]#drawWidth").val())
				var ySize=parseInt($("input[type=number]#drawHeight").val())
				$("#resizeinfo").html(xSize+" <i class='fa fa-times'></i> "+ySize)
			}).keyup(function(e){
				var v = $(this).val().replace(/[^\d\.]/g, '');
				$(this).val(v)
				$(this).change()
				if(e.keyCode == 13){
					$("#apply").click()
				}else if(e.keyCode == 27){
					$("#cancel").click()
				}
			})
		$("input[type=checkbox]#isShadow").change(function(){
			paint.shadow.isShadow = $(this).is(":checked")//return true if is :checked or false if not
			if(paint.shadow.isShadow){
				$("#shadowColor, #shadow_slider").show()
			}else{
				$("#shadowColor, #shadow_slider").hide()
			}
		})
	})
	.bind("contextmenu",function(e){
		e.preventDefault();
	})
	.keydown(function(e){
		switch(e.keyCode){
			case 13 :
				paint.key.Enter = true;
			break;
			case 16 :
				paint.key.Shift = true;
			break;
			case 17 :
				paint.key.Ctrl = true;
			break;
			case 18 :
				paint.key.Alt = true;
			break;
			case 27 :
				paint.key.Esc = true
			break;
			case 122 :
				paint.key.f11 = true
			break;
			case 123 :
				paint.key.f12 = true
			break;
		}
	})
	.keyup(function(e){
		switch(e.keyCode){
			case 13 :
				paint.key.Enter = false;
			break;
			case 16 :
				paint.key.Shift = false;
			break;
			case 17 :
				paint.key.Ctrl = false;
			break;
			case 18 :
				paint.key.Alt = false;
			break;
			case 27 :
				paint.key.Esc = false
			break;
			case 122 :
				paint.key.f11 = false
			break;
			case 123 :
				paint.key.f12 = false
			break;
		}
	})
	.mouseup(function(){
			paint.click.left  = false;
			paint.click.right = false;
	})
