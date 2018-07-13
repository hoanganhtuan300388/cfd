var Widget = function(name, layout){
	this.name = name;

	this.layout = layout;

	this.init();
};

Widget.prototype.init = function(){

	this.id = createGuid();
	//widgetの親はパネル
	this.tabEl = templates.get('panel-tab-item', true);
	this.tabElClone = null;
	this.closeBtnEl = this.tabEl.querySelector('.panel-tab-item-close');
	this.contentEl = templates.get('panel-content-item', true);
//	this.contentEl.textContent = this.id;

	//タブの名前をセット
	this.tabItemTitle = this.tabEl.querySelector('.panel-tab-item-text');
	this.tabItemTitle.textContent = this.name;

	this.didHideTabButton(this.layout.hideDefautlTab);

	this.event();
};

Widget.prototype.didHideTabButton = function(isHide) {
	if(isHide === true) {
		this.tabEl.classList.add("panel-no-tab");
		this.closeBtnEl.classList.add("panel-no-tab");
		this.tabItemTitle.classList.add("panel-no-tab");
	}
	else {
		this.tabEl.classList.remove("panel-no-tab");
		this.closeBtnEl.classList.remove("panel-no-tab");
		this.tabItemTitle.classList.remove("panel-no-tab");
	}
}

Widget.prototype.event = function(){
	//タブをクリック
	this.tabEl.addEventListener('click', this.tabClick.bind(this), false);

	//Xボタンをクリック
	this.closeBtnEl.addEventListener('click', this.closeClick.bind(this), false);

	//タブをドラグ
	this.tabEl.addEventListener('mousedown', this.tabDrag.bind(this), false);

	//ドラグした上でマウスオーバー
	this.tabEl.addEventListener("mouseover", this.mouseOver.bind(this), false);
};

/**
 * タブをクリックした時
 */
Widget.prototype.tabClick = function(e){
	e.preventDefault();

	//closeボタンをクリックしたときには何もしない
	if(e.target.classList.contains('panel-tab-item-close') === true){
		return false;
	}

	//すでに選択されているときには何もしない
	if(this.isActive === true){
		return false;
	}

	this.parentObj.changeDisplayWidget(this);
};

/**
 * Xボタンをクリックした時
 */
Widget.prototype.closeClick = function(e){
	//===========================================================================
	// 2017-03-27 Taeho
	// componentのメモリをクリアする。
	if( this.componentRef )	{
		this.componentRef.destroy();
	}

	e.preventDefault();
	this.close();
};

/**
 * タブをドラグ
 */
Widget.prototype.tabDrag = function(e){

	if(this.isActive === false){
/*		e.preventDefault();
		return false;*/
		this.tabClick(e);
	}

	// Xボタンを押した上ではドラグできなくする
	if(e.target.classList.contains('panel-tab-item-close') === true){
		return false;
	}

	var that = this;
	var panelOffset = this.parentObj.getOffset();
	var startX = e.clientX;
	var startY = e.clientY;
	var startLeft = panelOffset.left + this.tabEl.offsetLeft;
	var startTop = panelOffset.top + this.tabEl.offsetTop;
	var moveTabEl = null;
	var layoutX = startLeft + e.offsetX;
	var layoutY = startTop + e.offsetY;

	//
	session.set('moveWidget', that);

	//layoutのマウス監視スタート
	that.parentObj.layout.tabMouseOver(startX, startY, layoutX, layoutY);

	//ドラグスタート
	document.onmousemove = function(e){

		if(moveTabEl === null){
			moveTabEl = that.tabEl.cloneNode(true);
			moveTabEl.classList.add('panel-tab-item-move');
			that.tabEl.classList.add('panel-tab-item-dragging');
			that.tabEl.classList.add('panel-tab-item-move-target');
			that.parentObj.appendToLayout(moveTabEl);
		}

		//マウスカーソルがタブリストを離れた時には、仮で表示するタブを非表示とする
		if(e.target.className !== undefined && e.target.className.indexOf('panel-tab-item') === -1){
			that.tabEl.classList.remove('panel-tab-item-move-target');
			that.removeTabClone();
		}

		var moveX = e.clientX - startX;
		var moveY = e.clientY - startY;
		var left = startLeft + moveX;
		var top = startTop + (moveY > 20 || moveY < -20 ? moveY : 2);
		moveTabEl.style.left = String(left) + "px";
		moveTabEl.style.top = String(top) + "px";
	};

	//ドラグ終了
	document.onmouseup = function(e){
		document.onmousemove = null;
		document.onmouseup = null;

		if(moveTabEl !== null){

			that.tabEl.classList.remove('panel-tab-item-dragging');
			that.tabEl.classList.remove('panel-tab-item-move-target');
			that.removeTabClone();
			that.parentObj.removeToLayout(moveTabEl);
			moveTabEl = null;
		}
		session.remove('moveWidget');
	};
};

