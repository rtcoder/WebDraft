var canvas,
	ctx,
	randomId,
	isDrawing = false,
	startShapePoints = [0,0],
	points = [ ],
	webDraft = {
		title : "WebDraft",
		version : "1.9",
		key : {
			Ctrl  : false,//press Control (Ctrl)
			Shift : false,//press Shift
			Alt   : false,//press Alt
			Enter : false,//press Enter
			Esc   : false,//press Escape (Esc)
			f11   : false,//press F11
			f12   : false,//press F12
			A     : false,
			B     : false,
			C     : false,
			D     : false,
			E     : false,
			F     : false,
			G     : false,
			H     : false,
			I     : false,
			J     : false,
			K     : false,
			L     : false,
			M     : false,
			N     : false,
			O     : false,
			P     : false,
			Q     : false,
			R     : false,
			S     : false,
			T     : false,
			U     : false,
			V     : false,
			W     : false,
			X     : false,
			Y     : false,
			Z     : false
		},
		click : {
			left  : false, //left mouse button
			right : false  //right mouse button
		},
		mPosition : {//mouse position on draw
			x : 0,
			y : 0
		},
		draw : {
			width        : 600,
			height       : 400,
			thisParrent  : "#drawHandler",
			selectorId   : "#draw",
			eventHandler : "#eventHandler",
			bg           : "url('pic/transparent.png') repeat",
		},
		shadow : {
			isShadow : false,
			blur     : 1,
			offsetX  : 0,
			offsetY  : 0,
			color    : "#232324"
		},
		fill : {
			isSet   : false,
			color   : "#ffffff",
			opacity : 100
		},
		text : {
			size     : 20,
			align    : "left",
			font     : "Arial",
			style    : "",
			value    : "",
			unfilled : false,
			pos      : {
				x : 0,
				y : 0
			}
			
		},
		size : 10,
		sensitivityPoints : 1000,
		color : "#000000",
		selectedTool : "pencil",//default is pencil
		func : {
			makeid : function(){
				var text = "";
				var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
				for( var i=0; i < 15; i++ )
					text += possible.charAt(Math.floor(Math.random() * possible.length));
				return text;
			},
			resize : function(){
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
			},
			drawPos : function(){
				var image = ctx.getImageData(0, 0 , webDraft.draw.width, webDraft.draw.height);
				$(webDraft.draw.selectorId+","+ webDraft.draw.eventHandler).css({
					"width"  : webDraft.draw.width,
					"height" : webDraft.draw.height
				})
				$(webDraft.draw.thisParrent).css({
					"background" : webDraft.draw.bg,
					"width"      : webDraft.draw.width,
					"height"     : webDraft.draw.height
				})
				$("canvas")
					.attr("width" , webDraft.draw.width)
					.attr("height" , webDraft.draw.height)
					
				if(webDraft.draw.width >= $("#content").width()){
					$(webDraft.draw.thisParrent).css({"margin-left" : "0px"})
				}else{
					$(webDraft.draw.thisParrent).css({"margin-left" : ($("#content").width() - webDraft.draw.width)/2})
				}
				if(webDraft.draw.height >= $("#content").height()){
					$(webDraft.draw.thisParrent).css({"margin-top" :"0px"})
				}else{
					$(webDraft.draw.thisParrent).css({"margin-top":($("#content").height() - webDraft.draw.height)/2})
				}
				
				$("#content").perfectScrollbar()
				ctx.putImageData(image, 0, 0)
				$("title").text(webDraft.title+" v"+webDraft.version)
				$("#layerSize").text(webDraft.draw.width+" x "+webDraft.draw.height)
				$("html, body, #paint").css({"visibility":"visible"})
			},
			moveEraseRect : function(event){
				$("#eraseRect").css({
					"width" : webDraft.size,
					"height" : webDraft.size,
					"top" : event.pageY-(webDraft.size/2)+"px",
					"left" : event.pageX-(webDraft.size/2)+"px"
				})
			},
			drawStyle : function(){
				ctx.lineWidth = webDraft.size;
				if(webDraft.selectedTool == "rectangle"){
					ctx.lineJoin = ctx.lineCap = 'miter';
				}else{
					ctx.lineJoin = ctx.lineCap = 'round';
				}
				if(webDraft.fill.isSet == true){
					ctx.fillStyle = convertHex(webDraft.fill.color, webDraft.fill.opacity)
				}else{
					ctx.fillStyle = "transparent"
				}
				if(webDraft.shadow.isShadow === true){
					ctx.shadowBlur = webDraft.shadow.blur;
					ctx.shadowColor = webDraft.shadow.color;
					ctx.shadowOffsetX = webDraft.shadow.offsetX;
					ctx.shadowOffsetY = webDraft.shadow.offsetY;
				}else{
					ctx.shadowBlur = 0;
				}
				ctx.strokeStyle = webDraft.color;//line color
			},
			erase : function(event){
				webDraft.func.moveEraseRect(event)
				ctx.clearRect(webDraft.mPosition.x-webDraft.size/2,webDraft.mPosition.y-webDraft.size/2,webDraft.size,webDraft.size);
				points = [ ]
			},
			drawing : function(){
				ctx.beginPath()
				ctx.moveTo(webDraft.mPosition.x, webDraft.mPosition.y);
				webDraft.func.drawStyle();
				ctx.lineTo(webDraft.mPosition.x, webDraft.mPosition.y);
				ctx.stroke();
			},
			drawWeb : function(){
				ctx.beginPath();
				webDraft.func.drawStyle();
				ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
				ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
				ctx.stroke();
				for (var i = 0, len = points.length; i < len; i++) {
					dx = points[i].x - points[points.length-1].x;
					dy = points[i].y - points[points.length-1].y;
					d = dx * dx + dy * dy;
					if (d < webDraft.sensitivityPoints) {
						ctx.beginPath();
						webDraft.func.drawStyle();
						ctx.moveTo( points[points.length-1].x + (dx * 0.2), points[points.length-1].y + (dy * 0.2));
						ctx.lineTo( points[i].x - (dx * 0.2), points[i].y - (dy * 0.2));
						ctx.stroke();
					}
				}
			},
			startShape : function(){
				startShapePoints = [webDraft.mPosition.x, webDraft.mPosition.y];
			},
			prepareRect : function(){
				if(startShapePoints[0] <= webDraft.mPosition.x){
					var x     = startShapePoints[0],
						width = webDraft.mPosition.x-startShapePoints[0];
				}else{
					var x     = webDraft.mPosition.x,
						width = startShapePoints[0]-webDraft.mPosition.x;
				}
				if(startShapePoints[1] <= webDraft.mPosition.y){
					var y      = startShapePoints[1],
						height = webDraft.mPosition.y-startShapePoints[1];
				}else{
					var y      = webDraft.mPosition.y,
						height = startShapePoints[1]-webDraft.mPosition.y;
				}
				$("#prepareRect").show().css({
					"top" :y + parseInt( $(webDraft.draw.selectorId).offset().top )+"px",
					"left" : x + parseInt( $(webDraft.draw.selectorId).offset().left )+"px",
					"width" : width+"px",
					"height" : height+"px",
					"border" : webDraft.size+"px solid "+webDraft.color
				})
				if(webDraft.fill.isSet){
					$("#prepareRect").css({
						"background" : convertHex(webDraft.fill.color, webDraft.fill.opacity)
					})
				}else{
					$("#prepareRect").css({
						"background" : "transparent"
					})
				}
				if(webDraft.shadow.isShadow){
					$("#prepareRect").css({
						"box-shadow" : webDraft.shadow.offsetX+"px "+webDraft.shadow.offsetY+"px "+webDraft.shadow.blur+"px "+webDraft.shadow.color
					})
				}else{
					$("#prepareRect").css({
						"box-shadow" : "none"
					})
				}
				
			},
			drawRect : function(){
				if(startShapePoints[0] <= webDraft.mPosition.x){
					var x     = startShapePoints[0],
						width = webDraft.mPosition.x-startShapePoints[0];
				}else{
					var x     = webDraft.mPosition.x,
						width = startShapePoints[0]-webDraft.mPosition.x;
				}
				if(startShapePoints[1] <= webDraft.mPosition.y){
					var y      = startShapePoints[1],
						height = webDraft.mPosition.y-startShapePoints[1];
				}else{
					var y      = webDraft.mPosition.y,
						height = startShapePoints[1]-webDraft.mPosition.y;
				}
				$("#prepareRect").hide()
				ctx.beginPath();
				webDraft.func.drawStyle();
				ctx.rect(x,y,width,height);
				ctx.fill();
				ctx.stroke();
			},
			prepareCircle : function(){
				var x = startShapePoints[0],
					y = startShapePoints[1];
					
				if(startShapePoints[0] <= webDraft.mPosition.x){
					var width = webDraft.mPosition.x-startShapePoints[0];
				}else{
					var width = startShapePoints[0]-webDraft.mPosition.x;
				}
				if(startShapePoints[1] <= webDraft.mPosition.y){
					var height = webDraft.mPosition.y-startShapePoints[1];
				}else{
					var height = startShapePoints[1]-webDraft.mPosition.y;
				}
				if(width>height)
					var radius = width/2;
				else
					var radius = height/2;
				$("#prepareCircle").show().css({
					"top" :y + parseInt( $(webDraft.draw.selectorId).offset().top ) - radius+"px",
					"left" : x + parseInt( $(webDraft.draw.selectorId).offset().left ) - radius+"px",
					"width" : radius*2+"px",
					"height" : radius*2+"px",
					"border" : webDraft.size+"px solid "+webDraft.color,
					"border-radius" : "100%"
				})
				if(webDraft.fill.isSet){
					$("#prepareCircle").css({
						"background" : convertHex(webDraft.fill.color, webDraft.fill.opacity)
					})
				}else{
					$("#prepareCircle").css({
						"background" : "transparent"
					})
				}
				if(webDraft.shadow.isShadow){
					$("#prepareCircle").css({
						"box-shadow" : webDraft.shadow.offsetX+"px "+webDraft.shadow.offsetY+"px "+webDraft.shadow.blur+"px "+webDraft.shadow.color
					})
				}else{
					$("#prepareCircle").css({
						"box-shadow" : "none"
					})
				}
			},
			drawCircle : function(){
				var x = startShapePoints[0],
					y = startShapePoints[1];
					
				if(startShapePoints[0] <= webDraft.mPosition.x){
					var width = webDraft.mPosition.x-startShapePoints[0];
				}else{
					var width = startShapePoints[0]-webDraft.mPosition.x;
				}
				if(startShapePoints[1] <= webDraft.mPosition.y){
					var height = webDraft.mPosition.y-startShapePoints[1];
				}else{
					var height = startShapePoints[1]-webDraft.mPosition.y;
				}
				if(width>height)
					var radius = width/2;
				else
					var radius = height/2;
				$("#prepareCircle").hide()
				ctx.beginPath();
				webDraft.func.drawStyle();
				ctx.arc(x,y, radius, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.stroke();
			},
			drawText : function(){
				webDraft.text.value = $("#textValue").val();
				webDraft.text.font = $("#selectFontType").val()
				webDraft.text.size = $("#selectFontSize").val()
				if(webDraft.text.value != ""){
					webDraft.text.pos.x = webDraft.mPosition.x;
					webDraft.text.pos.y = webDraft.mPosition.y;
					ctx.font = webDraft.text.style+" "+webDraft.text.size+"mm "+webDraft.text.font;
					ctx.textAlign = webDraft.text.align;
					if(webDraft.text.unfilled){
						ctx.strokeStyle = webDraft.color;
						ctx.strokeText(webDraft.text.value, webDraft.text.pos.x, webDraft.text.pos.y);
					}else{
						ctx.fillStyle = webDraft.color;
						ctx.fillText(webDraft.text.value, webDraft.text.pos.x, webDraft.text.pos.y);
					}
					webDraft.text.value = "";
				}
			},
			mousePosition : function(event){
				webDraft.mPosition.x = event.pageX - parseInt( $(webDraft.draw.selectorId).offset().left ),
				webDraft.mPosition.y = event.pageY - parseInt( $(webDraft.draw.selectorId).offset().top );
				$("#mousePosition").text(webDraft.mPosition.x+" , "+webDraft.mPosition.y)
			},
			init : function(){
				randomId = webDraft.func.makeid()//generare random id for canvas selector
				$(webDraft.draw.selectorId).append('<canvas id="'+randomId+'" width="'+webDraft.draw.width+'" height="'+webDraft.draw.height+'"></canvas>');
				canvas = document.getElementById(randomId);
				ctx = canvas.getContext('2d');
				//events on #draw
				//$(webDraft.draw.selectorId).find("canvas#"+randomId)
				$(webDraft.draw.eventHandler)
					.hover(function(){
						ctx.beginPath()
						ctx.stroke();
					})
					.bind("contextmenu",function(event){
						event.preventDefault()
						webDraft.click.right = true;
						webDraft.click.left  = false;
					})
					.mousedown(function(event){
						webDraft.click.left = true;
						if(!webDraft.click.right && webDraft.click.left){
							points.push({ x: webDraft.mPosition.x, y: webDraft.mPosition.y });
							switch( webDraft.selectedTool ){
								case "pencil" :
									webDraft.func.drawing();
								break;
								case "eraser" :
									webDraft.func.erase(event);
								break;
								case "rectangle" :
									webDraft.func.startShape();
								break;
								case "circle" :
									webDraft.func.startShape();
								break;
								case "text" :
									webDraft.func.drawText();
								break
							}
						}
					})
					.mouseup(function() {
						webDraft.click.left  = false;
						webDraft.click.right = false;
						ctx.beginPath()
						ctx.stroke();
						switch(webDraft.selectedTool){
							case "rectangle":
								webDraft.func.drawRect();
							break;
							case "circle":
								webDraft.func.drawCircle();
							break;
						}
					})
					.mousemove(function(event){
						webDraft.func.mousePosition(event);
						if(webDraft.selectedTool=="eraser")
							webDraft.func.moveEraseRect(event)
						if(webDraft.click.left && !webDraft.click.right){
							points.push({ x: webDraft.mPosition.x, y: webDraft.mPosition.y });
							switch(webDraft.selectedTool){
								case "pencil" :
									webDraft.func.drawStyle();
									ctx.lineTo(webDraft.mPosition.x, webDraft.mPosition.y);
									ctx.stroke();
								break;
								case "web" :
									webDraft.func.drawWeb();
								break;
								case "eraser" :
									webDraft.func.erase(event);
								break;
								case "rectangle" :
									webDraft.func.prepareRect();
								break;
								case "circle" :
									webDraft.func.prepareCircle();
								break;
							}
						}
					})
					.mouseleave(function(){
						$("#mousePosition").empty()
						ctx.stroke();
					})
			}
		}
	};
function convertHex(hex,opacity){
	hex = hex.replace('#','');
	r = parseInt(hex.substring(0,2), 16);
	g = parseInt(hex.substring(2,4), 16);
	b = parseInt(hex.substring(4,6), 16);

	result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
	return result;
}

$(window)
	.resize(function(){
		webDraft.func.resize();
		webDraft.func.drawPos();
	})
	.bind('mousewheel DOMMouseScroll', function(event) {
		if(webDraft.key.Ctrl === true){
			event.preventDefault()
			if(event.originalEvent.wheelDelta /120 > 0){
				if(webDraft.size < 250)
					webDraft.size++;
			}
			else{
				if(webDraft.size > 1)
					webDraft.size--;
			}
			$("input#pointSize").val(webDraft.size)
			$("#pointSizeValue").text("size:"+webDraft.size+"px")
		}
		if(webDraft.key.Alt === true){ event.preventDefault() }
	});
$(document)
	.keydown(function(event){
		if(webDraft.key.f12 === true || event.keyCode == 123){ event.preventDefault() }
		if(webDraft.key.f11 === true || event.keyCode == 122){ event.preventDefault() }
		if(webDraft.key.Ctrl === true || event.keyCode == 17){
			event.preventDefault();
			if(webDraft.key.S){
				$("#btnSave").click()
			}
		}
	})
	.ready(function(event){
		$("#isShadow, #isFillSet, #unfilled").button()
		var pointStyle="",
		kolo;
		webDraft.func.init();
		//draggable .tools & #resizer
		$("#tools_group")
			.draggable({
				snap    : true,
				handle  : ".title.draghandler",
				opacity : 0.75
			})
			.css("position","absolute")
		$("#resizer")
			.draggable({
				snap    : true,
				opacity : 0.75
			})
			.css("position","absolute")
		//switch tool panels visibility
		$(".toggle_visibility").click(function(){
			var icon  = $(this),
				bar   = $(this).parent(),
				panel = bar.parent();
			panel.find(".show_hide").slideToggle()
			switch(icon.attr("class")){
				case "toggle_visibility fa fa-chevron-down" :
					icon.removeClass("fa fa-chevron-down").addClass("fa fa-chevron-up")
				break;
				case "toggle_visibility fa fa-chevron-up" :
					icon.removeClass("fa fa-chevron-up").addClass("fa fa-chevron-down")
				break;
			}
		})
		//Save button Click event
		$("#btnSave").click(function(){
			/* html2canvas($(webDraft.draw.selectorId),{
				onrendered: function(canvas){
					var img = canvas.toDataURL()
					window.open(img);
				}
			}); */
			window.open(document.getElementById(randomId).toDataURL())
		});
		$(".paintTool").click(function(){
			$(".paintTool").removeClass("active");
			$(this).addClass("active")
			var thisId = $(this).attr("id");
			if(thisId == "web"){
				$("#sensitivityPoints_slider").show()
			}else{
				$("#sensitivityPoints_slider").hide()
			}
			if(thisId == "eraser"){
				$("#eraseRect").show();
				$("#draw, #drawHandler, #eventHandler").css("cursor", "none")
			}else{
				$("#eraseRect").hide()
				$("#draw, #drawHandler, #eventHandler").css("cursor", "crosshair")
			}
			if(thisId != "rectangle"){
				$("#prepareRect").hide();
			}
			if(thisId != "circle"){
				$("#prepareCircle").hide();
			}
			if(thisId == "rectangle" || thisId == "circle"){
				$("#fillShapeInput").show()
			}else{
				$("#fillShapeInput").hide()
				$("input#isFillSet").attr('checked', false).change()
			}
			if(thisId == "text"){
				$(".tools#textTools").show()
			}else{
				$(".tools#textTools").hide()
			}
		})
		$("#resizeDraw").click(function(){
			$("#resizer").fadeIn()
			$("input[type=number]#drawWidth").val(webDraft.draw.width)
			$("input[type=number]#drawHeight").val(webDraft.draw.height)
			$("#resizeinfo").html(webDraft.draw.width+" <i class='fa fa-times'></i> "+webDraft.draw.height)
		})
		$("#cancel").click(function(){
			$("#resizer").fadeOut();
			$("input[type=number]#drawWidth").val(webDraft.draw.width)
			$("input[type=number]#drawHeight").val(webDraft.draw.height)
		})
		$("#apply").click(function(){
			$("#resizer").fadeOut();
			webDraft.draw.width=$("input[type=number]#drawWidth").val()
			webDraft.draw.height=$("input[type=number]#drawHeight").val()
			webDraft.func.drawPos()
		})
		//Clear button Click event
		$("#btnCLear").click(function(){
			$(webDraft.draw.selectorId).empty()
			points = [ ];
			webDraft.func.init();
		})
		$(".textTool").click(function(){
			$(".textTool").removeClass("active")
			$(this).addClass("active")
			var id = $(this).attr("id");
			webDraft.text.align = id
		})
		$(".styleTool").click(function(){
			$(this).toggleClass("active")
			webDraft.text.style = "";
			$(".styleTool.active").each(function(){
				var s = $(this).attr("id");
				webDraft.text.style += s+" ";
			})
		})
		//changing size
		$("input[type=range]#pointSize").mousemove(function(){
			webDraft.size = $(this).val();
			$("#pointSizeValue").text("size:"+$(this).val()+"px")
		})
		//changing shadow blur
		$("input[type=range]#ShadowBlur").mousemove(function(){
			webDraft.shadow.blur = $(this).val();
			$("#ShadowBlurValue").text("shadow:"+$(this).val()+"px")
		})
		//changing shadow offset X
		$("input[type=range]#ShadowOffSetX").mousemove(function(){
			webDraft.shadow.offsetX = $(this).val();
			$("#ShadowOffSetXValue").text("shadow offset X:"+$(this).val()+"px")
		})
		//changing shadow offset Y
		$("input[type=range]#ShadowOffSetY").mousemove(function(){
			webDraft.shadow.offsetY = $(this).val();
			$("#ShadowOffSetYValue").text("shadow offset Y:"+$(this).val()+"px")
		})
		//changing sensitivity of web points
		$("input[type=range]#sensitivityPoints").mousemove(function(){
			webDraft.sensitivityPoints = $(this).val();
			$("#sensitivityPointsValue").text("sensitivity:"+Math.floor($(this).val()/100)+"%")
		})
		//changing fill opacity
		$("input[type=range]#fillOpacity").mousemove(function(){
			webDraft.fill.opacity = $(this).val();
			$("#fillOpacityValue").text("fill opacity:"+Math.floor($(this).val())+"%")
		})
		//choosing pencil
		$("#pencil").click(function(){
			webDraft.selectedTool = "pencil";
		})
		//choosing pencil
		$("#web").click(function(){
			webDraft.selectedTool = "web";
		})
		//choosing eraser
		$("#eraser").click(function(){
			webDraft.selectedTool = "eraser";
		})
		//choosing shape
		$("#rectangle").click(function(){
			webDraft.selectedTool = "rectangle";
		})
		//choosing shape
		$("#circle").click(function(){
			webDraft.selectedTool = "circle";
		})
		//choosing text
		$("#text").click(function(){
			webDraft.selectedTool = "text";
		})
		//setting first Color
		$("#generalColor").click(function(){
			$("input[type=color]#firstColor").click()
		})
		//setting shadow Color
		$("#shadowColor").click(function(){
			$("input[type=color]#shadowColorVal").click()
		})
		//setting fill Color
		$("#fillColor").click(function(){
			$("input[type=color]#fillColorVal").click()
		})
		//changing first color input
		$("input[type=color]#firstColor").change(function(){
			$("#generalColor .color").css({"background" : $(this).val()})
			webDraft.color = $(this).val()
		})
		//changing shadow color input
		$("input[type=color]#shadowColorVal").change(function(){
			$("#shadowColor .color").css({"background" : $(this).val()})
			webDraft.shadow.color = $(this).val()
		})
		//changing fill color input
		$("input[type=color]#fillColorVal").change(function(){
			$("#fillColor .color").css({"background" : $(this).val()})
			webDraft.fill.color = $(this).val()
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
			webDraft.shadow.isShadow = $(this).is(":checked")//return true if is :checked or false if not
			if(webDraft.shadow.isShadow){
				$("#shadowColor, #shadow_slider, #shadow_offsetY_slider, #shadow_offsetX_slider").show()
			}else{
				$("#shadowColor, #shadow_slider, #shadow_offsetY_slider, #shadow_offsetX_slider").hide()
			}
		})
		$("input[type=checkbox]#isFillSet").change(function(){
			webDraft.fill.isSet = $(this).is(":checked")//return true if is :checked or false if not
			if(webDraft.fill.isSet){
				$("#fillColor, #fillOpacity_slider").show()
			}else{
				$("#fillColor, #fillOpacity_slider").hide()
			}
		})
		$("input[type=checkbox]#unfilled").change(function(){
			webDraft.text.unfilled = $(this).is(":checked")//return true if is :checked or false if not
		})
	})
	.bind("contextmenu",function(e){
		e.preventDefault();
	})
	.keydown(function(e){
		switch(e.keyCode){
			case 13 :
				webDraft.key.Enter = true;
			break;
			case 16 :
				webDraft.key.Shift = true;
			break;
			case 17 :
				webDraft.key.Ctrl = true;
			break;
			case 18 :
				webDraft.key.Alt = true;
			break;
			case 27 :
				webDraft.key.Esc = true
			break;
			case 122 :
				webDraft.key.f11 = true
			break;
			case 123 :
				webDraft.key.f12 = true
			break;
			case 65 :
				webDraft.key.A = true
			break;
			case 66 :
				webDraft.key.B = true
			break;
			case 67 :
				webDraft.key.C = true
			break;
			case 68 :
				webDraft.key.D = true
			break;
			case 69 :
				webDraft.key.E = true
			break;
			case 70 :
				webDraft.key.F = true
			break;
			case 71 :
				webDraft.key.G = true
			break;
			case 72 :
				webDraft.key.H = true
			break;
			case 73 :
				webDraft.key.I = true
			break;
			case 74 :
				webDraft.key.J = true
			break;
			case 75 :
				webDraft.key.K = true
			break;
			case 76 :
				webDraft.key.L = true
			break;
			case 77 :
				webDraft.key.M = true
			break;
			case 78 :
				webDraft.key.N = true
			break;
			case 79 :
				webDraft.key.O = true
			break;
			case 80 :
				webDraft.key.P = true
			break;
			case 81 :
				webDraft.key.Q = true
			break;
			case 82 :
				webDraft.key.R = true
			break;
			case 83 :
				webDraft.key.S = true
			break;
			case 84 :
				webDraft.key.T = true
			break;
			case 85 :
				webDraft.key.U = true
			break;
			case 86 :
				webDraft.key.V = true
			break;
			case 87 :
				webDraft.key.W = true
			break;
			case 88 :
				webDraft.key.X = true
			break;
			case 89 :
				webDraft.key.Y = true
			break;
			case 90 :
				webDraft.key.Z = true
			break;
		}
	})
	.keyup(function(e){
		switch(e.keyCode){
			case 13 :
				webDraft.key.Enter = false;
			break;
			case 16 :
				webDraft.key.Shift = false;
			break;
			case 17 :
				webDraft.key.Ctrl = false;
			break;
			case 18 :
				webDraft.key.Alt = false;
			break;
			case 27 :
				webDraft.key.Esc = false
			break;
			case 122 :
				webDraft.key.f11 = false
			break;
			case 123 :
				webDraft.key.f12 = false
			break;
			case 65 :
				webDraft.key.A = false
			break;
			case 66 :
				webDraft.key.B = false
			break;
			case 67 :
				webDraft.key.C = false
			break;
			case 68 :
				webDraft.key.D = false
			break;
			case 69 :
				webDraft.key.E = false
			break;
			case 70 :
				webDraft.key.F = false
			break;
			case 71 :
				webDraft.key.G = false
			break;
			case 72 :
				webDraft.key.H = false
			break;
			case 73 :
				webDraft.key.I = false
			break;
			case 74 :
				webDraft.key.J = false
			break;
			case 75 :
				webDraft.key.K = false
			break;
			case 76 :
				webDraft.key.L = false
			break;
			case 77 :
				webDraft.key.M = false
			break;
			case 78 :
				webDraft.key.N = false
			break;
			case 79 :
				webDraft.key.O = false
			break;
			case 80 :
				webDraft.key.P = false
			break;
			case 81 :
				webDraft.key.Q = false
			break;
			case 82 :
				webDraft.key.R = false
			break;
			case 83 :
				webDraft.key.S = false
			break;
			case 84 :
				webDraft.key.T = false
			break;
			case 85 :
				webDraft.key.U = false
			break;
			case 86 :
				webDraft.key.V = false
			break;
			case 87 :
				webDraft.key.W = false
			break;
			case 88 :
				webDraft.key.X = false
			break;
			case 89 :
				webDraft.key.Y = false
			break;
			case 90 :
				webDraft.key.Z = false
			break;
		}
	})
	.mouseup(function(){
			webDraft.click.left  = false;
			webDraft.click.right = false;
	})
