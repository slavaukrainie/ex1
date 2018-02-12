var block = document.getElementById('block');
var mask = document.getElementById('mask');
var removeAllButton = document.getElementById('removeAllButton');
var zoomIn = document.getElementById('zoomIn');
var zoomOut = document.getElementById('zoomOut');

class Workspace {
  static get zoomStep () {
    return 1.1;
  }
  static get types () {
    return ['square', 'circle'];
  }

  static get TypeClasses () {
    return {
      'square': Square,
      'circle': Circle
    }
  }

  constructor (block, mask) {
    this.block = block
    Workspace.types.forEach((type) => {
      this[type + 's'] = []
    })
    this.currZoom = 1;
    this.load();
  }

  load () {
    Workspace.types.forEach((type) => {
      var shapesData = JSON.parse(localStorage.getItem("localStorage." + type + "Arr")) || [];
      shapesData.forEach((shapeData) => {
        this.addShape(type, shapeData)
        this.setZoom(shapeData.zoom, false)
      })
    })
  }

  addShape (type, options = {}) {
    var ShapeClass = Workspace.TypeClasses[type]
    var shape = new ShapeClass(this, options);
    this[type + 's'].push(shape)
  }

  addShapeWithSave (type, options = {}) {
    this.addShape(type, options)
    this.saveType(type);
  }

  removeAll () {
    Workspace.types.forEach((type) => {
      this[type + 's'].forEach((shape) => { shape.detach() })
      this[type + 's'] = []
    })

    this.saveAllTypes()
  }

  zoomIn () {
		this.setZoom(this.currZoom *= Workspace.zoomStep);
  }

  zoomOut () {
    this.setZoom(this.currZoom /= Workspace.zoomStep);
  }

  setZoom (zoom, save = true) {
    this.currZoom = zoom
		this.block.style.transform = 'scale(' + this.currZoom + ')';

		if (save) { this.saveAllTypes() }
  }

  saveType (type) {
    var shapesData = this[type + 's'].map((shape) => {
      return {
        x: shape.position.x,
        y: shape.position.y,
        zoom: this.currZoom
      }
    })
		localStorage.setItem("localStorage." + type + "Arr", JSON.stringify(shapesData));
  }

  saveAllTypes () {
    Workspace.types.forEach((type) => { this.saveType(type); })
  }

  blockCoords () {
    return getCoords(this.block);
  }
}


class Shape {
  static get defaultPosition () {
    return {x: 0, y: 0}
  }

  constructor (workspace, options) {
    this.workspace = workspace
    if (options.x && options.y) {
      this.setPosition({x: options.x, y: options.y})
    } else {
      this.setPosition(this.constructor.defaultPosition)
    }

    this.attach()
    this.redraw()
    this.obj.onmousedown = (e) => { this.onMouseDownAction(e) }
  }

  currZoom () {
    return this.workspace.currZoom
  }

  setPosition (position) {
    this.position = position
  }

  attach () {
    this.obj = createElementFromHtml('<div class="' + this.constructor.type + '"></div>');
		this.workspace.block.appendChild(this.obj);
  }

  redraw () {
    this.obj.style.left = this.position.x + 'px';
    this.obj.style.top = this.position.y + 'px';
  }

  detach () {
    this.workspace.block.removeChild(this.obj);
  }

  objCenterToMousePositionDistance (e) {
    return {
      x: e.pageX/this.currZoom() - this.coords().left/this.currZoom() - this.obj.offsetWidth/2,
      y: e.pageY/this.currZoom() - this.coords().top/this.currZoom() - this.obj.offsetHeight/2
    }
  }

  coords () {
    return getCoords(this.obj)
  }

  moveAt (mouseCoords, shift) {
    //учитывая зум, делим координаты по горизонтали и вертикали относительно всего документа на коэф. увеличения
    this.setPosition({
      x: mouseCoords.x/this.currZoom() - shift.x - this.workspace.blockCoords().left/this.currZoom(),
      y: mouseCoords.y/this.currZoom() - shift.y - this.workspace.blockCoords().top/this.currZoom()
    })
    this.redraw()
  }

  onMouseDownAction (e) {
    var shift = this.objCenterToMousePositionDistance(e);
    this.moveAt({x: e.pageX, y: e.pageY}, shift);

    document.onmousemove = (e) => {
      this.moveAt({x: e.pageX, y: e.pageY}, shift);
    }

    this.obj.onmouseup = () => {
      document.onmousemove = null;
      this.obj.onmouseup = null;
      this.workspace.saveAllTypes()
    }
  }
}

class Circle extends Shape {
  static get type () {
    return 'circle'
  }
}

class Square extends Shape {
  static get type () {
    return 'square'
  }
}

var workspace1 = new Workspace(block)

Workspace.types.forEach(function (type) {
  var addButton = createElementFromHtml('<div class="button" id="' + type + 'Button">' + type + '</div>');
  document.body.appendChild (addButton);

  addButton.onclick = function(e){
    workspace1.addShapeWithSave(type)
  }
})

zoomIn.onclick = function () {
  workspace1.zoomIn()
}

zoomOut.onclick = function () {
  workspace1.zoomOut()
}

removeAllButton.onclick = function() {
  workspace1.removeAll()
}

function createElementFromHtml(html) {
  var div = document.createElement('div');
  div.innerHTML = html;
  return div.firstChild;
}

function getCoords(elem) {
  var box = elem.getBoundingClientRect();
    return {
      top: box.top + pageYOffset,
      left: box.left + pageXOffset
  };
}
