/**
 * @file	layout.js
 * @brief	最上位オブジェクトでPanel, Borderなどを管理する。
 *        	レイアウト
 * @author	cukim
 * @date
 * 			2017.03.27
 * 				- added by choi sunwoo
 * 				- 14をthis.borderInfo.sizeへ変更する。
 */
var Layout = function(parentEl, option){
	this.parentEl = parentEl;

	//===========================================================================
	// 2017-03-27 Taeho
	// add option
	this.option = option;

	//
	this.init();
};

Layout.prototype.init = function(){
	//
	// added by choi sunwoo at 2017.03.27 for panel managing
	//
	this.panels = [];
	//

	this.el = templates.get('layout', true);
	this.btnEl = this.el.querySelector('.first-add-btn');
	this.dropAreaEl = document.createElement('div');
	//生成するborderやpanelを格納して置き
	this.storage = [];

	//windowをresizeする際に使う為
	this.borderWing = new BorderWing(this);

	this.resizeTimer = false;

	//removeEventListenerに渡すため
	this.displayDropAreaBind = this.displayDropArea.bind(this);
	this.dropWidgetBind = this.dropWidget.bind(this);

	this.render();

	//復元を行う
	restore.init(this);

	if(this.option && this.option.defaultAddButton !== true) {
		this.btnEl.style.visibility = "hidden";
	}

	//
	if(this.option && this.option.defaultAddModal) {
		this.defaultAddModal = this.option.defaultAddModal;
	}

	//
	this.borderInfo = {
		dropPositionSizeRatio : __constants__.border.dropPositionSizeRatio,
		dragSize : __constants__.border.dragSize,
		size : __constants__.border.size,
		halfSize : __constants__.border.halfSize
	};

	this.tabHeight = __constants__.tab.height;
	if(this.option && this.option.hideDefautlTab === true) {
		this.hideDefautlTab = this.option.hideDefautlTab;
		this.tabHeight = 0;

		this.borderInfo.size = 3;
		this.borderInfo.halfSize = 1.5;
	}
};

Layout.prototype.render = function(){
	this.event();
	this.parentEl.appendChild(this.el);

	//resize前の幅と高さを保存して置く
	this.offset = {
		width: this.el.offsetWidth,
		height: this.el.offsetHeight,
		left: 0,
		top: 0
	};
};

Layout.prototype.event = function(){
	this.btnEl.addEventListener("click", this.openModal.bind(this), false);
	window.addEventListener("resize", this.setResize.bind(this), false);
	this.el.addEventListener("mouseout", this.tabMouseOut.bind(this), false);
};

Layout.prototype.openModal = function(e){
	e.preventDefault();

	//===========================================================================
	// 2017-03-27 Taeho
	//モーダルでwidgetを選択した際にパネルをranderし、パネルにそのwidgetを表示する
	if(this.defaultAddModal) {
		//
		// modified by choi sunwoo at 2017.04.14 #642
		// Panelは直接生成しないようにする。
		//
		var panel = this.didCreatePanel();
		//

		var callback = function(widget){
		panel.addWidget(widget).render();

			//保存して置く
			this.addStorage(panel);
		}.bind(this);

		this.modal = new Modal(document.body, 'Add a widget', new WidgetList(callback, this));
		this.modal.render();
	}
	else {
		//===========================================================================
		// 2017-03-27 Taeho
		//モーダル

		//
		// added by choi sunwoo at 2017.04.14 for #642
		//
		var callback = function(text, componentRef, resizeReflector){
			if( text ){
				//
				// modified by choi sunwoo at 2017.04.14 #642
				// Panelは直接生成しないようにする。
				//
				var panel = this.didCreatePanel();
				//

				widget.setName( text );
				widget.resizeReflector = resizeReflector;
				widget.componentRef = componentRef;

				panel.addWidget(widget).render();

				//保存して置く
				this.addStorage(panel);
			}else{
				delete widget;
			}
		}.bind(this);

		if( this.option && this.option.owner ){
			var widget = new Widget('FXQB', this);

			this.option.owner.addPanel(widget.contentEl, callback);
		}
	}

	return false;
};

