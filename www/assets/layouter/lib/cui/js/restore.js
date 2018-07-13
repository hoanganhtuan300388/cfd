/**
 * 復元を行う
 */
var restore = {

	init: function(layout){

		this.data = JSON.parse(localStorage.getItem('gifi'));
		if(this.data === null || this.data.length < 1){
			return;
		}

		this.layout = layout;

		//生成したpanelやBorderを格納して置く
		this.panels = {};
		this.borders = {};

		//復元対象がPanel一つしかなければ
		if(this.data[0].instanceName === 'Panel'){
			this.layout.addStorage(this.panelRestore(this.data[0]));
		}else{
			for(var i = 0, iLen = this.data.length; i < iLen; i++){
				this.borderRestore(this.data[i]);
			}
		}

		//Windowサイズに合わせる
		this.layout.windowResize();
	},

	/**
	 * Borderの復元を行う
	 */
	borderRestore: function(info){

		//既に生成してあるものはそれを返す
		if(this.borders[info.id] instanceof Border){
			return this.borders[info.id];
		}

		//生成
		var border = new Border(this.layout, info.type, info.offset, info.position);

		//leftWing復元
		border.leftWing.setObjects(this.wingRestore(border, info.leftWing));

		//rightWing復元
		border.rightWing.setObjects(this.wingRestore(border, info.rightWing));

		//保存して置く
		this.borders[info.id] = border;

		this.layout.addStorage(border);

		return border;
	},

	/**
	 * パネルの復元を行う
	 */
	panelRestore: function(info){

		//既に生成してあるものはそれを返す
		if(this.panels[info.id] instanceof Panel){
			return this.panels[info.id];
		}

		var panel = this.layout.didCreatePanel();//new Panel(this.layout);
		var widget;
		var activeWidget;

		for(var i = 0, iLen = info.widgets.length; i < iLen; i++){
			widget = new Widget(info.widgets[i].name, this.layout);
			panel.addWidget(widget);
			widget.disabled();
			if(info.widgets[i].isActive === true){
				activeWidget = widget;
			}
		}
		activeWidget.active();
		panel.resize(info.offset).render();

		this.panels[info.id] = panel;
		return panel;
	},

	/**
	 * BorderWingの復元を行う
	 */
	wingRestore: function(border, wingInfo){

		var wings = [];
		var i, iLen;

		if(wingInfo.instanceName === 'Panel'){
			wings.push(this.panelRestore(wingInfo.data));
		}else{
			for(i = 0, iLen = wingInfo.data.length; i < iLen; i++){
				wings.push(this.borderRestore(wingInfo.data[i]));
			}
		}

		for(i = 0, iLen = wings.length; i < iLen; i++){
			wings[i].addParentBorder(border);
		}

		return wings;
	}
};
