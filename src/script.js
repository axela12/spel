//canvas, context, spelplanens bredd och höjd, upplösning per tile, ui höjd
//längd på orm och ormens alla positioner
canvas=document.querySelector('canvas')
ctx=canvas.getContext('2d')
var width=15
var height=15
var res=32
var uiHeight=50
canvas.width=width*res
canvas.height=uiHeight+height*res

var then,now,fpsint=260

var length=5
var arr=[]
var pos={x:0,y:7}
var dir={x:1,y:0}

//sprite klass med img sprite size, frames och interval
class Sprite{
    static file = {
        'earth':'img/earth128.png',
        'coin':'img/coin44.png',
    }

    constructor(src,spriteWidth, spriteHeight,  minFrame, maxFrame, fpsint){
        this.image=document.getElementById('coin')//document.createElement('img')
        //this.image.src=Sprite.file[src]
        this.spriteWidth=spriteWidth
        this.spriteHeight=spriteHeight
        this.x=0
        this.y=0
        this.minFrame=minFrame
        this.maxFrame=maxFrame
        this.frame=minFrame
        this.frameX=0
        this.frameY=0
        this.then=0
        this.fpsint=fpsint
    }
    //rita sprite argument genom Sprite.draw
    static draw(sprite){
        sprite.frame=15
        ctx.drawImage(
            sprite.image, sprite.frameX*sprite.spriteWidth, sprite.frameY*sprite.spriteHeight, sprite.spriteWidth, sprite.spriteHeight, sprite.x*res,sprite.y*res+uiHeight,32,32
        )
    }
    //updatera spritens frame så att den animerar
    update(){
        this.frame = this.frame < this.maxFrame ? this.frame + 1 : this.minFrame
        this.frameX = this.frame % (this.image.width/this.spriteWidth)
        this.frameY = Math.floor(this.frame/(this.image.width/this.spriteWidth))
    }
}

var s=[]

s.push(new Sprite('earth',128,128, 0, 63, 1))
s[0].x=1;s[0].y=3
s.push(new Sprite('coin',44,44, 0, 11, 500))
s[1].x=1;s[1].y=1
s.push(new Sprite('coin',44,44, 15, 17, 500))
s[2].x=2;s[2].y=1

//ritar 60fps på spelplanen
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = 'white'
    ctx.fillRect(0,0,canvas.width,canvas.height)

    for(let i = 0; i < width*height; i++){
        if(i % 2 == 0) ctx.fillStyle = 'green'
        else ctx.fillStyle = 'darkgreen'
        drawBoard(i%width*res,Math.floor(i/width)*res,res,res)
    }

    for(let i = 0; i < s.length; i++){
        Sprite.draw(s[i])
    }

    ctx.fillStyle = 'black'
    for(let i = 0; i < arr.length; i++){
        drawBoard(arr[i].x*res,arr[i].y*res,res,res)
    }
}

//ritar en tile på spelplanen
function drawBoard(x,y,width,height){
    ctx.fillRect(x,y+uiHeight,width,height)
}

//updateras efter fpsint med ormen som rör sig
function move(){
    pos={x:pos.x+dir.x,y:pos.y+dir.y}
    arr.push(pos)
    if(arr.length>length) arr.shift()
}

//knapptryck
function keydown(key){
    if(key=='ArrowRight' && arr[arr.length-2].x != pos.x+1 && arr[arr.length-2] != pos.y+0){
        dir={x:1,y:0}
    }
    if(key=='ArrowUp' && arr[arr.length-2].x != pos.x+0 && arr[arr.length-2] != pos.y-1){
        dir={x:0,y:-1}
    }
    if(key=='ArrowLeft' && arr[arr.length-2].x != pos.x-1 && arr[arr.length-2] != pos.y+0){
        dir={x:-1,y:0}
    }
    if(key=='ArrowDown' && arr[arr.length-2].x != pos.x+0 && arr[arr.length-2] != pos.y+1){
        dir={x:0,y:1}
    }
}

//när alla filer och dokument har laddat
window.addEventListener('load', function(){
    document.addEventListener('keydown', function(e){keydown(e.key)})
    then=Date.now()
    for(let i = 0; i < s.length; i++){
        s[i].then=then
    }
    
    canvas.style.display='flex'
    update()
})

//kör move() vid fpsint millisekunder
function update(){
    requestAnimationFrame(update)
    now=Date.now()
    draw()

    //om skillnad är mer än interval fpsint
    if((now-then)>fpsint){
        //funktionen körs 60fps så now-then får inte vara en faktor av 60fps
        then=now-((now-then)%fpsint)

        move()
    }

    for(let i = 0; i < s.length; i++){
        if((now-s[i].then)>s[i].fpsint){
            s[i].then=now-((now-s[i].then)%s[i].fpsint)

            //s[i].update()
        }
    }
}