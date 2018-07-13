/**
 * @file	border.js
 * @brief	二つの領域を分割する警戒線オブジェクト
 * @author	cukim
 * @date
 * 			2017.03.27
 * 				- added by choi sunwoo
 * 				- 14をthis.layout.borderInfo.sizeへ変更する。
 * 				- 7をthis.layout.borderInfo.halfSizeへ変更する。
 */

var Border = function(layout, type, offset, position){
	this.layout = layout;
	this.type = type;
	this.offset = offset;
	this.position = (position === undefined) ? 0 : position;
	this.init();
};

Border.prototype.init = function(){

	this.el = templates.get('border', true);
	this.layoutEl = this.layout.el;
	this.dropAreaEl = this.layout.dropAreaEl;
	this.id = createGuid();
	this.parentBorders = [];
	this.leftWing = new BorderWing(this.layout);
	this.rightWing = new BorderWing(this.layout);

	if(this.type === __constants__.border.types.vert.target){
		this.position = (this.position === 0) ? this.offset.width/2-this.layout.borderInfo.halfSize : this.position;
		this.el.classList.add('border-vertical');
		this.wh = __constants__.border.types.vert.sizeTarget;
		this.lt = __constants__.border.types.vert.lw;
	}else{
		this.position = (this.position === 0) ? this.offset.height/2-this.layout.borderInfo.halfSize : this.position;
		this.el.classList.add('border-horizontal');
		this.wh = __constants__.border.types.horz.sizeTarget;
		this.lt = __constants__.border.types.horz.lw;
	}

	this.render();
};

Border.prototype.render = function(){
	if(this.layout.hideDefautlTab) {
		this.el.style.visibility = "hidden";
	}
	else {
		this.event();
	}

	this.layoutEl.appendChild(this.el);
};

Border.prototype.event = function(){
	//境目をドラグ
	this.el.addEventListener('mousedown', this.drag.bind(this), false);

	//widgetをドラグした上でmouseoverした時
	this.el.addEventListener('mouseover', this.displayDropArea.bind(this), false);

	//widgetをドラグした上でmouseoutした時
	this.el.addEventListener('mouseout', this.tabMouseOut.bind(this), false);

	//widgetをドラグした上でmouseupした時
	this.el.addEventListener('mouseup', this.dropWidget.bind(this), false);
};

Border.prototype.displayDropArea = function(e){

	e.preventDefault();
	var moveWidget = session.get('moveWidget');
	if(moveWidget === undefined){
		return;
	}

	//layout displayDropAreaが表示されていれば
	if(this.layout.isDisplayDropArea() === true){
		this.dropAreaEl.className = 'none';
		return;
	}

	//既に表示されていれば何もしない。
	if(this.isDisplayDropArea() === true){
		return;
	}

	var panelWh = this.getPanelWh();
	this.dropAreaEl.className = 'border-drop-area';
	this.dropAreaEl.style[this.wh] = String(panelWh) + "px";
	this.dropAreaEl.style[this.lt] = String(this.layout.borderInfo.halfSize - panelWh/2) + "px";
	this.el.appendChild(this.dropAreaEl);

};

Border.prototype.getPanelWh = function(){
	if(this.offset[this.wh] - this.position > this.position){
		return Math.floor(this.position/2);
	}else{
		return Math.floor((this.offset[this.wh] - this.position)/2);
	}
};

Border.prototype.tabMouseOut = function(e){
	e.preventDefault();
	var moveWidget = session.get('moveWidget');
	if(moveWidget === undefined){
		return false;
	}
	this.removeDropArea();
};

/**
 * widgetをドロップ
 */
Border.prototype.dropWidget = function(e){
	e.preventDefault();
	var moveWidget = session.get('moveWidget');
	if(moveWidget === undefined){
		return false;
	}

	//dropAreaが表示されてなければ
	if(this.isDisplayDropArea() === false){
		return;
	}

	this.removeDropArea();

	//moveWidgetを持っているパネルに他のwidgetが存在しなければ
	var panel = moveWidget.parentObj;
	if(panel.widgets.length < 2){
		//borderが持っているパネルであれば
		if(this.leftWing.isObject(panel) === true || this.rightWing.isObject(panel) === true){
			return false;
		}
	}

	moveWidget.close();

	this.panelDivision(moveWidget);

	this.layout.debug('drop on border');
};

