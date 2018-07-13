var Panel = function(layout){
	this.layout = layout;
	this.init();
};

Panel.prototype.init = function(){
	this.id = createGuid();

	//親境目
	this.parentBorders = [];

	//タブ
	this.widgets = [];
	this.el = templates.get('panel-main', true);
	this.addBtnEl = this.el.querySelector('.panel-tab-item-add');
	this.optionBtnEl = this.el.querySelector('.panel-tab-option');
	this.tabListEl = this.el.querySelector('.panel-tabs');
	this.tabsEl = this.el.querySelector('.panel-tab-items');
	this.contentsEl = this.el.querySelector('.panel-contents');

	//
	this.didHideTabButton(this.layout.hideDefautlTab);

	//
	this.optionBtnEl.style.visibility = "hidden";

	//
	this.layoutEl = this.layout.el;
	this.dropAreaEl = this.layout.dropAreaEl;

	//===========================================================================
	// 2017-03-27 Taeho
	// comment out
	//
	// modified by choi sunwoo at 2017.04.03 for using default add function
	if(this.layout.defaultAddModal) {
		// モーダルで選んだwidgetを追加する
		var callback = function(widget){
			this.addWidget(widget);
			this.layout.backup();
		}.bind(this);

		//モーダルのコンテンツ
		this.modal = new Modal(document.body, 'Add a widget', new WidgetList(callback, this.layout));
	}
	//===========================================================================

	//removeEventListenerに渡すため
	this.displayDropAreaBind = this.displayDropArea.bind(this);
	this.dropWidgetBind = this.dropWidget.bind(this);
};

Panel.prototype.didHideTabButton = function(isHide) {
	if(isHide === true) {
		this.addBtnEl.classList.add("panel-no-tab");
		this.optionBtnEl.classList.add("panel-no-tab");
		this.tabListEl.classList.add("panel-no-tab");
		this.tabsEl.classList.add("panel-no-tab");
		this.contentsEl.classList.add("panel-contents-no-tab");
	}
	else {
		this.addBtnEl.classList.remove("panel-no-tab");
		this.optionBtnEl.classList.remove("panel-no-tab");
		this.tabListEl.classList.remove("panel-no-tab");
		this.tabsEl.classList.remove("panel-no-tab");
		this.contentsEl.classList.remove("panel-contents-no-tab");
	}
};

Panel.prototype.render = function(){
	this.event();
	if(this.layoutEl.classList.contains('is-panel') === false){
		this.layoutEl.classList.add('is-panel');
	}
	this.layoutEl.appendChild(this.el);

	this.tabListResize();
};

Panel.prototype.resize = function(offset){
	this.el.style.width = String(offset.width) + "px";
	this.el.style.height = String(offset.height) + "px";
	this.el.style.left = String(offset.left) + "px";
	this.el.style.top = String(offset.top) + "px";
	this.tabListResize();

	//
	return this;
};

Panel.prototype.event = function(){

	//+タブをクリック
	this.addBtnEl.addEventListener("click", this.openModal.bind(this), false);

	//タブをドラグした上で+タブへマウスオーバー
	this.addBtnEl.addEventListener("mouseover", this.addBtnMouseOver.bind(this), false);

	//タブ移動の後
	this.tabsEl.addEventListener("mouseup", this.tabsMouseup.bind(this), false);

	//タブをドラグした上でマウスオーバー
	this.contentsEl.addEventListener("mouseover", this.contentsMouseOver.bind(this), false);

	//タブをドラグした上でマウスアウト
	this.contentsEl.addEventListener("mouseout", this.contentsMouseOut.bind(this), false);
};

Panel.prototype.openModal = function(e){
	e.preventDefault();

	// modified by choi sunwoo at 2017.04.03 for using default add function
	if(this.layout.defaultAddModal) {
		this.modal.render();
	}
	else {
		//===========================================================================
		// 2017-03-27 Taeho
		if(this.layout.option && this.layout.option.owner){
			//
			// added by choi sunwoo at 2017.04.14 for #642
			//
			var callback = function(text, componentRef, resizeReflector){
				if( text ){
					widget.componentRef = componentRef;
					widget.setName( text );
					widget.resizeReflector = resizeReflector;

					this.addWidget(widget);
					this.layout.backup();
				}else{
					delete widget;
				}
			}.bind(this);

			var widget = new Widget('FXQB', this.layout);

			this.layout.option.owner.addPanel( widget.contentEl, callback );
		}
	}

	return false;
};