Layout.prototype.setResize = function(e){
	e.preventDefault();
	if (this.resizeTimer !== false) {
		clearTimeout(this.resizeTimer);
	}

	this.resizeTimer = setTimeout(this.windowResize.bind(this), 200);
};

Layout.prototype.windowResize = function(){

	this.offset.width = this.el.offsetWidth;
	this.offset.height = this.el.offsetHeight;

	if(this.storage.length < 1){
		return false;
	}

	if(this.storage[0] instanceof Panel){
		this.storage[0].resize(this.offset);

	}else{
		var objects = this.getTopLavelBorder();
		this.borderWing.setObjects(objects);
		if(this.option && this.option.customResize){
			this.borderWing.resizeWing(this.offset,this.option.customResize);
		} else {
			this.borderWing.resizeWing(this.offset);
		}

		if(this.option && this.option.customResize){
			this.borderWing.resizeLength(this.offset,this.option.customResize);
		} else {
			this.borderWing.resizeLength(this.offset);
		}
	}
};

/**
 * 最上位Borderインスタンスを取得する。
 * @return {Array}
 */
Layout.prototype.getTopLavelBorder = function(){

	if(this.storage.length < 1){
		return [];
	}

	// 最上位のものはparentBordersの数が0以下のもの（親がないもの）
	var objects = [];
	for(var i = 0, iLen = this.storage.length; i < iLen; i++){
		if(this.storage[i].parentBorders.length < 1){
			objects.push(this.storage[i]);
		}
	}

	// 0番目が最上位になるように位置順序で整列する。
	if(objects[0].type === __constants__.border.types.vert.target){
		objects.sort(function(a, b){
			return a.offset.left - b.offset.left;
		});
	}else{
		objects.sort(function(a, b){
			return a.offset.top - b.offset.top;
		});
	}

	return objects;
};

/**
 * Panel or Border を格納
 */
Layout.prototype.addStorage = function(object){
	//
	//
	if(object instanceof Panel || this.storage[0] instanceof Panel){
		this.storage = [object];
	}else{
		this.storage.push(object);
	}

	this.backup();
};

Layout.prototype.removeStorage = function(object, lastPanel){

	this.el.removeChild(object.el);
	for(var i = 0, iLen = this.storage.length; i < iLen; i++){
		if(this.storage[i].id === object.id){
			this.storage.splice(i, 1);
			break;
		}
	}

	if(this.storage.length < 1){
		if(lastPanel instanceof Panel){
			this.addStorage(lastPanel);
		}else{
			this.el.classList.remove('is-panel');
		}
	}

	this.backup();
};

/**
 * [description]
 * @return [type]
 */
Layout.prototype.backup = function(){

	//
	// 0番目がPanelであるとPanelのみ、そうではないとBorderのリストを使用する。
	// TODO: ここは確実に実現しなかったように見えるから後の修正が必要であると思う。
	//
	var temp = [];
	if(this.storage[0] instanceof Panel){
		temp.push(this.storage[0].toJSON());
	}else{
		var borders = this.getTopLavelBorder();
		for(var i = 0, iLen = borders.length; i < iLen; i++){
			temp.push(borders[i].toJSON());
		}
	}

	localStorage.setItem('gifi', null);
	// localStorage.setItem('gifi', JSON.stringify(temp));
};

Layout.prototype.isDisplayDropArea = function(){
	if(this.dropAreaEl.classList.contains('layout-drop-area-top') === true||
		this.dropAreaEl.classList.contains('layout-drop-area-right') === true ||
		this.dropAreaEl.classList.contains('layout-drop-area-bottom') === true ||
		this.dropAreaEl.classList.contains('layout-drop-area-left') === true ){
		return true;
	}
	return false;
};

/**
 * タブをドラグした上でマウスアウトした時
 */
Layout.prototype.tabMouseOut = function(e){
	var moveWidget = session.get('moveWidget');
	if(moveWidget === undefined){
		return false;
	}
	this.dropAreaEl.className = 'none';
};

/**
 * タブをドラグした上でマウスオーバー
 */
