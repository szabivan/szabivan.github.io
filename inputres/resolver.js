var stage;

/** MAGIC CONSTANTS **/
var round = 5; // rounded rectangle's corner
var Width = 400;
var Height = 400;

var colorArray = ["red", "green", "blue", "black"];
function getColor( i ){
	return colorArray[i];
}

function getLiteral( color, polarity, radius, x, y ){
  var shape = new createjs.Shape();
  shape.graphics.beginFill( color ).drawCircle( 0, 0, radius ).beginFill( "white" ).drawRoundRect( -radius*3/4, -radius*1/4, radius*3/2, radius*1/2, 3 );
  if( polarity > 0 ){
    shape.graphics.drawRoundRect(-radius*1/4,-radius*3/4, radius*1/2,radius*3/2,3);
  }
  shape.x = x;
  shape.y = y;
  return shape;
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
  switch( this.size ){
	case 1: this.container.addChild( getLiteral( getColor( Math.abs(tmpArr[0]) - 1 ), tmpArr[0], radius*1/2, radius*3/4, 0, radius / 4 ) );
    case 0: break;
	case 2:
	  for( var i = 0; i < 2; i++ ){
		  this.container.addChild( getLiteral( getColor( Math.abs(tmpArr[i])-1 ), tmpArr[i], radius/3, radius/2, 0, radius/2 - i*radius ) );
	  }
	  break;
	
  }
}
Clause.prototype.addToStage = function(){
	stage.addChild( this.container );
}
Clause.prototype.setPosition = function( x, y ){ this.container.x = x; this.container.y = y; }

function createBorders(){
	var shape = new createjs.Shape();
	shape.graphics.beginStroke("black").drawRoundRect(0,0,Width,Height,round);
	stage.addChild( shape );
}

function init(){
	stage = new createjs.Stage("gameCanvas");
	createBorders();
	
    var c = new Clause( [0,1,0], 30 );
	c.setPosition( 200,200 );
	c.addToStage();
	
	stage.update();
}