/**
 * タブをドラグした上でマウスオーバー
 */
Panel.prototype.addBtnMouseOver = function(e){
	e.preventDefault();
	var moveWidget = session.get('moveWidget');
	if(moveWidget === undefined){
		return false;
	}

	//自分を持っているパネルであれば
	if(this.isWidget(moveWidget)){
		moveWidget.removeTabClone();
		moveWidget.tabEl.classList.add('panel-tab-item-move-target');
		this.tabsEl.appendChild(moveWidget.tabEl);

	//他のパネルにドラグした時
	}else{
		moveWidget.createTabClone();
		this.tabsEl.appendChild(moveWidget.tabElClone);
		session.set('panelHaveTabClone', this);
	}
	this.tabListResize();
};

/**
 * タブ移動の後
 */
Panel.prototype.tabsMouseup = function(e){
	e.preventDefault();
	var moveWidget = session.get('moveWidget');
	if(moveWidget === undefined){
		return false;
	}

	//既に持っているタブであれば
	if(this.isWidget(moveWidget)){
		return false;
	}

	//元のパネルからはclose
	moveWidget.close();

	//追加する
	this.addWidget(moveWidget);
};

/**
 * タブをドラグした上でマウスオーバー
 */
Panel.prototype.contentsMouseOver = function(e){
	e.preventDefault();
	var moveWidget = session.get('moveWidget');
	if(moveWidget === undefined){
		return false;
	}

	moveWidget.tabEl.classList.remove('panel-tab-item-move-target');

	this.contentsEl.addEventListener("mousemove", this.displayDropAreaBind, false);
	this.contentsEl.addEventListener("mouseup", this.dropWidgetBind, false);
};

/**
 * タブをドラグした上でマウスアウト
 */
Panel.prototype.contentsMouseOut = function(e){
	e.preventDefault();
	if(session.get('moveWidget') === undefined){
		return false;
	}
	this.dropAreaEl.className = 'none';
};

/**
 * タブをドロップする領域
 */
Panel.prototype.displayDropArea = function(e){
	var moveWidget = session.get('moveWidget');
	if(moveWidget === undefined){
		this.dropAreaEl.className = 'none';
		this.contentsEl.removeEventListener("mousemove", this.displayDropAreaBind, false);
		this.contentsEl.removeEventListener("mouseup", this.dropWidgetBind, false);
		return false;
	}

	//
	// fixed by choi sunwoo at 2017.04.03 for #585
	// e.offsetYの値がZone何とかで計算されてくるが何か補正された値が来るため、位置計算がおかしくなる。
	// それで、直接計算した位置情報を使用する。
	//
	//
	var relativePos = __utils__.didConvertToRelativePositionForEvent(e);
	var dropPos = {
		x : relativePos.x,
		y : relativePos.y - __constants__.tab.height
	};
	var className = this.getDropAreaClassName(parseInt(dropPos.x, 10), parseInt(dropPos.y, 10));
	/*
	var className = this.getDropAreaClassName(parseInt(e.offsetX, 10), parseInt(e.offsetY, 10) + 37);
	*/
	if(this.dropAreaEl.classList.contains(className) === false){
		this.dropAreaEl.className = className;
		this.el.appendChild(this.dropAreaEl);
	}
};

/**
 * widgetをドロップ
 */
Panel.prototype.dropWidget = function(e){

	//layout displayDropAreaが表示されていれば
	if(this.layout.isDisplayDropArea() === true){
		return false;
	}

	// fixed by choi sunwoo at 2017.03.27
	// return値がundefinedのケースがあるため、検査が必要
	// undefinedのケースはfalseにしておいたため、falseの検査のみ必要
	// layoutもそのケースがあるがそっちは検査がある。
	var dropPosition = this.getDropPosition();
	if(dropPosition === false) {
		return(false);
	}

	var moveWidget = session.get('moveWidget');

	//widgetが一つであり、それが自分の時
	if(this.widgets.length < 2 && this.widgets[0].id === moveWidget.id){
		return false;
	}
	moveWidget.close();

	//
	var type = (__utils__.isVerticalBorder(dropPosition) === true) ? __constants__.border.types.vert.target : __constants__.border.types.horz.target;
	if(this.parentBorders.length > 0 && this.parentBorders[0].type === type){
		this.sameLevelDivision(dropPosition, type, moveWidget);
	}else{
		this.childLevelDivision(dropPosition, type, moveWidget);
	}

	this.dropAreaEl.className = 'none';

	this.layout.debug('drop on panel: ');

	//
	// added by choi sunwoo at 2017.04.14 for #642
	//
	this.layout.didReflectCallForAllWidgetComponetRefs();
	//
};