Border.prototype.removeDropArea = function(){
	this.dropAreaEl.style[this.wh] = '';
	this.dropAreaEl.style[this.lt] = '';
	this.dropAreaEl.className = 'none';
};

Border.prototype.isDisplayDropArea = function(){
	return this.dropAreaEl.classList.contains('border-drop-area') === true ? true : false;
};

//同士分裂
Border.prototype.panelDivision = function(moveWidget){

	//新しいパネルのサイズ
	var panelWh = this.getPanelWh();

	//変更前のoffsetを保存
	var backupPosition = this.position;
	var backupOffset = {
		width: this.offset.width,
		height: this.offset.height
	};

	//既存の境目を変更
	this.position = this.position - panelWh/2 - this.layout.borderInfo.halfSize - this.layout.borderInfo.size;
	this.offset[this.wh] = this.position + this.layout.borderInfo.size + panelWh;

	//新し境目の情報
	var newPosition = panelWh;
	var newOffset = {
		width: this.offset.width,
		height: this.offset.height,
		left: this.offset.left,
		top: this.offset.top
	};

	newOffset[this.wh] = backupOffset[this.wh] - this.position - this.layout.borderInfo.size;
	newOffset[this.lt] = this.offset[this.lt] + this.position + this.layout.borderInfo.size;

	//新し境目を生成
	var border = new Border(this.layout, this.type, newOffset);

	//新しいパネルを生成
	var panel = new Panel(this.layout);
	panel.addWidget(moveWidget);

	//境目に親境目の親境目をセット
	if(this.parentBorders.length > 0){
		this.addByParent([border]);
		border.setParentBorders(this.parentBorders);
	}

	var leftBorder = this.leftWing.objects[0].getOrderParentBorder(this);
	if(leftBorder instanceof Border){
		leftBorder.offset[this.wh] = leftBorder.offset[this.wh] - (backupPosition - this.position);
	}

	//rightWingに他の親境目があれば
	var rightBorder = this.rightWing.objects[0].getOrderParentBorder(this);
	if(rightBorder instanceof Border){
		var beforeRightSize = backupOffset[this.wh] - backupPosition - this.layout.borderInfo.size;
		var afterRightSize = this.offset[this.wh] - this.position - this.layout.borderInfo.size;
		var subSize = beforeRightSize - afterRightSize;
		rightBorder.offset[this.wh] = rightBorder.offset[this.wh] - subSize;
		rightBorder.offset[this.lt] = rightBorder.offset[this.lt] + subSize;
		rightBorder.position = afterRightSize;
	}

	//右側の親境目を切り替え
	for(var i = 0, iLen = this.rightWing.objects.length; i < iLen; i++){
		this.rightWing.objects[i].changeParentBorder(this, border);
	}

	//境目に子をセット
	border.setWing([panel], this.rightWing.objects);
	this.rightWing.setObjects([panel]);

	//生成したパネルに親境目をセット
	panel.setParentBorders([this, border]);

	//layoutに保存して置く
	this.layout.addStorage(border);

	//生成したパネルを表示
	panel.render();

	//サイズ調整
	if(this.parentBorders.length > 0){
		this.parentBorders[0].resizeLength();
	}else{
		this.layout.windowResize();
	}
};

/**
 * ドラグ
 */
