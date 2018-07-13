var Modal = function(parentEl, titleText, contentObj){

	var el = templates.get('cdg-modal', true);
	this.el = el;
	this.parentEl = parentEl;
	this.titleEl = el.querySelector('.cdg-modal-title');
	this.closeEl = el.querySelector('.cdg-modal-close');
	this.bodyEl = el.querySelector('.cdg-modal-body');
	this.backdropEl = templates.get('backdrop', false);

	this.titleEl.textContent = titleText;

	//モーダルにコンテンツをセットする
	contentObj.toRender(this.bodyEl);
	contentObj.close = this.close.bind(this);
	
	this.init();
};

Modal.prototype.init = function(){
	this.event();
};

Modal.prototype.render = function(){
	this.backdropEl.classList.remove('none');
	this.parentEl.appendChild(this.el);
};

Modal.prototype.event = function(){
	this.closeEl.addEventListener("click", this.close.bind(this), false);
};

Modal.prototype.close = function(e){
	e.preventDefault();
	this.parentEl.removeChild(this.el);
	this.backdropEl.classList.add('none');
	return false;
};