//同士分裂
Panel.prototype.sameLevelDivision = function(dropPosition, type, widget){

	//パネルのサイズ情報
	var offset = this.getOffset();

	//新し境目を生成
	var border = new Border(this.layout, type, offset);

	//新しいパネルを生成
	var panel = this.layout.didCreatePanel();//new Panel(this.layout);
	panel.addWidget(widget);

	//境目に親境目の親境目をセット
	if(this.parentBorders.length > 0){
		this.parentBorders[0].addByParent([border]);
		border.setParentBorders(this.parentBorders[0].parentBorders);
	}

	//親境目の左右側のパネルをリセット
	for(var i = 0, iLen = this.parentBorders.length; i < iLen; i++){

		//サイズを変更
		this.parentBorders[i].modifyOffsetForSameLevelDivision(this, offset, dropPosition);
		this.parentBorders[i].changePanel(this, panel, border, dropPosition);
	}

	// 境目に子パネルをセット
	// ドロップ位置によって新たなPanelと自信の位置を調整する。
	var isLeftWing = __utils__.isLeftWing(dropPosition);
	if(isLeftWing === true){
		// 新規Panelを左へ
		border.setWing([panel], [this]);
	} else {
		// 新規Panelを右へ
		border.setWing([this], [panel]);
	}

	//各子パネルに親境目をセット（生成した境目）
	this.addParentBorder(border);
	panel.addParentBorder(border);

	//サイズ調整
	border.resizeWing();

	//生成したパネルを表示
	panel.render();

	//layoutに保存して置く
	this.layout.addStorage(border);

	//
	return(panel);
};

//再生産分裂
Panel.prototype.childLevelDivision = function(dropPosition, type, widget){

	//新し境目を生成
	var border = new Border(this.layout, type, this.getOffset());

	//新しいパネルを生成
	var panel = this.layout.didCreatePanel();//new Panel(this.layout);
	panel.addWidget(widget);

	//親境目に元の子パネルを削除し生成した境目をセットする
	for(var i = 0, iLen = this.parentBorders.length; i < iLen; i++){
		this.parentBorders[i].changeWing(this, border);
	}

	//境目に親境目をセット
	border.setParentBorders(this.parentBorders);

	// 境目に子パネルをセット
	// ドロップ位置によって新たなPanelと自信の位置を調整する。
	var isLeftWing = __utils__.isLeftWing(dropPosition);
	if(isLeftWing === true){
		// 新規Panelを上へ
		border.setWing([panel], [this]);
	} else {
		// 新規Panelを下へ
		border.setWing([this], [panel]);
	}

	//各子パネルに親境目をセット（生成した境目）
	this.setParentBorders([border]);
	panel.setParentBorders([border]);

	//サイズ調整
	border.resizeWing();

	//生成したパネルを表示
	panel.render();

	//layoutに保存して置く
	this.layout.addStorage(border);

	//
	return(panel);
};

/**
 * ドロップする位置を表示
 */
