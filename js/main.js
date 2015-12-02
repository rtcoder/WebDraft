var canvas,
	ctx,
	randomId,
	isDrawing = false,
	startShapePoints = [0,0],
	points = [ ],
	webDraft = {
		title : "WebDraft",
		version : "1.5.3",
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
			color    : "#232324"
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
				$("title").text(webDraft.title+" v"+webDraft.version+" ["+webDraft.draw.width+" x "+webDraft.draw.height+"]")
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
				ctx.lineJoin = ctx.lineCap = 'round';
				if(webDraft.shadow.isShadow === true){
					ctx.shadowBlur = webDraft.shadow.blur;
					ctx.shadowColor = webDraft.shadow.color;
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
				//alert(x+" "+y+" "+webDraft.mPosition.x+" "+webDraft.mPosition.y)
				ctx.stroke();
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
								case "common" :
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


$(window)
	.resize(function(){
		webDraft.func.resize();
		webDraft.func.drawPos();
	})
	.bind('mousewheel DOMMouseScroll', function(event) {
		if(webDraft.key.Ctrl === true){ event.preventDefault() } //press control - do nothing
		if(webDraft.key.Alt === true){}
	});
$(document)
	.keydown(function(event){
		if(webDraft.key.f12 === true || event.keyCode == 123){ event.preventDefault() }
		if(webDraft.key.f11 === true || event.keyCode == 122){ event.preventDefault() }
		if(webDraft.key.Ctrl === true || event.keyCode == 17){ event.preventDefault() }
	})
	.ready(function(event){
		$("#isShadow").button()
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
				case "fa fa-chevron-down toggle_visibility" :
					icon.removeClass("fa fa-chevron-down").addClass("fa fa-chevron-up")
				break;
				case "fa fa-chevron-up toggle_visibility" :
					icon.removeClass("fa fa-chevron-up").addClass("fa fa-chevron-down")
				break;
			}
		})
		//Save button Click event
		$("#btnSave").click(function(){
			html2canvas($(webDraft.draw.selectorId),{
				onrendered: function(canvas){
					var img = canvas.toDataURL()
					window.open(img);
				}
			});
		});
		$(".paintTool").click(function(){
			$(".paintTool").removeClass("active");
			$(this).addClass("active")
			var thisId = $(this).attr("id");
			if(thisId == "common"){
				$("#sensitivityPoints_slider").show()
			}else{
				$("#sensitivityPoints_slider").hide()
			}
			if(thisId == "eraser"){
				$("#eraseRect").show()
			}else{
				$("#eraseRect").hide()
			}
			if(thisId !="rectangle"){
				$("#prepareRect").hide();
			}
			if(thisId !="circle"){
				$("#prepareCircle").hide();
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
		//changing sensitivity of common points
		$("input[type=range]#sensitivityPoints").mousemove(function(){
			webDraft.sensitivityPoints = $(this).val();
			$("#sensitivityPointsValue").text("sensitivity:"+Math.floor($(this).val()/1000)+"%")
		})
		//choosing pencil
		$("#pencil").click(function(){
			webDraft.selectedTool = "pencil";
		})
		//choosing pencil
		$("#common").click(function(){
			webDraft.selectedTool = "common";
		})
		//choosing pencil
		$("#eraser").click(function(){
			webDraft.selectedTool = "eraser";
		})
		//choosing pencil
		$("#rectangle").click(function(){
			webDraft.selectedTool = "rectangle";
		})
		//choosing pencil
		$("#circle").click(function(){
			webDraft.selectedTool = "circle";
		})
		//setting first Color
		$("#generalColor").click(function(){
			$("input[type=color]#firstColor").click()
		})
		//setting shadow Color
		$("#shadowColor").click(function(){
			$("input[type=color]#shadowColorVal").click()
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
		}
	})
	.mouseup(function(){
			webDraft.click.left  = false;
			webDraft.click.right = false;
	})