Widget.prototype.mouseOver = function(e){
	e.preventDefault();
	var moveWidget = session.get('moveWidget');
	if(moveWidget　 === undefined){
		return false;
	}
	var insertTabEl;
	//自分を持っているパネルであれば
	if(this.parentObj.isWidget(moveWidget)){

		moveWidget.removeTabClone();
		moveWidget.tabEl.classList.add('panel-tab-item-move-target');
		this.tabEl.appendChild(this.parentObj.dropAreaEl);
		//自分の上にドラグした時に点線を表示
		if(moveWidget.id === this.id){
			return false;
		}

		insertTabEl = moveWidget.tabEl;
	//他のパネルにドラグした時
	}else{
		moveWidget.createTabClone();
		insertTabEl = moveWidget.tabElClone;
	}

	var position = this.getInsertPosition(e);
	if(position === 'front'){
		this.parentObj.insertFrontTab(insertTabEl, this.tabEl);
	}else{
		this.parentObj.insertBackTab(insertTabEl, this.tabEl);
	}
	session.set('panelHaveTabClone', this.parentObj);
};

Widget.prototype.setParentObj = function(obj){
	this.parentObj = obj;
	return this;
};

Widget.prototype.active = function(){
	this.isActive = true;
	this.tabEl.classList.add('panel-tab-item-active');
	this.tabEl.appendChild(this.closeBtnEl);
	this.parentObj.appendContent(this.contentEl);
};

Widget.prototype.disabled = function(){
	this.isActive = false;
	this.tabEl.classList.remove('panel-tab-item-active');
	this.tabEl.removeChild(this.closeBtnEl);
	this.parentObj.removeContent(this.contentEl);
};

Widget.prototype.close = function(){
	this.isActive = false;
	this.tabEl.classList.remove('panel-tab-item-active');
	this.tabEl.removeChild(this.closeBtnEl);
	this.parentObj.removeWidget(this);
	this.parentObj.removeContent(this.contentEl);
	this.parentObj.layout.backup();
};

Widget.prototype.createTabClone = function(){
	if(this.tabElClone === null){
		this.tabElClone = this.tabEl.cloneNode(true);
		this.tabEl.classList.remove('panel-tab-item-move-target');
		this.tabElClone.classList.add('panel-tab-item-move-target');
	}
};

Widget.prototype.removeTabClone = function(){
	if(this.tabElClone !== null){
		if(this.tabElClone.parentNode !== null){
			this.tabElClone.parentNode.removeChild(this.tabElClone);
			session.get('panelHaveTabClone').tabListResize();
			session.remove('panelHaveTabClone');
		}
		this.tabElClone = null;
	}
};

/**
 * ドラグしたタブを前に移動するか後ろに移動するかを判断
 */
Widget.prototype.getInsertPosition = function(e){

	var left, top, width, height, isFirstNode;

	//初子のタブなのか
	if(this.parentObj.tabsEl.firstChild === e.currentTarget){
		isFirstNode = true;
	}

	left = parseInt(e.offsetX, 10);
	top = parseInt(e.offsetY, 10);
	width = parseInt(e.currentTarget.offsetWidth, 10);
	height = parseInt(e.currentTarget.offsetHeight, 10);

	//Xボタンへ進入した時
	if(e.target.classList.contains('panel-tab-item-close') === true){
		left = width - parseInt(e.target.offsetWidth, 10) + left;
		top = height - parseInt(e.target.offsetHeight, 10) + top;
	}

	//front or back　どちらからから進入したのか
	var direction;

	//left　あるいは　right　から実際進入してきた距離
	var x;

	//top　あるいは　bottom　から実際進入してきた距離
	var y;

	//leftから進入した時
	if(left < width/2){
		direction = 'front';
		x = left;

	//rightから進入した時
	}else{
		direction　 = 'back';
		x = width-left;
	}

	//topから近い
	if(top < height/2 ){
		y = top;

	//bottomから近い
	}else{
		y = height-top;
	}

	if(direction　 === 'front'){
		if(x < y && isFirstNode !== true){
			direction = 'back';
		}
	}else{
		if(x < y){
			direction = 'front';
		}
	}

	return direction;
};

Widget.prototype.toJSON = function(e){
	return {
		id: this.id,
		name: this.name,
		isActive: this.isActive
	};
};

//===========================================================================
// 2017-03-27 Taeho : add name() function.
Widget.prototype.setName = function(name){
	this.name = name;

	//タブの名前をセット
	this.tabEl.querySelector('.panel-tab-item-text').textContent = this.name;
};

//
// added by choi sunwoo at 2017.04.14 for #642
//

/**
 * 間接的にWidgetのcomponentRefの何かを呼び出すための反向関数
 * @param  {[type]} reflector	callback function
 * @return {[type]}
 */
Widget.prototype.didReflectCallForAllWidgetComponetRefs = function(reflector) {
	/*
	console.log(this.name);
	console.log(this.resizeReflector);
	console.log(this.componentRef);
	*/
	if(reflector && typeof reflector === "function") {
		reflector(this.componentRef);
	}
	else if(this.resizeReflector && typeof this.resizeReflector === "function") {
		this.resizeReflector(this.componentRef);
	}


};
//
