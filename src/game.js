canvas=document.querySelector('canvas')
ctx=canvas.getContext('2d')
var width=15
var height=15
var res=20
canvas.width=width*res
canvas.height=height*res

var then,now,elapsed
var fpsint=200

var length=5
var arr=[]
var pos={x:1,y:7}
var dir={x:1,y:0}

function run(){
    move()
    draw()
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    for(let i = 0; i < width*height; i++){
        if(i % 2 == 0) ctx.fillStyle = 'green'
        else ctx.fillStyle = 'gray'
        ctx.fillRect(i%width*res,Math.floor(i/width)*res,res,res)
    }

    ctx.fillStyle = 'black'
    for(let i = 0; i < arr.length; i++){
        ctx.fillRect(arr[i].x*res,arr[i].y*res,res,res)
    }
}

function move(){
    arr.push(pos)
    if(arr.length>length) arr.shift()

    pos={x:pos.x+dir.x,y:pos.y+dir.y}
}

//knapptryck
function keydown(key){
    if(key=='ArrowRight' && arr[arr.length-1].x!=pos.x+1 && arr[arr.length-1]!=pos.y+0){
        dir={x:1,y:0}
    }
    if(key=='ArrowUp' && arr[arr.length-1].x!=pos.x+0 && arr[arr.length-1]!=pos.y-1){
        dir={x:0,y:-1}
    }
    if(key=='ArrowLeft' && arr[arr.length-1].x!=pos.x-1 && arr[arr.length-1]!=pos.y+0){
        dir={x:-1,y:0}
    }
    if(key=='ArrowDown' && arr[arr.length-1].x!=pos.x+0 && arr[arr.length-1]!=pos.y+1){
        dir={x:0,y:1}
    }
}

//när alla filer och dokument har laddat
window.addEventListener('load', function(){
    document.addEventListener('keydown', function(e){keydown(e.key)})
    then=Date.now()
    update()
});

//kör run() vid fpsint millisekunder
function update(){
    requestAnimationFrame(update)

    now=Date.now()
    elapsed=now-then

    //om skillnad är mer än interval fpsint
    if(elapsed>fpsint){
        //funktionen körs 60fps så elapsed får inte vara en faktor av 60fps
        then=now-(elapsed%fpsint)

        run()
    }
}