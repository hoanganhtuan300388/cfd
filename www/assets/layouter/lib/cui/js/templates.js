/**
 * 
 */
var templates = {
	storage: {},
	// baseUrl: require.toUrl('thtml') + '/',
	baseUrl:'assets/layouter/lib/cui/templates/',
	init: function(){

		//ディフォールトでbodyに生成して置く
		var node = document.createElement('div');
		node.className = 'backdrop none';
		document.body.appendChild(node);
		this.storage.backdrop = node;
	},

	/**
	 * @parmas: name => thtmlでrootエレメントのclass名をkeyとする
	 */
	get: function(name, isClone){
		var template;
		if(this.storage[name] !== undefined){
			template = this.storage[name];
		}else{

			var url = this.baseUrl + name + '.thtml';
			var html;
			xhr('GET', url, false, function(result){
				html = result;
			});

			var node = document.createElement('div');
			node.innerHTML = html;

			template = node.querySelector('.'+name);
			this.storage[name] = template;
		}
		if(isClone === true){
			return template.cloneNode(true);
		}else{
			return template;
		}
	},

	has: function(name){
		if(this.storage[name] === undefined){
			return false;
		}else{
			return true;
		}
	}
};
templates.init();