Border.prototype.drag = function(e){
	e.preventDefault();

	var dragRange = __utils__.getDragRange(this.layout.borderInfo);

	//幅（高さ）が214px以下の場合には無効
	if(this.offset[this.wh] < dragRange.limit){
		return false;
	}

	var that = this;
	var el = this.el;
	var startX = e.clientX;
	var startY = e.clientY;
	var startLeft = el.offsetLeft;
	var startTop = el.offsetTop;
	var type = this.type;
	var movingPx = 0;
	var setPx;
	var range = {
		left  : this.offset.left + dragRange.size,
		right : this.offset.left + this.offset.width - (dragRange.size + dragRange.borderSize),
		top   : this.offset.top  + dragRange.size,
		bottom: this.offset.top  + this.offset.height - (dragRange.size + dragRange.borderSize)
	};

	el.classList.add('border-dragging');

	//ドラグスタート
	document.onmousemove = function(e){

		if(type === __constants__.border.types.vert.target){
			movingPx = e.clientX - startX;
			setPx = startLeft + movingPx;

			if(setPx < range.left){
				setPx = range.left;
				movingPx = setPx - startLeft;
			}else if(setPx > range.right){
				setPx = range.right;
				movingPx = setPx - startLeft;
			}

			el.style.left = String(setPx) + "px";

		}else{
			movingPx = e.clientY - startY;
			setPx = startTop + movingPx;

			if(setPx < range.top){
				setPx = range.top;
				movingPx = setPx - startTop;
			}else if(setPx > range.bottom){
				setPx = range.bottom;
				movingPx = setPx - startTop;
			}

			el.style.top = String(setPx) + "px";
		}
	};

	//ドラグ終了
	document.onmouseup = function(e){
		document.onmousemove = null;
		document.onmouseup = null;
		el.classList.remove('border-dragging');

		if(movingPx === 0){
			return;
		}

		that.position = that.position + movingPx;
		that.modifyOffsetToNeighborBorder(movingPx);
		that.resizeWing();
		that.layout.backup();

		that.layout.didReflectCallForAllWidgetComponetRefs();
	};
};

/**
 * 隣に同じレベルの境目があれば調整
 */
Border.prototype.modifyOffsetToNeighborBorder = function(movingPx){

	//左側にある境目を取得
	var leftBorder = this.leftWing.objects[0].getOrderParentBorder(this);
	if(leftBorder !== null){
		leftBorder.offset[this.wh] = leftBorder.offset[this.wh] + movingPx;
	}

	//右側にある境目を取得
	var rightBorder = this.rightWing.objects[0].getOrderParentBorder(this);
	if(rightBorder !== null){
		rightBorder.offset[this.wh] = rightBorder.offset[this.wh] - movingPx;
		rightBorder.offset[this.lt] = rightBorder.offset[this.lt] + movingPx;
		rightBorder.position = rightBorder.position - movingPx;
	}
};

/**
 * サイズ変更処理をする。
 */
Border.prototype.resize = function(){
	if(this.type === __constants__.border.types.vert.target){
		this.el.style.width  = String(this.layout.borderInfo.size) + "px";
		this.el.style.height = String(this.offset.height) + "px";
		this.el.style.left   = String(this.offset.left + this.position) + "px";
		this.el.style.top    = String(this.offset.top) + "px";
	}else{
		this.el.style.width  = String(this.offset.width) + "px";
		this.el.style.height = String(this.layout.borderInfo.size) + "px";
		this.el.style.left   = String(this.offset.left) + "px";
		this.el.style.top    = String(this.offset.top + this.position) + "px";
	}
};

Border.prototype.resizeLength = function(customResize){
	this.resize();
	var wingOffset = this.getWingOffset();
	this.leftWing.resizeWing(wingOffset.left,customResize);
	this.rightWing.resizeWing(wingOffset.right,customResize);
};

Border.prototype.resizeWing = function(){
	this.resize();
	var wingOffset = this.getWingOffset();
	this.leftWing.resizeLength(wingOffset.left);
	this.rightWing.resizeLength(wingOffset.right);
};

/**
 * 長さ変更による調整
 */
Border.prototype.modifyOffsetForLengthSize = function(offset){
	if(this.type === __constants__.border.types.vert.target){
		this.offset.top = offset.top;
		this.offset.height = offset.height;
	}else{
		this.offset.left = offset.left;
		this.offset.width = offset.width;
	}
	return this;
};

/**
 * 幅変更による調整
 */
Border.prototype.modifyOffsetForWingSize = function(offset, modifySize, customResize){

	//調整後のborderのoffset
	this.offset.width = offset.width;
	this.offset.height = offset.height;
	this.offset.left = offset.left;
	this.offset.top = offset.top;

	//positionを幅サイズの変更分修正
	if(!customResize){
		this.position = this.position + (modifySize/2);
	}

	return this;
};