Layout.prototype.tabMouseOver = function(startX, startY, layoutX, layoutY){
	this.startX = startX;
	this.startY = startY;
	this.layoutX = layoutX;
	this.layoutY = layoutY;
	this.el.addEventListener("mousemove", this.displayDropAreaBind, false);
	this.el.addEventListener("mouseup", this.dropWidgetBind, false);
};

Layout.prototype.displayDropArea = function(e){

	var moveWidget = session.get('moveWidget');
	if(moveWidget === undefined){
		this.dropAreaEl.className = 'none';
		this.el.removeEventListener("mousemove", this.displayDropAreaBind, false);
		this.el.removeEventListener("mouseup", this.dropWidgetBind, false);
		return false;
	}

	//マウスカーソルがタブにあるときには無効
	if(e.target.className.indexOf('panel-tab-item') > -1){
		return false;
	}

	var moveX = e.clientX - this.startX;
	var moveY = e.clientY - this.startY;
	var layoutX = this.layoutX + moveX;
	var layoutY = this.layoutY + moveY;
	var className;

	if(layoutX > 0 && layoutX < 30){
		className = 'layout-drop-area-left';
	}else if(layoutX > this.offset.width-50 && layoutX < this.offset.width){
		className = 'layout-drop-area-right';
	}else if(layoutY > 0 && layoutY < 30){
		className = 'layout-drop-area-top';
	}else if(layoutY > this.offset.height-30 && layoutY < this.offset.height){
		className = 'layout-drop-area-bottom';
	}else{
		className = 'none';
	}

	if(className !== 'none'){
		if(this.dropAreaEl.classList.contains(className) === false){
			this.dropAreaEl.className = className;
		}

		this.dropAreaEl.style.width = '';
		this.dropAreaEl.style.height = '';
		this.dropAreaEl.style.left = '';
		this.dropAreaEl.style.top = '';
		this.dropAreaEl.className = className;
		this.el.appendChild(this.dropAreaEl);
	}
};

/**
 * widgetをドロップ
 */
Layout.prototype.dropWidget = function(e){

	var moveWidget = session.get('moveWidget');
	if(moveWidget === undefined){
		return false;
	}

	var dropPosition = this.getDropPosition();
	this.dropAreaEl.className = 'none';

	//ドロップした位置がなければ
	if(dropPosition === false){
		return false;
	}

	//layout上、一つpanel上、widgetが一つしかない。
	if(this.storage[0] instanceof Panel && this.storage[0].widgets.length < 2){
		return false;
	}

	//タブを閉じる
	moveWidget.close();

	var type = (dropPosition === __constants__.border.types.vert.lw || dropPosition === __constants__.border.types.vert.rw) ? __constants__.border.types.vert.target : __constants__.border.types.horz.target;
	var position = this.getPosition(dropPosition);
	var offset = {
		width: this.offset.width,
		height: this.offset.height,
		top: this.offset.top,
		left: this.offset.left
	};

	//新し境目を生成
	var border = new Border(this, type, offset, position);

	//新しいパネルを生成
	var newPanel = this.didCreatePanel();//new Panel(this);
	newPanel.addWidget(moveWidget);

	//パネルの場合
	if(this.storage[0] instanceof Panel){
		this.panelDivision(border, newPanel, this.storage[0], dropPosition);

	//境目の場合
	}else{

		var borders = this.getTopLavelBorder();

		if(borders[0].type === type){
			this.sameLevelDivision(border, newPanel, borders, dropPosition);
		}else{
			this.childLevelDivision(border, newPanel, borders, dropPosition);
		}
	}

	//サイズ調整
	border.resizeWing();

	//生成したパネルを表示
	newPanel.render();

	//layoutに保存して置く
	this.addStorage(border);

	this.debug('drop on layout: ');

	//
	// added by choi sunwoo at 2017.04.14 for #642
	//
	this.didReflectCallForAllWidgetComponetRefs();
	//
};

Layout.prototype.getDropPosition = function(){
	var className = this.dropAreaEl.className;

	return(__utils__.getDropPositionForLayout(className));
};

/**
 * [description]
 * @param  {[type]} dropPosition
 * @return [type]
 */
