var stage;

/** MAGIC CONSTANTS **/
var round = 5; // rounded rectangle's corner
var Width = 400;
var Height = 400;

var colorArray = ["red", "green", "blue", "black","cyan","magenta","silver"];
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
	case 1: this.container.addChild( getLiteral( getColor( Math.abs(tmpArr[0]) - 1 ), tmpArr[0], radius*3/4, 0, radius / 4 ) );
    case 0: break;
	case 2:
	  for( var i = 0; i < 2; i++ ){
		  this.container.addChild( getLiteral( getColor( Math.abs(tmpArr[i])-1 ), tmpArr[i], radius/2, 0, radius/2 - i*radius ) );
	  }
	  break;
	case 3:
	case 4:
	case 5:
    case 6:
      var spn = Math.sin( Math.PI / this.size );
      var r = radius * spn / (1+spn);
      for( var i = 0; i < this.size; i++ ){
		  this.container.addChild( getLiteral( getColor(Math.abs(tmpArr[i])-1),tmpArr[i],r,(radius-r)*Math.sin(i*2*Math.PI/this.size),(radius-r)*Math.cos(i*2*Math.PI/this.size) ) );
	  }	  
	  break;
	
  }
}
Clause.prototype.addToStage = function(){
	stage.addChild( this.container );
}
Clause.prototype.setPosition = function( x, y ){ this.container.x = x; this.container.y = y; }
Clause.prototype.setRotation = function( theta ){ this.container.rotation = theta; }

function createBorders(){
	var shape = new createjs.Shape();
	shape.graphics.beginStroke("black").drawRoundRect(0,0,Width,Height,round);
	stage.addChild( shape );
}

function init(){
	stage = new createjs.Stage("gameCanvas");
	createBorders();
	
    var c = new Clause( [0,1,0], 25 );
	c.setPosition( 100,100 );
	c.addToStage();
	
	c = new Clause([1,0,-1], 25);
	c.setPosition( 150,100 );
	c.setRotation(30);
	c.addToStage();
	
    var c = new Clause( [1,1,-1], 25 );
	c.setPosition( 200,100 );
	c.addToStage();

    var c = new Clause( [1,-1,-1,1], 25 );
	c.setPosition( 100,150 );
	c.addToStage();

    var c = new Clause( [-1,1,-1,-1,1], 25 );
	c.setPosition( 150,150 );
	c.addToStage();

    var c = new Clause( [1,1,-1,1,-1,-1], 25 );
	c.setPosition( 200,150 );
	c.addToStage();
	
	stage.update();
}