/**
 * パネルの同士分裂によるサイズ調整
 */
Border.prototype.modifyOffsetForSameLevelDivision = function(panel, offset, dropPosition){
	var subSize;

	// エレメントの幅、　高さを調整
	var isVert = __utils__.isVerticalBorder(dropPosition);
	if(isVert !== true){
		subSize = offset.height/2+this.layout.borderInfo.halfSize;
		this.offset.height = this.offset.height - subSize;

		//エレメントのtop, left, positionを調整
		if(this.leftWing.isObject(panel) === true){
			this.offset.top = this.offset.top + subSize;
			this.position = this.position - subSize;
		}

	}else{

		subSize = offset.width/2+this.layout.borderInfo.halfSize;
		this.offset.width = this.offset.width - subSize;

		//エレメントのtop, left, positionを調整
		if(this.leftWing.isObject(panel) === true){
			this.offset.left = this.offset.left + subSize;
			this.position = this.position - subSize;
		}
	}
};

/**
 * 同士パネルの結合によるサイズ調整
 * modifyPosition側のサイズがoffsetサイズとなる
 */
Border.prototype.modifyOffsetForSameLevelClose = function(modifyPosition, offset){

	var plusSize;
	//
	var wingOffset = (modifyPosition === __constants__.border.types.vert.lw) ? this.getWingOffset().left : this.getWingOffset().right;

	//エレメントの幅、　高さを調整
	plusSize = offset[this.wh] - wingOffset[this.wh];
	this.offset[this.wh] = this.offset[this.wh] + plusSize;

	//エレメントのleft, positionを調整
	if(modifyPosition === __constants__.border.types.vert.lw){
		this.offset[this.lt] = this.offset[this.lt] - plusSize;
		this.position = this.position + plusSize;
	}
};

Border.prototype.getWingOffset = function(){
	var leftWing = {};
	var rightWing = {};
	if(this.type === __constants__.border.types.vert.target){
		leftWing.width = this.position;
		leftWing.height = this.offset.height;
		leftWing.left = this.offset.left;
		leftWing.top = this.offset.top;

		rightWing.width = (this.offset.width - leftWing.width - this.layout.borderInfo.size);
		rightWing.height = this.offset.height;
		rightWing.left = this.offset.left + leftWing.width + this.layout.borderInfo.size;
		rightWing.top = this.offset.top;

	}else{
		leftWing.width = this.offset.width;
		leftWing.height = this.position;
		leftWing.left = this.offset.left;
		leftWing.top = this.offset.top;

		rightWing.width = this.offset.width;
		rightWing.height = (this.offset.height - leftWing.height - this.layout.borderInfo.size);
		rightWing.left = this.offset.left;
		rightWing.top = this.offset.top + leftWing.height + this.layout.borderInfo.size;
	}
	return {left: leftWing, right: rightWing};
};

Border.prototype.setWing = function(leftObjects, rightObjects){
	this.leftWing.setObjects(leftObjects);
	this.rightWing.setObjects(rightObjects);
};

Border.prototype.setParentBorders = function(borders){
	this.parentBorders = borders;
};

Border.prototype.addParentBorder = function(parentBorder){
	if(this.isParentBorder(parentBorder) === false){
		this.parentBorders.push(parentBorder);
	}
};

Border.prototype.isParentBorder = function(parentBorder){
	for(var i = 0, iLen = this.parentBorders.length; i < iLen ; i++){
		if(this.parentBorders[i].id === parentBorder.id){
			return true;
		}
	}
	return false;
};

/**
 * 親境目が二つの場合、他の親境目を返す
 */
Border.prototype.getOrderParentBorder = function(parentBorder){

	if(this.parentBorders.length < 2){
		return null;
	}

	if(this.parentBorders[0].id === parentBorder.id){
		return this.parentBorders[1];
	}else if(this.parentBorders[1].id === parentBorder.id){
		return this.parentBorders[0];
	}else{
		return null;
	}
};

