class Draw {
  drawing() {
    ctx.beginPath();
    ctx.moveTo(mousePosition.x, mousePosition.y);
    getDrawStyle();
    ctx.lineTo(mousePosition.x, mousePosition.y);
    ctx.stroke();
  }

  drawWeb() {
    ctx.beginPath();
    getDrawStyle();
    ctx.moveTo(points[activeLayerId][points[activeLayerId].length - 2].x, points[activeLayerId][points[activeLayerId].length - 2].y);
    ctx.lineTo(points[activeLayerId][points[activeLayerId].length - 1].x, points[activeLayerId][points[activeLayerId].length - 1].y);
    ctx.stroke();
    let dx, dy, d;
    let len = points[activeLayerId].length;
    for (let i = 0; i < len; i++) {
      dx = points[activeLayerId][i].x - points[activeLayerId][points[activeLayerId].length - 1].x;
      dy = points[activeLayerId][i].y - points[activeLayerId][points[activeLayerId].length - 1].y;
      d = dx * dx + dy * dy;
      if (d < DRAW_SETTINGS.sensitivityPoints) {
        ctx.beginPath();
        getDrawStyle();
        ctx.moveTo(points[activeLayerId][points[activeLayerId].length - 1].x + (dx * 0.2), points[activeLayerId][points[activeLayerId].length - 1].y + (dy * 0.2));
        ctx.lineTo(points[activeLayerId][i].x - (dx * 0.2), points[activeLayerId][i].y - (dy * 0.2));
        ctx.stroke();
      }
    }
  }
}

const draw = new Draw();

function getDrawStyle() {
  ctx.lineWidth = DRAW_SETTINGS.size;

  if (SELECTED_TOOL === RECTANGLE) {
    ctx.lineJoin = ctx.lineCap = 'miter';
  } else {
    ctx.lineJoin = ctx.lineCap = 'round';
  }

  if (shapes.fill.isSet === true) {
    ctx.fillStyle = hexToRgba(shapes.fill.color, shapes.fill.opacity);
  } else {
    ctx.fillStyle = 'transparent';
  }

  if (SELECTED_TOOL === ERASER) {
    ctx.globalCompositeOperation = 'destination-out';
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }

  if (DRAW_SETTINGS.shadow.isShadow === true && SELECTED_TOOL !== ERASER) {
    ctx.shadowBlur = DRAW_SETTINGS.shadow.blur;
    ctx.shadowColor = DRAW_SETTINGS.shadow.color;
    ctx.shadowOffsetX = DRAW_SETTINGS.shadow.offsetX;
    ctx.shadowOffsetY = DRAW_SETTINGS.shadow.offsetY;
  } else {
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  ctx.strokeStyle = DRAW_SETTINGS.color;//line color
}