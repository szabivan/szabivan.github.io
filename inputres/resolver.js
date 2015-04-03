var stage;

/** MAGIC CONSTANTS **/
var round = 5; // rounded rectangle's corner
var Width = 400;
var Height = 400;

var colorArray = ["red", "green", "blue", "black"];
function getColor( i ){
	return colorArray[i];
}

function Literal( color, polarity, innerRadius, outerRadius, x, y ){
  this.color = color;
  this.shape = new createjs.Shape();
  if( polarity > 0 ){
    this.shape.graphics.beginFill( color ).drawCircle( 0, 0, outerRadius ).beginFill( "white" ).drawCircle( 0, 0, innerRadius );
  }else{
    this.shape.graphics.beginFill( color ).drawCircle( 0, 0, innerRadius + 1 );
  }
  this.shape.x = x;
  this.shape.y = y;
}

function Clause( arr, radius ){
  this.size = 0;
  this.container = new createjs.Container();
  this.shape = new createjs.Shape();
  this.shape.graphics.beginStroke("black").drawCircle( 0, 0, radius );
  this.container.addChild( this.shape );
  this.arr = arr.slice();
  var tmpArr = [];
  for( var i = 0; i < arr.length; i++ ) if( arr[i] ) { this.size++; tmpArr.push( (i+1)*arr[i] ); }
  if( this.size == 1 ){
    this.container.addChild( new Literal( getColor( Math.abs(tmpArr[0]) - 1 ), tmpArr[0], radius*1/2, radius*3/4, 0, radius / 4 ) );
  }else if( this.size == 0 ){
  }else{
	  //TODO: nagyobbakat is kezelni
  }  
}
Clause.prototype.addToStage = function(){
	stage.addChild( this.container );
}

function createBorders(){
	var shape = new createjs.Shape();
	shape.graphics.beginStroke("black").drawRoundRect(0,0,Width,Height,round);
	stage.addChild( shape );
}

function init(){
	stage = new createjs.Stage("gameCanvas");
	createBorders();
	
    var c = new Clause( [0,1,0], 30 );
	c.addToStage();
	
	stage.update();
}