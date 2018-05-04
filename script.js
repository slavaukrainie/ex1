(function () {
	var types = ['square', 'circle'];
	var block = document.getElementById('block');
	var mask = document.getElementById('mask');
	var removeAllButton = document.getElementById('removeAllButton');
	var zoomIn = document.getElementById('zoomIn');
	var zoomOut = document.getElementById('zoomOut');
	var currZoom = 1;
	var step = 1.1;

	function updateZoom (save=true) {
		block.style.transform = 'scale(' + currZoom + ')';
		if (save) {
			types.forEach(function (type) {
				saveObjPos (type);
			})
		}
	}

	types.forEach(function (type) {
		var addButton = createElementFromHtml('<div class="button" id="' + type + 'Button">' + type + '</div>');
		document.body.appendChild (addButton);
			addButton.onclick = function(e){
				var obj = createElementFromHtml('<div class="' + type + '"></div>');
				obj.id = type + (document.querySelectorAll('.' + type).length + 1);
				setupObj(obj);
				obj.style.left = mask.style.left + 'px';
				obj.style.top = mask.style.top + 'px';
				saveObjPos(type);
			}
	})

	function createElementFromHtml(html) {
		var div = document.createElement('div');
		div.innerHTML = html;
		return div.firstChild;
	}

	types.forEach(function(type) {
		loadObjPos(type + "Arr", type);
	})

	function loadObjPos(arrName, type) {
		var arrName = JSON.parse(localStorage.getItem("localStorage." + type + "Arr")) || [];
		for (var i = 0; i < arrName.length; i++) {
			var obj = createElementFromHtml('<div class="' + type + '"></div>');
			setupObj(obj);
			obj.id = arrName[i].id;
			obj.style.left = arrName[i].x;
			obj.style.top = arrName[i].y;
			block.style.transform = 'scale(' + arrName[i].zoom + ')';
			currZoom = arrName[i].zoom || 1;
		}
	}

	function saveObjPos(type) {
		var arr = [];
		var objs = document.querySelectorAll('.' + type);
		for (var i = 0; i < objs.length; i++) {
			arr.push({id: objs[i].id, x: objs[i].style.left, y: objs[i].style.top, zoom: currZoom});
		}
		localStorage.setItem("localStorage." + type + "Arr", JSON.stringify(arr));
	}


	removeAllButton.onclick = function() {
		while (block.lastChild) {
			block.removeChild(block.lastChild);
	 	}
	 	types.forEach(function (type) {
	  		saveObjPos(type);
		})
	}

	function setupObj(obj) {
		block.appendChild(obj);
		obj.onmousedown = function onMouseDownAction(e) {
			var coords = getCoords(obj);
			//расстояние от центра объекта до курсора
			var shiftX = e.pageX/currZoom - coords.left/currZoom - obj.offsetWidth/2;
			var shiftY = e.pageY/currZoom - coords.top/currZoom - obj.offsetHeight/2;

			var blockCoords = getCoords(block);

			obj.style.position = 'absolute';

			moveAt(e);

			obj.style.zIndex = 1001;

			function moveAt(e) {
				//учитывая зум, делим координаты по горизонтали и вертикали относительно всего документа на коэф. увеличения
				 obj.style.left = e.pageX/currZoom - shiftX - blockCoords.left/currZoom + 'px';
				 obj.style.top = e.pageY/currZoom - shiftY - blockCoords.top/currZoom + 'px';
			}

			document.onmousemove = function(e) {
				moveAt(e);
			};

			obj.onmouseup = function() {
				document.onmousemove = null;
				obj.onmouseup = null;
				types.forEach(function (type) {
	  				saveObjPos(type);
				})
			}
		}
	}

	function getCoords(elem) {
		var box = elem.getBoundingClientRect();
			return {
				top: box.top + pageYOffset,
        left: box.left + pageXOffset
		};
	}
}()
)