Layout.prototype.getPosition = function(dropPosition){
	// ドロップ位置の領域を1/4を使用しているため、以下のような検査で位置を感知する。
	var ratioLt = __constants__.border.dropPositionSizeRatio;
	var ratioRb = __constants__.border.dropPositionSizeRatio * 3;

	//
	if(dropPosition === __constants__.border.types.horz.lw){
		return Math.floor(this.offset.height * ratioLt);
	}else if(dropPosition === __constants__.border.types.vert.lw){
		return Math.floor(this.offset.width * ratioLt);
	}else if(dropPosition === __constants__.border.types.vert.rw){
		return Math.floor(this.offset.width * ratioRb);
	}else if(dropPosition === __constants__.border.types.horz.rw){
		return Math.floor(this.offset.height * ratioRb);
	}
};

/**
 * 左右ウィングのパネルをセットする。
 * @param  {[type]} border
 * @param  {[type]} newPanel
 * @param  {[type]} oldPanel
 * @param  {[type]} dropPosition
 * @return [type]
 */
Layout.prototype.panelDivision = function(border, newPanel, oldPanel, dropPosition){

	//境目に子パネルをセット
	if(dropPosition === __constants__.border.types.vert.lw || dropPosition === __constants__.border.types.horz.lw){
		border.setWing([newPanel], [oldPanel]);
	} else {
		border.setWing([oldPanel], [newPanel]);
	}

	//各子パネルに親境目をセット（生成した境目）
	newPanel.setParentBorders([border]);
	oldPanel.setParentBorders([border]);
};

Layout.prototype.sameLevelDivision = function(border, newPanel, oldBorders, dropPosition){

	var oldObjects;

	var oldOffset = {
		width: border.offset.width,
		height: border.offset.height,
		left: border.offset.left,
		top: border.offset.top
	};

	var backupOffset = {
		width: border.offset.width,
		height: border.offset.height,
		left: border.offset.left,
		top: border.offset.top
	};

	//各offset調整
	if(dropPosition === __constants__.border.types.horz.lw){
		oldOffset.top = border.position + this.borderInfo.size;
		oldOffset.height = oldOffset.height - border.position - this.borderInfo.size;

	}else if(dropPosition === __constants__.border.types.vert.rw){
		oldOffset.width = border.position;

	}else if(dropPosition === __constants__.border.types.horz.rw){

		oldOffset.height = border.position;

	}else if(dropPosition === __constants__.border.types.vert.lw){

		oldOffset.left = border.position + this.borderInfo.size;
		oldOffset.width = oldOffset.width - border.position - this.borderInfo.size;
	}

	//既存のものを先にresizeして置く
	this.borderWing.setObjects(oldBorders);
	this.borderWing.resizeWing(oldOffset);

	//境目に子パネルをセット
	if(dropPosition === __constants__.border.types.vert.lw || dropPosition === __constants__.border.types.horz.lw){
		oldObjects = oldBorders[0].leftWing.objects;
		border.setWing([newPanel], oldObjects);

		if(dropPosition === __constants__.border.types.vert.lw){
			border.offset.width = border.position + this.borderInfo.size + oldBorders[0].position;
		}else{
			border.offset.height = border.position + this.borderInfo.size + oldBorders[0].position;
		}

	} else {
		var lastBorder = oldBorders[oldBorders.length - 1];
		oldObjects = lastBorder.rightWing.objects;
		border.setWing(oldObjects, [newPanel]);

		if(dropPosition === __constants__.border.types.vert.rw){
			border.position = lastBorder.offset.width - lastBorder.position - this.borderInfo.size;
			border.offset.left = oldOffset.width - border.position;
			border.offset.width = backupOffset.width - border.offset.left;
		}else{
			border.position = lastBorder.offset.height - lastBorder.position - this.borderInfo.size;
			border.offset.top = oldOffset.height - border.position;
			border.offset.height = backupOffset.height - border.offset.top;
		}
	}

	//子パネルに親境目をセット（生成した境目）
	newPanel.setParentBorders([border]);

	//既存のobjectsに親境目をセット
	for(var i = 0, iLen = oldObjects.length; i < iLen ; i++){
		oldObjects[i].addParentBorder(border);
	}
};

