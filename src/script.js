//canvas, context, spelplanens bredd och höjd, upplösning per tile, ui höjd
//längd på orm och arr är ormens alla positioner
//fpsArr är olika interval för move()
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
    static draw(sprite, x, y){
        ctx.drawImage(
            sprite.image, sprite.frameX*sprite.spriteWidth, sprite.frameY*sprite.spriteHeight, sprite.spriteWidth, sprite.spriteHeight, x*res,y*res+uiHeight,sprite.scale,sprite.scale
        )
    }

    //updatera spritens frame så att den animerar
    update(){
        this.frame = this.frame < this.maxFrame ? this.frame + 1 : this.minFrame
        this.frameX = this.frame % (this.image.width/this.spriteWidth)
        this.frameY = Math.floor(this.frame/(this.image.width/this.spriteWidth))
    }
}

var canvas=document.querySelector('canvas')
var ctx=canvas.getContext('2d')
var width=15
var height=15
var res=32
var uiHeight=50
canvas.width=width*res
canvas.height=uiHeight+height*res
var then,now,fpsint

var fpsIndex = 0
var isOver = false
var isEarth = false
var earthThen
var earthTime = 10000
var applePos={}
var bombPos=[]
var earthPos=[]
var spriteAnim=[
    new Sprite('apple',84,84, 0, 9, 150),
    new Sprite('bomb',256,256, 0, 0, 0),
    new Sprite('earth',128,128, 0, 63, 1),
    new Sprite('coin',44,44, 0, 11, 150),
    new Sprite('coin',44,44, 14, 25, 150)]

var length=5
var pos={x:1,y:7}
var snakeArr=[{x:pos.x,y:pos.y}]
var dir={x:1,y:0}

//går igenom alla tiles om snakearr inte innehåller en tile
//väljer random från möjliga tiles
function random(){
    var ran=[]

    for(let i = 0; i < width*height; i++){
        var notBody = true
        for(let j = 0; j < snakeArr.length; j++){
            if(snakeArr[j].x === i%width && snakeArr[j].y === Math.floor(i/width)) notBody = false
        }
        for(let j = 0; j < bombPos.length; j++){
            if(bombPos[j].x === i%width && bombPos[j].y === Math.floor(i/width)) notBody = false
        }
        for(let j = 0; j < earthPos.length; j++){
            if(earthPos[j].x === i%width && earthPos[j].y === Math.floor(i/width)) notBody = false
        }

        if(notBody) ran.push({x:i%width,y:Math.floor(i/width)})
    }

    return ran[Math.floor(Math.random()*ran.length)]
}

//chans att få item
function randomChance(list, r, chance){
    if(r < chance){
        item = random()

        if(Object.keys(item).length > 0){
            list.push(item)
        }
    }
}

function game(){
    if(length > 5) fpsIndex = 1
    if(length > 6) fpsIndex = 2
    if(length > 7) fpsIndex = 3
    if(length > 8) fpsIndex = 4

    fpsint = 260 - 20 * fpsIndex
}

function gameover(){
    var explode = new Sprite('explode',100,100, 0, 49, 50)
    spriteAnim.push(explode)
    explode.x=0;
    explode.y=-4;
    explode.scale=500
    bombPos = []

    isOver=true
}

//updateras efter fpsint
function move(){
    //träffa spelplanen
    if(0 > pos.x+dir.x || width <= pos.x+dir.x || 0 > pos.y+dir.y || height <= pos.y+dir.y){
        //om earth effekt är av
        if(!isEarth){
            gameover()
            return
        }
    }

    //träffa orm
    for(let i = 0; i < snakeArr.length; i++){
        if(snakeArr[i].x === pos.x+dir.x && snakeArr[i].y === pos.y+dir.y){
            gameover()
            return
        }
    }

    //äpple
    if(applePos.x === pos.x + dir.x && applePos.y === pos.y + dir.y){
        applePos = random()
        length++

        var r = Math.random()
        randomChance(bombPos, r, 0.25)
        randomChance(earthPos, r, 0.25)
    }

    //bomb
    for(let i = 0; i < bombPos.length; i++){
        if(bombPos[i].x === pos.x+dir.x && bombPos[i].y === pos.y+dir.y){
            gameover()
            return
        }
    }

    for(let i = 0; i < earthPos.length; i++){
        if(earthPos[i].x === pos.x+dir.x && earthPos[i].y === pos.y+dir.y){
            isEarth = true
            earthThen = now
            earthPos.splice(i, 1)
        }
    }

    if(!isEarth){
        pos={x:pos.x+dir.x,y:pos.y+dir.y}
    }
    else{
        //earth ger ormen går runt kanterna
        pos={x:(((pos.x + dir.x) % width) + width) % width, y:(((pos.y + dir.y) % height) + height) % height}
    }

    snakeArr.push(pos)
    if(snakeArr.length>length) snakeArr.shift()   
}