/*
 * 全ての親境目を削除、親境目からも自分を削除
 */
Border.prototype.removeAllParentBorders = function(){
	for(var i = 0, iLen = this.parentBorders.length; i < iLen; i++){
		this.parentBorders[i].removeWing(this);
	}
	this.parentBorders = [];
};

Border.prototype.changeParentBorder = function(oldBorder, newBorder){
	for(var i = 0, iLen = this.parentBorders.length; i < iLen; i++){
		if(this.parentBorders[i].id === oldBorder.id){
			this.parentBorders[i] = newBorder;
			break;
		}
	}
};

Border.prototype.removeWing = function(object){
	if(this.leftWing.removeObject(object) === false){
		this.rightWing.removeObject(object);
	}
};

Border.prototype.changeWing = function(panel, border){
	if(this.leftWing.changeObject(panel, border) === false){
		this.rightWing.changeObject(panel, border);
	}
};

Border.prototype.changePanel = function(oldPanel, newPanel, newBorder, dropPosition){
	var isLeft = __utils__.isLeftWing(dropPosition);

	//入れ替える対象を探す
	var wing;
	if(this.leftWing.isObject(oldPanel) === true){
		// 同一Panelでない場合
		if(isLeft !== true) {
			wing = this.leftWing;
		}
	}else if(this.rightWing.isObject(oldPanel) === true){
		if(isLeft === true) {
			wing = this.rightWing;
		}
	}

	// スワップ可能であると
	if(wing instanceof BorderWing){
		wing.changeObject(oldPanel, newPanel);
		oldPanel.changeParentBorder(this, newBorder);
		newPanel.addParentBorder(this);
	}
};

/**
 * 親境目に配置している自分の代わりにpanelを入れる
 */
Border.prototype.panelOnMyBehalfByParent　= function(panel){
	var parents = this.parentBorders;
	for(var i = 0, iLen = parents.length; i < iLen; i++){
		if(parents[i].leftWing.isObject(this)){
			parents[i].leftWing.setObjects([panel]);
			panel.addParentBorder(parents[i]);
		}else if(parents[i].rightWing.isObject(this)){
			parents[i].rightWing.setObjects([panel]);
			panel.addParentBorder(parents[i]);
		}
	}
};

/**
 * 親境目に配置している自分の代わりにpanelを入れる
 * bordersはソートされている
 */
Border.prototype.bordersOnMyBehalfByParent　= function(borders){
	var parents = this.sortParentBorders().parentBorders;
	if(parents.length < 1){
		return;
	}
	var firstBorder = borders[0];
	var lastBorder = borders[borders.length -1];
	var objects;
	var wh;
	var lt;
	var tempOffset;

	var borderInfo = __utils__.getBorderInfoWithType(parents[0].type);
	wh = borderInfo.wh;
	lt = borderInfo.lt;

	/*
	if(parents[0].type === __constants__.border.types.vert.target){
		wh = __constants__.border.types.vert.sizeTarget;
		lt = __constants__.border.types.vert.lw;
	}else{
		wh = __constants__.border.types.horz.sizeTarget;
		lt = __constants__.border.types.horz.lw;
	}
	*/

	for(var i = 0, iLen = parents.length; i < iLen; i++){
		var parent = parents[i];
		if(parent.leftWing.isObject(this)){
			objects = lastBorder.rightWing.objects;
			parent.leftWing.setObjects(objects);

			if(objects[0] instanceof Panel){
				tempOffset = objects[0].getOffset();
			}else{
				tempOffset = objects[0].offset;
			}

			parent.offset[lt] = parent.offset[lt] + parent.position - tempOffset[wh];
			parent.offset[wh] = parent.offset[wh] - parent.position + tempOffset[wh];
			parent.position = tempOffset[wh];

		}else if(parent.rightWing.isObject(this)){

			objects = firstBorder.leftWing.objects;
			if(objects[0] instanceof Panel){
				tempOffset = objects[0].getOffset();
			}else{
				tempOffset = objects[0].offset;
			}

			parent.rightWing.setObjects(objects);
			parent.offset[wh] = parent.position + this.layout.borderInfo.size + tempOffset[wh];
		}

		for(var j = 0, jLen = objects.length; j < jLen ; j++){
			objects[j].addParentBorder(parent);
		}
	}
};

