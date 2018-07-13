/**
 * 
 * ミニチャート
 * 
 * 
 *  sample code.
    crt.AddData( "inout",   date, price );
    crt.AddData( "balance", date, price );
    crt.AddData( "profit",  date, profit );

		crt.attr( "balance", { "line-width": 5, "line-color": '#f0f0f0', "fill-color": 'rgba(255,255,255,0.2)' });
		crt.attr( "profit",  { "line-width": 3, "line-color": '#d6a45b', "draw-point":true, syncY:false });
		crt.attr( "inout",   { "line-width": 1, "line-color": 'rgba(255,0,0,0.2)', "line-style": "right-angle", "fill-color": 'rgba(255,0,0,0.1)' });

		crt.run( obj.option );

 */
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { PanelViewBase, PanelManageService, ResourceService, CommonConst, Tooltips,
         IViewState, ViewBase } from "../../core/common";

interface chartData { x:number, y:number};

//-----------------------------------------------------------------------------
// COMPONENT : PriceWatchUnitComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'mini-chart',
  templateUrl: './mini-chart.component.html',
  styleUrls: ['./mini-chart.component.css']
})
export class MiniChartComponent {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
	// private id 	= id;
	// private parent	= par;
	// private canvas  = null;
	@ViewChild('canvas')
	private canvasRef:ElementRef;
	private canvas:HTMLCanvasElement;
	
	private data 	  = {};
	private yValPx  = 0;
	private xValPx  = 0;		
	private min 	  = 999999999999;
	private max 	  = -999999999999;
	private bRun	  = false;
	private maxCount= -1;
	private defOpt 	= { 
    "line-width": 1,  
    "line-color": '#00e6e6', 
    "syncY":true, 
    "draw-point":false, 
    "axis_y_left":"", 
    "axis_y_right":"",    
    "calibrate-max":false, 
		"calibrate-min":false, 
    "x-height":50, "x-font":"16px 'Meiryo'", "x-color":"#f0f0f0", "x-grid-show":false, "x-grid-color":'rgba(255,255,255,0.08)', "x-grid-width":1, "x-show":false,
    "y-width" :80, "y-font":"16px 'Meiryo'", "y-color":"#f0f0f0", "y-grid-show":false, "y-grid-color":'rgba(255,255,255,0.08)', "y-grid-width":1, "y-show-left":false, 
    "y-show-right":false, 
    "inbox-width" :1, 
    "inbox-color": "#d0d0d0", 
		"inbox-show":false,
		"fill-color": ["#0088cc", "rgba(0, 77, 153, 0.6)"]
		// "fill-color": "#164A81"
  };
  