Panel.prototype.getDropAreaClassName = function(x, y){

	//layout displayDropAreaが表示されていれば
	if(this.layout.isDisplayDropArea() === true){
		return 'none';
	}

	var moveWidget = session.get('moveWidget');

	//widgetが一つであり、それが自分の時
	if(this.widgets.length < 2 && this.widgets[0].id === moveWidget.id){
		return 'drop-area-all';
	}

	//幅の1/6
	var width6 = parseInt(this.el.offsetWidth/6, 10);
	//高さの1/6
	var height6 = parseInt(this.el.offsetHeight/6, 10);
	var className;

	//左
	if(x < width6*2){

		if(y < height6){
			className = 'drop-area-top';
		}else if(y > height6*5){
			className = 'drop-area-bottom';
		}else{
			className = 'drop-area-left';
		}

	//右
	}else　if(x > width6*4){

		if(y < height6){
			className = 'drop-area-top';
		}else if(y > height6*5){
			className = 'drop-area-bottom';
		}else{
			className = 'drop-area-right';
		}

	//中央
	}else{
		if(y < height6*2){
			className = 'drop-area-top';
		}else if(y > height6*3){
			className = 'drop-area-bottom';
		}else {
			if(x < width6*3){
				className = 'drop-area-left';
			}else{
				className = 'drop-area-right';
			}
		}
	}

	return className;
};

Panel.prototype.appendToLayout = function(node){
	this.layoutEl.appendChild(node);
};

Panel.prototype.removeToLayout = function(node){
	this.layoutEl.removeChild(node);
};

Panel.prototype.insertFrontTab = function(newTabEl, referenceTabEl){
	var isTabResize = newTabEl.parentNode === referenceTabEl.parentNode;
	this.tabsEl.insertBefore(newTabEl, referenceTabEl);
	if(isTabResize === false){
		this.tabListResize();
	}
};

Panel.prototype.insertBackTab = function(newTabEl, referenceTabEl){
	var isTabResize = newTabEl.parentNode === referenceTabEl.parentNode;
	this.tabsEl.insertBefore(newTabEl, referenceTabEl.nextSibling);
	if(isTabResize === false){
		this.tabListResize();
	}
};

Panel.prototype.appendContent = function(contentEl){
	this.contentsEl.appendChild(contentEl);
};

Panel.prototype.removeContent = function(contentEl){
	this.contentsEl.removeChild(contentEl);
};

Panel.prototype.setParentBorders = function(borders){
	this.parentBorders = borders;
};

Panel.prototype.addParentBorder = function(parentBorder){
	if(this.isParentBorder(parentBorder) === false){
		this.parentBorders.push(parentBorder);
	}
};

Panel.prototype.isParentBorder = function(parentBorder){
	for(var i = 0, iLen = this.parentBorders.length; i < iLen ; i++){
		if(this.parentBorders[i].id === parentBorder.id){
			return true;
		}
	}
	return false;
};

Panel.prototype.changeParentBorder = function(oldBorder, newBorder){
	for(var i = 0, iLen = this.parentBorders.length; i < iLen; i++){
		if(this.parentBorders[i].id === oldBorder.id){
			this.parentBorders[i] = newBorder;
			break;
		}
	}
};

Panel.prototype.addWidget = function(widget){
	if(widget === undefined || widget == null) {
		return(this);
	}

	widget.setParentObj(this);
	this.widgets.push(widget);

	if(widget.tabElClone === null){
		this.tabsEl.appendChild(widget.tabEl);
	}else{
		this.tabsEl.replaceChild(widget.tabEl, widget.tabElClone);
	}

	this.changeDisplayWidget(widget);

	this.tabListResize();
	return this;
};

/**
 * タブの数が増えたり、パネルのは幅が縮んだりして、タブが崩れて際に調整
 */
Panel.prototype.tabListResize = function(){

	var tabsWidth = this.tabsEl.offsetWidth;
	var panelWidth = this.el.offsetWidth;

	//まだレンダーされてない
	if(tabsWidth === 0 || panelWidth === 0){
		return false;
	}

	var childNodes = this.tabsEl.childNodes;
	var i;
	var iLen = childNodes.length;
	var width;

	//初期化
	this.tabListEl.classList.remove('panel-tabs-resize');
	for(i = 0; i < iLen; i++){
		childNodes[i].style.width = '';
	}
	this.addBtnEl.style.width = '';
	this.optionBtnEl.style.width = '';
	tabsWidth = this.tabsEl.offsetWidth;

	if(tabsWidth >= (panelWidth - 77)){
		this.tabListEl.classList.add('panel-tabs-resize');

		width = Math.floor((panelWidth - 77)/iLen) - 3;

		if(width < 37){
			width = Math.floor(panelWidth/(iLen+2)) - 3;
			this.addBtnEl.style.width = String(width) + 'px';
			this.optionBtnEl.style.width = String(width) + 'px';
		}

		for(i = 0; i < iLen; i++){
			childNodes[i].style.width = String(width) + 'px';
		}
	}
};

