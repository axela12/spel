//canvas, context, spelplanens bredd och höjd, upplösning per tile, ui höjd
//längd på orm och arr är ormens alla positioner
//fpsArr är olika interval för move()
var canvas=document.querySelector('canvas')
var ctx=canvas.getContext('2d')
var width=15
var height=15
var res=32
var uiHeight=50
canvas.width=width*res
canvas.height=uiHeight+height*res

var then,now,fpsint
const fpsArr = [260,240,220,200,180,160,140,120]
var fpsIndex = 0

var length=100
var snakeArr=[]
var pos={x:0,y:7}
var dir={x:1,y:0}

//sprite klass med img sprite size, frames och interval
class Sprite{
    //frame blir minframe-1 för att updatera den vid start
    constructor(name,spriteWidth, spriteHeight, minFrame, maxFrame, fpsint){
        this.name=name
        this.image=document.getElementById(name)
        this.spriteWidth=spriteWidth
        this.spriteHeight=spriteHeight
        this.x=0
        this.y=0
        this.scale=32
        this.minFrame=minFrame
        this.maxFrame=maxFrame
        this.frame=minFrame-1
        this.frameX=0
        this.frameY=0
        this.then=0
        this.fpsint=fpsint
    }

    //rita sprite argument genom Sprite.draw
    static draw(sprite){
        ctx.drawImage(
            sprite.image, sprite.frameX*sprite.spriteWidth, sprite.frameY*sprite.spriteHeight, sprite.spriteWidth, sprite.spriteHeight, sprite.x*res,sprite.y*res+uiHeight,sprite.scale,sprite.scale
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
s[0].x=0;s[0].y=1
s.push(new Sprite('coin',44,44, 0, 11, 150))
s[1].x=1;s[1].y=1
s.push(new Sprite('coin',44,44, 14, 25, 150))
s[2].x=2;s[2].y=1
s.push(new Sprite('apple',84,84, 0, 9, 150))
s[3].x=3;s[3].y=1
s.push(new Sprite('bomb',256,256, 0, 0, 0))
s[4].x=4;s[4].y=1

function game(){
    fpsint = fpsArr[fpsIndex]
}

end=false
function gameover(){
    s.push(new Sprite('explode',100,100, 0, 49, 50))
    var explode = s.find(sprite => sprite.name === 'explode')
    explode.x=2;
    explode.y=0;
    explode.scale=400
    end=true
}

//updateras efter fpsint
function move(){
    if(0 > pos.x+dir.x || width <= pos.x+dir.x || 0 > pos.y+dir.y || height <= pos.y+dir.y){
        gameover()
        return
    }

    for(let i = 0; i < snakeArr.length; i++){
        if(snakeArr[i].x === pos.x+dir.x && snakeArr[i].y === pos.y+dir.y){
            gameover()
            return
        }
    }

    pos={x:pos.x+dir.x,y:pos.y+dir.y}
    snakeArr.push(pos)
    if(snakeArr.length>length) snakeArr.shift()   
}

//knapptryck kollar att huvudet inte kolliderar med tidigare ormdel
function keydown(key){
    if(key==='ArrowRight' && snakeArr[snakeArr.length-2].x != pos.x+1 && snakeArr[snakeArr.length-2] != pos.y+0){
        dir={x:1,y:0}
    }
    if(key==='ArrowUp' && snakeArr[snakeArr.length-2].x != pos.x+0 && snakeArr[snakeArr.length-2] != pos.y-1){
        dir={x:0,y:-1}
    }
    if(key==='ArrowLeft' && snakeArr[snakeArr.length-2].x != pos.x-1 && snakeArr[snakeArr.length-2] != pos.y+0){
        dir={x:-1,y:0}
    }
    if(key==='ArrowDown' && snakeArr[snakeArr.length-2].x != pos.x+0 && snakeArr[snakeArr.length-2] != pos.y+1){
        dir={x:0,y:1}
    }
}

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
        if(s[i].name!='explode') Sprite.draw(s[i])
    }

    ctx.fillStyle = 'black'
    for(let i = 0; i < snakeArr.length; i++){
        drawBoard(snakeArr[i].x*res,snakeArr[i].y*res,res,res)
    }

    for(let i = 0; i < s.length; i++){
        if(s[i].name==='explode') Sprite.draw(s[i])
    }
}

//ritar en tile på spelplanen
function drawBoard(x,y,width,height){
    ctx.fillRect(x,y+uiHeight,width,height)
}

//när alla filer och dokument har laddat
//sätter date för sprite till date.now() och sätter frame till minframe
window.addEventListener('load', function(){
    document.addEventListener('keydown', function(e){keydown(e.key)})
    then = Date.now()
    canvas.style.display='flex'

    for(let i = 0; i < s.length; i++){
        s[i].then = then
        s[i].update()
    }
    
    update()
})

//kör move() vid fpsint millisekunder
function update(){
    requestAnimationFrame(update)
    now = Date.now()

    game()
    draw()

    //om skillnad är mer än interval fpsint
    if((now - then) > fpsint && !end){
        //funktionen körs 60fps så now-then får inte vara en faktor av 60fps
        then = now-((now - then) % fpsint)

        move()
    }

    for(let i = 0; i < s.length; i++){
        if((now - s[i].then) > s[i].fpsint){
            s[i].then = now-((now - s[i].then) % s[i].fpsint)

            if(s[i].name==='explode' && s[i].frame===s[i].maxFrame){
                s.splice(5, 1)
                continue
            }

            s[i].update()
        }
    }
}