/**
 * 親境目の親境目があるのか
 */
Border.prototype.isGrandparent = function(){
	var result = false;
	if(this.parentBorders.length > 0){
		for(var i = 0 , iLen = this.parentBorders.length; i < iLen ; i++){
			if(this.parentBorders[i].parentBorders.length > 0){
				result = true;
				break;
			}
		}
	}
	return result;
};

/**
 * 親境目の親境目に追加する
 */
Border.prototype.addByGrandparent = function(objects){
	if(this.isGrandparent()){
		//親境目が二つあっても、それぞれの親境目の親境目は同じであるので
		var parent = this.parentBorders[0];
		parent.addByParent(objects);
		for(var i = 0, iLen = objects.length; i < iLen ; i++){
			objects[i].setParentBorders(parent.parentBorders);
		}
		return true;
	}
	return false;
};

/**
 * 親境目に追加する
 */
Border.prototype.addByParent = function(objects){
	var parent = this.parentBorders;
	for(var i = 0, iLen = parent.length; i < iLen ; i++){

		//自身が配置されている側を取得
		var wing;
		if(parent[i].leftWing.isObject(this)){
			wing = parent[i].leftWing;
		}else{
			wing = parent[i].rightWing;
		}

		for(var j = 0, jLen = objects.length; j < jLen; j++){
			wing.addObject(objects[j]);
		}
	}
};

/**
 * parentソート
 */
Border.prototype.sortParentBorders = function(){
	if(this.type === __constants__.border.types.vert.target){
		this.parentBorders.sort(function(a, b){
			return a.offset.left - b.offset.left;
		});
	}else{
		this.parentBorders.sort(function(a, b){
			return a.offset.top - b.offset.top;
		});
	}
	return this;
};

Border.prototype.toJSON = function(){
	return {
		id: this.id,
		instanceName: 'Border',
		type: this.type,
		offset: this.offset,
		position: this.position,
		parentBorders: function(){
				var ids = [];
				for(var i=0, iLen = this.parentBorders.length; i < iLen; i++){
					ids.push(this.parentBorders[i].id);
				}
				return ids;
			}.bind(this)(),
		leftWing: this.leftWing.toJSON(),
		rightWing: this.rightWing.toJSON()
	};
};

//
//
//
Border.prototype.removeAllObjects = function() {
	this.leftWing.removeAllObjects();
	this.rightWing.removeAllObjects();
};


Border.prototype.didRecalculateOffset = function(argOffset){
	var isVert = __utils__.isVerticalBorderWithTarget(this.type);

	if(isVert === true){
		// 列並びであるのでleft, widthのみ適用する。
		this.offset.left = argOffset.left;
		this.offset.width = argOffset.width;

		// positionを再計算する。
		this.position = __utils__.calcBorderPos(this.offset.width, this.layout.borderInfo.halfSize);
	}
	else {
		// 行並びであるのでtop, heightのみ適用する。
		this.offset.top = argOffset.top;
		this.offset.height = argOffset.height;

		// positionを再計算する。
		this.position = __utils__.calcBorderPos(this.offset.height, this.layout.borderInfo.halfSize);
	}

	if(this.type === __constants__.border.types.vert.target){
		this.el.style.width  = String(this.layout.borderInfo.size) + "px";
		this.el.style.height = String(this.offset.height) + "px";
		this.el.style.left   = String(this.offset.left + this.position) + "px";
		this.el.style.top    = String(this.offset.top) + "px";
	}else{
		this.el.style.width  = String(this.offset.width) + "px";
		this.el.style.height = String(this.layout.borderInfo.size) + "px";
		this.el.style.left   = String(this.offset.left) + "px";
		this.el.style.top    = String(this.offset.top + this.position) + "px";
	}

	var wingOffset = this.getWingOffset();
	this.leftWing.resizeWing(wingOffset.left);
	this.rightWing.resizeWing(wingOffset.right);
};