//knapptryck kollar att huvudet inte kolliderar med tidigare ormdel
function keydown(key){
    if(checkDir(key, 'ArrowRight', {x:1,y:0})){
        dir={x:1,y:0}
    }
    if(checkDir(key, 'ArrowUp', {x:0,y:-1})){
        dir={x:0,y:-1}
    }
    if(checkDir(key, 'ArrowLeft', {x:-1,y:0})){
        dir={x:-1,y:0}
    }
    if(checkDir(key, 'ArrowDown', {x:0,y:1})){
        dir={x:0,y:1}
    }
}

function checkDir(key, keyname, dir){
    return key === keyname && snakeArr[snakeArr.length - 2].x != pos.x+dir.x && snakeArr[snakeArr.length - 2] != pos.y+dir.y
}

//ritar en tile på spelplanen
function drawBoard(x,y){
    ctx.fillRect(x * res,y * res + uiHeight,res,res)
}

//ritar 60fps på spelplanen
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = 'white'
    ctx.fillRect(0,0,canvas.width,canvas.height)

    //spelplanen
    for(let i = 0; i < width*height; i++){
        if(i % 2 == 0) ctx.fillStyle = 'green'
        else ctx.fillStyle = 'darkgreen'
        drawBoard(i%width,Math.floor(i/width))
    }

    //ui
    ctx.fillStyle = 'black'
    ctx.font = '15px Arial'
    ctx.fillText(`LENGTH: ${length}`, 10, 20)
    ctx.fillStyle = 'blue'
    if(isEarth) ctx.fillText(`LOOP EFFECT: ${Math.round((earthTime - (now - earthThen)) / 1000)}`, 10, 40)

    //sprite
    Sprite.draw(spriteAnim[0], applePos.x, applePos.y)

    for(let i = 0; i < bombPos.length; i++){
        Sprite.draw(spriteAnim[1], bombPos[i].x, bombPos[i].y)
    }

    for(let i = 0; i < earthPos.length; i++){
        Sprite.draw(spriteAnim[2], earthPos[i].x, earthPos[i].y)
    }

    ctx.fillStyle = 'black'
    for(let i = 0; i < snakeArr.length; i++){
        drawBoard(snakeArr[i].x,snakeArr[i].y)
    }

    //explosion
    for(let i = 0; i < spriteAnim.length; i++){
        if(spriteAnim[i].name === 'explode') Sprite.draw(spriteAnim[i], spriteAnim[i].x, spriteAnim[i].y)
    }
}

//när alla filer och dokument har laddat
//sätter date för sprite till date.now() och sätter frame till minframe
window.addEventListener('load', function(){
    document.addEventListener('keydown', function(e){keydown(e.key)})
    then = Date.now()
    canvas.style.display='flex'

    applePos = random()
    for(let i = 0; i < spriteAnim.length; i++){
        spriteAnim[i].then = then
        spriteAnim[i].update()
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
    if((now - then) > fpsint && !isOver){
        //funktionen körs 60fps så now-then får inte vara en faktor av 60fps
        then = now-((now - then) % fpsint)

        move()
    }

    if(isEarth && (now - earthThen) > earthTime){
        isEarth = false
    }

    //kör med alla sprite i spriteanim varje fpsint
    for(let i = 0; i < spriteAnim.length; i++){
        if((now - spriteAnim[i].then) > spriteAnim[i].fpsint){
            spriteAnim[i].then = now-((now - spriteAnim[i].then) % spriteAnim[i].fpsint)

            //om gameover animeras explode
            if(spriteAnim[i].name==='explode' && spriteAnim[i].frame===spriteAnim[i].maxFrame){
                spriteAnim.splice(5, 1)
                continue
            }

            spriteAnim[i].update()
        }
    }
}