Panel.prototype.removeWidget = function(widget){

	//タブを削除
	for(var i = 0, iLen = this.widgets.length; i < iLen; i++){
		if(this.widgets[i].id === widget.id){
			this.tabsEl.removeChild(widget.tabEl);
			this.widgets.splice(i, 1);
			break;
		}
	}

	//末子のタブをactiveする
	if(this.widgets.length > 0){
		var lastTabEl = this.tabsEl.lastChild;
		for(i = 0, iLen = this.widgets.length; i < iLen; i++){
			if(lastTabEl === this.widgets[i].tabEl){
				this.widgets[i].active();
				break;
			}
		}

		this.tabListResize();
	}else{
		this.close();
	}
};

Panel.prototype.isWidget = function(widget){
	for(var i = 0, iLen = this.widgets.length; i < iLen; i++){
		if(this.widgets[i].id === widget.id){
			return true;
		}
	}
	return false;
};

Panel.prototype.getOffset = function(){
	return {
		width: parseInt(this.el.offsetWidth, 10),
		height: parseInt(this.el.offsetHeight, 10),
		left: parseInt(this.el.offsetLeft, 10),
		top: parseInt(this.el.offsetTop, 10)
	};
};

Panel.prototype.getDropPosition = function(){
	var className = this.dropAreaEl.className;
	var position = __utils__.getDropPosition(className);

	return position;
};

Panel.prototype.changeDisplayWidget = function(widget){
	for(var i = 0, iLen = this.widgets.length; i < iLen; i++){
		if(this.widgets[i].isActive === true){
			this.widgets[i].disabled();
		}
	}
	widget.active();
};

/**
 * 親境目が二つの場合、他の親境目を返す
 */