  private crtOpt;
  private dispOfs	= 1;
	private org_x		= this.dispOfs;
	private pixelRatio = 1;

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(private panelMng:PanelManageService,
              private resource:ResourceService,
              public element: ElementRef) {

  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  ngAfterViewInit(){
		this.canvas = this.canvasRef.nativeElement;

		this.scaleFactor();
  }

  ngOnDestroy(){
    this.clear();
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public clear(){
    delete this.data;
    this.data={};

    this.yValPx = 0;
    this.xValPx = 0;		
    this.min 	  = 999999999999;
    this.max 	  = -999999999999;
    this.bRun	  = false;
    // this.maxCount 	= -1;    
  }

  public setMaxCount( cnt ){
		this.maxCount = cnt;
	}
	
	private scaleFactor(){
		var context = this.canvas.getContext('2d') as any;
		
		// ctx.scale(0.5,0.5);
		var devicePixelRatio = window.devicePixelRatio || 1;
		var backingStoreRatio = context.webkitBackingStorePixelRatio ||
								context.mozBackingStorePixelRatio    ||
								context.msBackingStorePixelRatio     ||
								context.oBackingStorePixelRatio      ||
								context.backingStorePixelRatio       || 1;

		this.pixelRatio = devicePixelRatio / backingStoreRatio;

		context.scale(this.pixelRatio, this.pixelRatio);

		// scale変更時のcanvas size補正
		var width = this.canvas.clientWidth;
		var height = this.canvas.clientHeight;

		this.canvas.width  			= this.pixelRatio * width;
		this.canvas.height 			= this.pixelRatio * height;

		this.canvas.style.left 	= '0px';
		this.canvas.style.top 	= '0px';
		this.canvas.style.width 	= width + 'px';
		this.canvas.style.height 	= height + 'px';			
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	public AddData( index, xVal, yVal ){
		var indi = this.data[index];
		if( indi == undefined )
		{
			this.data[index] = {};
			indi = this.data[index]
			indi["value"] = [];
		}

    var value:chartData = {x:xVal, y:yVal};

		indi["value"].push( value );

		if( this.maxCount > 0 && indi.value.length > this.maxCount )
		{
			indi.value.splice( 0, indi.value.length - this.maxCount );
		}

		// update chart data.
		if( this.bRun )
		{
			this.run( );
		}
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	public attr( index, opt ){
		this[index] = opt;
  }  

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	public getAttr( index, key ){
		if( this[index] != undefined )
		{
			if( this[index][key] != undefined )
				return this[index][key];
		}		

		return this.defOpt[key];
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	public run( opt = null )
	{
		if( opt )
			this.crtOpt = opt

		this.bRun = true;

		this.calc();

		this.draw();
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	public chartWidth()
	{
		return this.canvas.width - this.dispOfs;
	}

	public chartHeight()
	{
		return this.canvas.height - this.dispOfs;
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	private inboxWidth(){
		var	 wdt = this.chartWidth() - this.dispOfs;

		if( this.getAttr( "crtOpt", "y-show-left") )
		{
			wdt -= this.getAttr( "crtOpt", "y-width");
		}

		if( this.getAttr( "crtOpt", "y-show-right") )
		{
			wdt -= this.getAttr( "crtOpt", "y-width");
		}

		return wdt;
	}

	private inboxHeight(){
		var hgt = this.chartHeight() - this.dispOfs;

		if( this.getAttr( "crtOpt", "x-show") )
		{
			hgt -= this.getAttr( "crtOpt", "x-height");
		}

		return hgt;
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	private calc(){
		var len = 0;
		var yL = this.getAttr( "crtOpt", "axis-y-left"),
			yR = this.getAttr( "crtOpt", "axis-y-right");

		this.min 	= 999999999999;
		this.max 	= -999999999999;

		// calc min & max
		for( var i in this.data )
		{
			this.calcMinMax( i, this.data[i] );

			// display y axis info.
			if( i == yL || i == yR )
				this.calcDispInfo( this.data[i] );

			if( this.getAttr( i, "syncY") )
			{
				this.min = Math.min( this.min, this.data[i].min );
				this.max = Math.max( this.max, this.data[i].max );
			}			

			len = Math.max( len , this.data[i].value.length-1 );

			this.data[i].yValPx = this.inboxHeight() / (this.data[i].max - this.data[i].min);
			this.data[i].xValPx = this.inboxWidth()  / len;
		}

		// ラインを真ん中に表示
		if(this.max == this.min){
			this.max += this.max;
			this.min -= this.min;
		}

		// value per pixel
		this.yValPx	 	= this.inboxHeight() / (this.max - this.min);
		this.xValPx 	= this.inboxWidth()  / len;
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	private calcMinMax( index, data ){
		data.min = 999999999999;
		data.max = -999999999999;

		var min = this.getAttr( index, "min");
		var max = this.getAttr( index, "max");

		if( min == undefined || max == undefined )
		{
			for( var i in data.value )
			{
				if( data.value[i].y != null )
				{
					data.min = Math.min( data.min, data.value[i].y );
					data.max = Math.max( data.max, data.value[i].y );
				}
			}
		}

		// calibrate price min & max.
		if( min != undefined )
			data.min = min;
		else if( this.getAttr( "crtOpt", "calibrate-min" ) )
			data.min = this.priceCalibrate( data.min, false );

		if( max != undefined )
			data.max = max;
		else if( this.getAttr( "crtOpt", "calibrate-max" ) )
			data.max = this.priceCalibrate( data.max, true );
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	private priceCalibrate( val, bUp ){
//		_log(9)
		var prc = Math.ceil(val / 5),
			len = Math.ceil((prc + '').length / 2),
			pow = Math.pow(10,len);

		if( bUp )
			prc = Math.ceil(prc / pow);
		else
			prc = Math.floor(prc / pow);

		prc *= pow * 5;

		return prc;
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	private calcDispInfo( data ){
		var pxl  = this.chartHeight() / ( data.max - data.min);
		var disp = 0, pow = 0;

		disp = 100/pxl;		      // span 100Pixel
		disp = disp/5;				  // adjust value to 0 or 5

    pow  = Math.pow( 10, disp.toString().length-1 );
		disp *=  5;

		data.dispUnit = disp;
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	private invalid_x_width( x ){
		if( (x-this.org_x) % 100 < this.xValPx )
			return true;

		return false;
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	private draw(){
		var ctx = this.canvas.getContext('2d');
		var	wdt = this.inboxWidth(),
				hgt = this.inboxHeight();
		var datL = this.data[this.getAttr( "crtOpt", "axis-y-left")];
		var datR = this.data[this.getAttr( "crtOpt", "axis-y-right")];

		ctx.translate  (0.5, 0.5);

		ctx.clearRect( -1, -1, this.canvas.width, this.canvas.height );

		// draw y axis
		if( this.getAttr( "crtOpt", "y-show-left") && datL )
		{
			this.org_x = this.dispOfs + this.getAttr( "crtOpt", "y-width");

			this.draw_y( ctx, datL.max, datL.min, datL.dispUnit, wdt, hgt, true );
		}

		// draw y axis
		if( this.getAttr( "crtOpt", "y-show-right") && datR )
		{
			this.draw_y( ctx, datR.max, datR.min, datR.dispUnit, wdt, hgt, false );
		}

		// draw x axis
		if( this.getAttr( "crtOpt", "x-show") )
			this.draw_x( ctx, wdt, hgt );

		if( this.getAttr( "crtOpt", "y-grid-show") && datR )
		{
			this.draw_grid_y( ctx, datR.max, datR.min, datR.dispUnit, wdt, hgt );
		}

		// draw x axis
		if( this.getAttr( "crtOpt", "x-grid-show") )
			this.draw_grid_x( ctx, wdt, hgt );

		// draw inner chart box
		if( this.getAttr( "crtOpt", "inbox-show") )
			this.drawInbox( ctx, wdt, hgt );

		// draw lines
		for( var i in this.data )
		{
			this.drawLine( ctx, i, this.data[i], wdt, hgt );
		}

		ctx.translate  (-0.5, -0.5);
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	private drawInbox( ctx, wdt, hgt ){
		ctx.beginPath();

		ctx.rect( this.org_x, this.dispOfs, wdt, hgt );

		ctx.lineWidth   = this.getAttr( "crtOpt", "inbox-width");
		ctx.strokeStyle = this.getAttr( "crtOpt", "inbox-color");

		ctx.stroke();
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	private draw_grid_x( ctx, wdt, hgt ){
		var y 	 = hgt + this.dispOfs,
				x 	 = this.org_x;

		ctx.beginPath();

		for( var idx in this.data )	{
			for( var itm in this.data[idx].value ){
				if( this.invalid_x_width( x )){
					ctx.moveTo( x, this.dispOfs );
					ctx.lineTo( x, y );
				}

				x += this.xValPx;
			}

			ctx.lineWidth 	= this.getAttr( "crtOpt", "x-grid-width");
			ctx.strokeStyle = this.getAttr( "crtOpt", "x-grid-color");

			ctx.stroke();

			return;
		}
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	private draw_grid_y( ctx, max, min, unit, wdt, hgt ){
		var yValPx 	= hgt / (max - min);
		var x 	 	= wdt + this.org_x;

		ctx.beginPath();

		for( var val = max; val > min; val -= unit )
		{
			var y = (val-min) * yValPx;

			y = hgt - y;
			y += this.dispOfs;

			ctx.moveTo( this.org_x, y );
			ctx.lineTo( x, y );
		}

		ctx.lineWidth 	= this.getAttr( "crtOpt", "y-grid-width");
		ctx.strokeStyle = this.getAttr( "crtOpt", "y-grid-color");
		ctx.stroke();
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	private draw_x( ctx, wdt, hgt ){
		var data = this.data[this.getAttr( "crtOpt", "axis-y-right")],
			y 	 = hgt + this.dispOfs + 20,
			x 	 = this.org_x;

		ctx.font 	  = this.getAttr( "crtOpt", "x-font");
		ctx.fillStyle = this.getAttr( "crtOpt", "x-color");"#f0f0f0";

		ctx.textAlign="start";

		for( var itm in data.value )
		{
			var dat = data.value[itm];
			
			if( this.invalid_x_width( x ))
				ctx.fillText( dat.x, x, y );

			x += this.xValPx;
		}

		ctx.stroke();
		return;
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	private draw_y( ctx, max, min, unit, wdt, hgt, bleft ){
		var yValPx = hgt / (max - min);
		var maxTxt = this.priceToString(max),
			maxsiz = 0,
			orgwdt = wdt;
		var x;

		ctx.font 	  = this.getAttr( "crtOpt", "y-font");
		ctx.fillStyle = this.getAttr( "crtOpt", "y-color");

		wdt += this.org_x + 10;

		maxsiz = ctx.measureText(maxTxt).width

		ctx.textAlign="end";
		ctx.textBaseline = 'middle';

		if( bleft )
			x = this.getAttr( "crtOpt", "y-width");
		else
			x = wdt+maxsiz;

		for( var val = max; val > min; val -= unit )
		{
			var y 	= (val-min) * yValPx;
			var txt = this.priceToString(val);

			y  = hgt - y;
			y += this.dispOfs;

			ctx.fillText( txt, x, y, maxsiz );
		}
	}

	//-------------------------------------------------------------------------
	// 
	//-------------------------------------------------------------------------
	private drawLine( ctx, index, data, wdt, hgt ){
    var x = 0,	
        y = 0,
        preY	= 0;
		var brun 	= false;
		var syncY 	= this.getAttr( index, "syncY" );
		var xValPx  = (syncY) ? this.xValPx : data.xValPx,
        yValPx  = (syncY) ? this.yValPx : data.yValPx,
        min 	= (syncY) ? this.min 	: data.min;
		var lineWdt = this.getAttr( index, "line-width");
		var rgtAng  = this.getAttr( index, "line-style") == "right-angle";

 		ctx.beginPath();

		for( var i=0; i < data.value.length; i++ )
		{
			if( data.value[i].y != null )
			{
				x = i * xValPx;
				y = (data.value[i].y - min) * yValPx;
				y = hgt - y;

				x += this.org_x;
				y += this.dispOfs;

				x = Math.round(x);
				y = Math.round(y);

				if( !brun )
				{
					ctx.moveTo( x, y );
					brun = true;
				}
				else
				{
					if( rgtAng )
						ctx.lineTo( x, preY );	

					ctx.lineTo( x, y );
				}

				if( this.getAttr(index, "draw-point") )
				{
					ctx.arc(x, y, lineWdt, 0, Math.PI*2, false);
					ctx.moveTo( x, y );
				}

				preY = y;
			}
		}

		ctx.lineWidth   = lineWdt
		ctx.strokeStyle = this.getAttr( index, "line-color");
		ctx.lineJoin 	= "round";
		ctx.stroke();

		// fill path
		var fill = this.getAttr( index, "fill-color");

		if( fill != undefined )
		{
			var style = fill;

			y = hgt + this.dispOfs;

			ctx.lineTo( x, y );
			ctx.lineTo( this.org_x, y );
			ctx.closePath();

			// gradation
			if(Array.isArray(fill)){
				var gy = (data.max - min) * yValPx;
				var grd  = ctx.createLinearGradient(0,hgt,0,0);
				for(var i=0; i < fill.length; i++){
					grd.addColorStop(i, fill[i]);	
				}

				style = grd;
			}
		
			ctx.fillStyle	= style;
			ctx.fill();
		}
	}

  private priceToString(val){
    return val;
  }
}