Layout.prototype.childLevelDivision = function(border, newPanel, oldBorders, dropPosition){

	//境目に子パネルをセット
	if(dropPosition === __constants__.border.types.vert.lw || dropPosition === __constants__.border.types.horz.lw){
		border.setWing([newPanel], oldBorders);
	} else {
		border.setWing(oldBorders, [newPanel]);
	}

	//各子パネルに親境目をセット（生成した境目）
	newPanel.setParentBorders([border]);

	for(var i = 0, iLen = oldBorders.length; i < iLen ; i++){
		oldBorders[i].setParentBorders([border]);
	}
};

/**
 * デバッグ
 * パネル、境目を生成、削除が終わった時点でチェックを行う
 */
Layout.prototype.debug = function(message){

	var objects = [];
	if(this.storage[0] instanceof Panel){
		objects = this.storage;
	}else{
		objects = this.getTopLavelBorder();
	}
	debug.exe(objects, message);
};



//
// added by choi sunwoo at 2017.03.24
//

Layout.prototype.getOffset = function() {
	return({
		width: this.offset.width,
		height: this.offset.height,
		top: this.offset.top,
		left: this.offset.left
	});
};

Layout.prototype.addPanel = function(argCount) {
	var dropPosition = __constants__.border.types.vert.lw;
	var type = __utils__.getBorderTargetWithPosition(dropPosition);
	var position = this.getPosition(dropPosition);
	var offset = this.getOffset();

	//新し境目を生成
	var border = new Border(this, type, offset, position);

	//新しいwidgetを生成
	var widget = new Widget('FXQB', this);

	//新しいパネルを生成
	var newPanel = this.didCreatePanel();//new Panel(this);
	//newPanel.addWidget(widget);

	//パネルの場合
	if(this.storage[0] instanceof Panel){
		this.panelDivision(border, newPanel, this.storage[0], dropPosition);

	//境目の場合
	}else{

		var borders = this.getTopLavelBorder();
		var bChild = false;
		if(borders === undefined || borders == null || borders.length < 1) {
			bChild = true;
		}
		else {
			if(borders[0].type !== type){
				bChild = true;
			}
		}

		if(bChild !== true){
			this.sameLevelDivision(border, newPanel, borders, dropPosition);
		}else{
			this.childLevelDivision(border, newPanel, borders, dropPosition);
		}
	}

	//サイズ調整
	border.resizeWing();

	//生成したパネルを表示
	newPanel.render();

	//layoutに保存して置く
	this.addStorage(border);
};

Layout.prototype.testPanel = function() {
	if(this.storage[0] instanceof Panel){
		console.log("Top is panel");

	}else{
		var objects = this.getTopLavelBorder();

		console.log(objects);
	}
};

Layout.prototype.didCreatePanel = function() {
	var panel = new Panel(this);

	this.panels.push(panel);

	return(panel);
};

Layout.prototype.didClosePanel = function(object) {
	var nCnt = this.panels.length;
	for(var ii = 0; ii < nCnt; ii++) {
		if(this.panels[ii] === object) {
			this.panels.splice(ii);
			return(true);
		}
	}

	return(false);
};

Layout.prototype.didCloseAllPanel = function() {
	var nCnt = this.panels.length;
	for(var ii = nCnt - 1; ii >= 0; ii--) {
		this.panels[ii].close(true);
	}

	this.panels = [];
};

Layout.prototype.addPanelWithWidget = function(widget) {
	var panel = this.didCreatePanel();
	if(widget !== undefined && widget != null) {
		panel.addWidget(widget);
	}

	//
	panel.render();

	//保存して置く
	this.addStorage(panel);

	return(panel);
};

/**
 * 間接的にWidgetのcomponentRefの何かを呼び出すための反向関数
 * @param  {[type]} reflector	callback function
 * @return {[type]}
 */
Layout.prototype.didReflectCallForAllWidgetComponetRefs = function(reflector,direction) {
	var nCount = this.panels.length;
	for(var ii = 0; ii < nCount; ii++) {
		var panel = this.panels[ii];
		if(panel && panel.didReflectCallForAllWidgetComponetRefs) {
			panel.didReflectCallForAllWidgetComponetRefs(reflector);
		}
	}
};
//
