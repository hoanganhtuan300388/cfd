var WidgetList = function(callback, layout){
	this.layout = layout;
	this.el = templates.get('widget-list', true);
	this.btnEl = this.el.querySelector('.add-widget');
	this.callback  = callback;
};

WidgetList.prototype.toRender = function(bodyEl){
	this.event();
	bodyEl.appendChild(this.el);
};

WidgetList.prototype.event = function(){
	this.btnEl.addEventListener('click', this.add.bind(this), true);
};

WidgetList.prototype.add = function(e){
	e.preventDefault();

	//選択したwidgetを生成
	var widget = new Widget('FXQB', this.layout);

	this.callback(widget);
	this.close(e);
	return false;
};