Panel.prototype.getOrderParentBorder = function(parentBorder){

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

Panel.prototype.close = function(argNotice){

	//現時点の親境目の数
	var parentCount = this.parentBorders.length;

	if(parentCount > 0){

		//削除対象境目
		var deleteBorder = null;

		//反対側（Panel or 複数のborder）
		var otherSide = [];

		//反対側の親境目
		var otherSideParentBorder = null;

		//親境目が二つの場合の削除しない境目
		var notDeleteBorder = null;

		//親境目が二つの場合
		if(parentCount > 1){

			//削除対象の親境目
			for(var i = 0; i < parentCount; i++){
				if(this.parentBorders[i].rightWing.isObject(this) === true){
					deleteBorder = this.parentBorders[i];
				}else{
					notDeleteBorder = this.parentBorders[i];
				}
			}

			//反対側
			otherSide = deleteBorder.leftWing.objects;

			//反対側の他の親境目
			otherSideParentBorder = otherSide[0].getOrderParentBorder(deleteBorder);

			//削除対象の親境目の親境目を削除
			deleteBorder.removeAllParentBorders();

			//サイズ調整
			notDeleteBorder.modifyOffsetForSameLevelClose(__constants__.border.types.vert.lw, deleteBorder.offset);

			//反対側の他の親境目があれば
			if(otherSideParentBorder !== null){
				otherSideParentBorder.modifyOffsetForSameLevelClose(__constants__.border.types.vert.rw, deleteBorder.offset);
			}

			//左側にセット
			notDeleteBorder.leftWing.objects = otherSide;

			//削除対処の親境目と削除してない親境目を入れ替え
			for(i = 0, iLen = otherSide.length; i < iLen ; i++){
				otherSide[i].changeParentBorder(deleteBorder, notDeleteBorder);
			}

		//親境目が一つの場合
		}else{

			//削除対象の親境目
			deleteBorder = this.parentBorders[0];

			//反対側の親境目を調整する時にどちらを変更するのか？
			var modifyPosition;

			//反対側
			if(deleteBorder.leftWing.isObject(this) === true){
				modifyPosition = __constants__.border.types.vert.lw;
				otherSide = deleteBorder.rightWing.sortObjects().objects;
			}else{
				modifyPosition = __constants__.border.types.vert.rw;
				otherSide = deleteBorder.leftWing.sortObjects().objects;
			}

			//反対側の他の親境目
			otherSideParentBorder = otherSide[0].getOrderParentBorder(deleteBorder);

			//反対側の他の親境目があれば
			if(otherSideParentBorder !== null){
				otherSideParentBorder.modifyOffsetForSameLevelClose(modifyPosition, deleteBorder.offset);

				//削除対象の親境目の親境目を削除
				deleteBorder.removeAllParentBorders();

				//反対側の親境目にotherSideParentBorderのみセット
				for(var j = 0, jLen = otherSide.length; j < jLen; j++){
					otherSide[j].setParentBorders([otherSideParentBorder]);
				}

			}else{

				//反対側の親境目をすべて削除
				for(var y = 0, yLen = otherSide.length; y < yLen; y++){
					otherSide[y].setParentBorders([]);
				}

				//反対側がPanelの場合
				if(otherSide[0] instanceof Panel){

					//削除対象の親境目の親境目に配置している削除対象親境目と反対側の細胞と切り替え
					deleteBorder.panelOnMyBehalfByParent(otherSide[0]);

				//反対側が境目（一つ以上）の場合で、削除対象に親境目があれば
				}else　if(deleteBorder.parentBorders.length > 0){
					deleteBorder.bordersOnMyBehalfByParent(otherSide);

					//削除対象境目の祖父（親境目の親境目）があれば、そこに追加するし、なければfalse
					deleteBorder.addByGrandparent(otherSide);
				}
			}
		}

		var isParent = false;

		//サイズ変更
		if(notDeleteBorder !== null){
			notDeleteBorder.resizeWing();
			isParent = true;
		}

		if(otherSideParentBorder !== null){
			otherSideParentBorder.resizeWing();
			isParent = true;
		}

		//親境目による変更がなかった場合
		if(isParent === false){
			if(otherSide[0] instanceof Panel){
				otherSide[0].resize(deleteBorder.offset);
			}else{
				for(var k = 0, kLen = otherSide.length; k < kLen; k++){
					otherSide[k].modifyOffsetForLengthSize(deleteBorder.offset).resizeLength();
				}
			}
		}

		//左右のobjectを削除
		deleteBorder.setWing([], []);

		//layoutから削除
		this.layout.removeStorage(deleteBorder, otherSide[0]);
		this.layoutEl.removeChild(this.el);

	}else{
		this.layout.removeStorage(this);
	}

	this.setParentBorders([]);

	this.layout.debug('close panel: ');

	if(argNotice === true) {
		this.layout.didClosePanel(this);
	}
};

Panel.prototype.toJSON = function(){

	return {
		id: this.id,
		instanceName: 'Panel',
		offset: this.getOffset(),
		parentBorders: function(){
				var ids = [];
				for(var i=0, iLen = this.parentBorders.length; i < iLen; i++){
					ids.push(this.parentBorders[i].id);
				}
				return ids;
			}.bind(this)(),
		widgets: function(){
				var widgets = [];
				for(var i = 0, iLen = this.widgets.length; i < iLen; i++){
					widgets.push(this.widgets[i].toJSON());
				}
				return widgets;
			}.bind(this)()
	};
};

//
//
//

Panel.prototype.addPanelWithWidget = function(dropPosition, widget) {
	var panel;
	var type = __utils__.getBorderTargetWithPosition(dropPosition);
	if(this.parentBorders.length > 0 && this.parentBorders[0].type === type){
		panel = this.sameLevelDivision(dropPosition, type, widget);
	}else{
		panel = this.childLevelDivision(dropPosition, type, widget);
	}

	return(panel);
};

//
// added by choi sunwoo at 2017.04.14 for #642
//

/**
 * 間接的にWidgetのcomponentRefの何かを呼び出すための反向関数
 * @param  {[type]} reflector	callback function
 * @return {[type]}
 */
Panel.prototype.didReflectCallForAllWidgetComponetRefs = function(reflector) {
	var nCount = this.widgets.length;
	for(var ii = 0; ii < nCount; ii++) {
		var widget = this.widgets[ii];
		if(widget && widget.didReflectCallForAllWidgetComponetRefs) {
			widget.didReflectCallForAllWidgetComponetRefs(reflector);
		}
	}
};
//
