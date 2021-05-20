function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

const fps = findGetParameter("FPS");
let FPS;
if(fps!=null){
    FPS =Math.round(fps);
}else{
    FPS = 15;
}

const worldSize = findGetParameter("WORLD");
let WORLD_SIZE;
if(worldSize!=null){
    WORLD_SIZE = Math.round(worldSize);
}else{
    WORLD_SIZE = 256;
}

const size = findGetParameter("SIZE");
let SIZE;
if(size!=null){
    SIZE = Math.round(size);
}else{
    SIZE = 16;
}

const DIRECTIONS = [[0, -SIZE],[-SIZE,0],[0,SIZE],[SIZE,0]];

const canvas = document.getElementById('canvas');
canvas.width = WORLD_SIZE;
canvas.height=WORLD_SIZE;
const ctx = canvas.getContext('2d');

let restart = false;

function square(position, color){
    ctx.fillStyle = color;
    ctx.fillRect(position[1], position[0], SIZE, SIZE);
}

function snakeContains(array, element){
    for(el of array){
        if(el[0]==element[0] && el[1]==element[1]) return true;
    }
    return false;
}

class Food {
    constructor(snakeBody) {
        this.color = "red";
        this.N = Math.floor(WORLD_SIZE/SIZE);
        this.initPosition(snakeBody);
    }

    initPosition(snakeBody){
        var positions = [];
        var position;
        for(var i=0; i<this.N; i++){
            for(var j=0; j<this.N; j++){
                position = [i*SIZE,j*SIZE];
                if(!snakeContains(snakeBody,position)){
                    positions.push(position);
                }
            }
        }
        this.position = positions[Math.floor(Math.random() * positions.length)];
    }

    update() {

    }

    draw() {
        square(this.position,this.color);
    }
}

class Snake {
    constructor(position, color="green") {
        this.body = [position];
        this.color = color;
        this.direction = 2;
        this.vy = DIRECTIONS[this.direction][0];
        this.vx = DIRECTIONS[this.direction][1];
        this.canMove = true;
        this.newDirection = null;
        this.shouldGrow=false;
    }

    newPos(){
        let y = this.body[0][0]+this.vy
        let x = this.body[0][1]+this.vx
        if(y < 0){
            y = WORLD_SIZE-SIZE
        }else if(y>= WORLD_SIZE){
            y = 0
        }

        if(x < 0){
            x = WORLD_SIZE-SIZE
        }
        else if( x>= WORLD_SIZE){
            x = 0
        }
        return [y,x]
    }


    update(){
        if(this.shouldGrow){
            this.shouldGrow=false;
            this.body = [this.newPos()].concat(this.body);
        }else{
            this.body = [this.newPos()].concat(this.body.slice(0,this.body.length-1));
        }
        if(!this.canMove && this.newDirection!=null){
            this.direction = this.newDirection;
            this.vy = DIRECTIONS[this.direction][0];
            this.vx = DIRECTIONS[this.direction][1];
            this.newDirection = null;
            this.canMove = true;
        }
    }

    draw() {
        this.body.forEach((pos)=>square(pos,this.color));
    }

    changeMovement(direction) {
        if(this.canMove){
            this.canMove = false;
            if(direction==0 && this.direction!=2){
                this.newDirection = 0;
            }else if(direction==1 && this.direction!=3){
                this.newDirection = 1;
            }else if(direction==2 && this.direction!=0) {
                this.newDirection = 2;
            }else if(direction==3 && this.direction!=1){
                this.newDirection = 3;
            }else{
                this.canMove = true;
            }
        }
    }

    grow() {
        this.shouldGrow = true;
    }

}

function checkCollision(object1,object2){
    return object1[0]==object2[0] && object1[1]==object2[1];
}

function clear() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
}

function update(objects) {
    objects.forEach((object)=>object.update());
}

function draw(objects) {
    clear();
    objects.forEach((object)=>object.draw());
}

function myAlert(text) {
    if(!restart){
        restart = true;
        confirm(text);
    }
    document.location.reload();
}

function checkCollisions(snake1,snake2,food){
        for(let i=0;i<snake1.body.length;i++){
            if(checkCollision(snake2.body[0],snake1.body[i]) || checkCollision(snake2.newPos(),snake1.body[i])){
                if(i==0 && snake2.body.length==snake1.body.length){
                    myAlert("tie");
                }else{
                    if(snake1.body.length>snake2.body.length){
                        myAlert("GREEN snake wins!");
                    }
                }
            }
            if(i>0){
                if(checkCollision(snake1.body[0],snake1.body[i])){
                    myAlert("BLUE snake wins!");
                }
            }
        }
        for(let i=0;i<snake2.body.length;i++){
            if(checkCollision(snake1.body[0],snake2.body[i]) || checkCollision(snake1.newPos(),snake2.body[i])){
                console.log(snake1.direction);
                console.log(snake2.direction);
                if(i==0 && snake2.body.length==snake1.body.length){
                    myAlert("tie");
                }else{
                    if(snake1.body.length<snake2.body.length){
                        myAlert("BLUE snake wins!");
                    }
                }
            }
            if(i>0){
                if(checkCollision(snake2.body[0],snake2.body[i])){
                    myAlert("GREEN snake wins!");
                }
            }
        }
        if(checkCollision(snake1.body[0],food.position)){
            snake1.grow();
            food.initPosition(snake1.body.concat(snake2.body));
        }
        if(checkCollision(snake2.body[0],food.position)){
            snake2.grow();
            food.initPosition(snake1.body.concat(snake2.body));
        }

}

function main() {

    const snake1 = new Snake([SIZE,SIZE]);
    const snake2 = new Snake([WORLD_SIZE-2*SIZE,SIZE],"blue");
    const food = new Food(snake1.body.concat(snake2.body));
    const objects = [food,snake1,snake2];

    window.addEventListener("keydown", function(e){
        if ( e.key== "a" ) {
            snake1.changeMovement(0);
        }
        else if ( e.key== "w" ) {
            snake1.changeMovement(1);
        }
        else if ( e.key == "d" ) {
            snake1.changeMovement(2);
        }
        else if ( e.key== "s" ) {
            snake1.changeMovement(3);
        }
        else if ( e.key== "j" ) {
            snake2.changeMovement(0);
        } else if ( e.key== "i" ) {
            snake2.changeMovement(1);
        }
        else if ( e.key == "l" ) {
            snake2.changeMovement(2);
        }
        else if ( e.key== "k" ) {
            snake2.changeMovement(3);
        }
    }, true);

    let interval;
    interval=setInterval(function(){
        checkCollisions(snake1,snake2,food,interval);
        update(objects);
        draw(objects);
    },1000/FPS);

}

main();
