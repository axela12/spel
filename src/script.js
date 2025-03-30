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
        this.scale=res
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
            sprite.image, sprite.frameX*sprite.spriteWidth, sprite.frameY*sprite.spriteHeight,
            sprite.spriteWidth, sprite.spriteHeight, x*res,y*res,sprite.scale,sprite.scale
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
var menu = document.querySelector('#menu')
var width=15
var height=15
var res=32
var uiHeight=50
canvas.width=width*res
canvas.height=uiHeight+height*res
var then,now,fpsint,fpsIndex,loopThen,isLoop,loopTime,coins,isOver
var applePos
var bombPos=[]
var loopPos=[]
var coinPos=[]
var snakeArr=[]
var length
var pos
var dir
var upgrade1,upgrade2,upgrade1cost,upgrade2cost

//olika värden för animationer
var spriteAnim=[
    new Sprite('apple',84,84, 0, 9, 150),
    new Sprite('bomb',256,256, 0, 0, 0),
    new Sprite('earth',128,128, 0, 63, 1),
    new Sprite('body',90,90, 2, 2, 0),
    new Sprite('body',90,90, 0, 2, 100),
    new Sprite('body',90,90, 3, 3, 0),
    new Sprite('coin',44,44, 0, 11, 150),
]

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
        for(let j = 0; j < loopPos.length; j++){
            if(loopPos[j].x === i%width && loopPos[j].y === Math.floor(i/width)) notBody = false
        }
        for(let j = 0; j < coinPos.length; j++){
            if(coinPos[j].x === i%width && coinPos[j].y === Math.floor(i/width)) notBody = false
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

//ändra fpsint beroende på längd
//upgrade2 ger långsammare orm
function game(){
    fpsIndex = 0
    if(upgrade2){
        if(length > 10) fpsIndex = 1
        if(length > 20) fpsIndex = 2
    }
    else{
        if(length > 7) fpsIndex = 1
        if(length > 10) fpsIndex = 2
        if(length > 15) fpsIndex = 3
        if(length > 20) fpsIndex = 4
        if(length > 25) fpsIndex = 5
    }

    fpsint = 260 - 30 * fpsIndex
}

//när ormer kolliderar en sprängs
function gameover(){
    var explode = new Sprite('explode',100,100, 0, 49, 50)
    spriteAnim.push(explode)
    explode.x=0;
    explode.y=-4;
    explode.scale=500
    bombPos = []

    isOver=true
}

function isCollide(item){
    if(!isLoop){
        return item.x === pos.x+dir.x && item.y === pos.y+dir.y
    }
    else{
        //loop ger ormen går runt kanterna
        var newpos={x:(((pos.x + dir.x) % width) + width) % width, y:(((pos.y + dir.y) % height) + height) % height}
        return item.x === newpos.x && item.y === newpos.y
    }
}

//updateras efter fpsint
function move(){
    //träffa spelplanen
    if(0 > pos.x+dir.x || width <= pos.x+dir.x || 0 > pos.y+dir.y || height <= pos.y+dir.y){
        //om loop effekt är av
        if(!isLoop){
            gameover()
            return
        }
    }

    //träffa orm
    for(let i = 0; i < snakeArr.length; i++){
        if(isCollide(snakeArr[i])){
            gameover()
            return
        }
    }

    //äpple
    if(isCollide(applePos)){
        applePos = random()
        length++

        var r = Math.random()
        randomChance(bombPos, r, 0.25)
        randomChance(loopPos, r, 0.1)
        randomChance(coinPos, r, 0.8)
    }

    //bomb
    for(let i = 0; i < bombPos.length; i++){
        if(isCollide(bombPos[i])){
            gameover()
            return
        }
    }

    //jord
    for(let i = 0; i < loopPos.length; i++){
        if(isCollide(loopPos[i])){
            isLoop = true
            loopThen = now
            loopPos.splice(i, 1)
        }
    }

    //coin
    for(let i = 0; i < coinPos.length; i++){
        if(isCollide(coinPos[i])){
            coins++
            coinPos.splice(i, 1)
        }
    }

    //ändrar huvdets position med dir
    if(!isLoop){
        pos={x:pos.x+dir.x,y:pos.y+dir.y}
    }
    else{
        //loop ger ormen går runt kanterna
        pos={x:(((pos.x + dir.x) % width) + width) % width, y:(((pos.y + dir.y) % height) + height) % height}
    }

    //snakearr får huvudets position
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

//kollar att ormendel innan huvud inte är lika med pos + dir
function checkDir(key, keyname, dir){
    return key === keyname && snakeArr[snakeArr.length - 2].x != pos.x+dir.x && snakeArr[snakeArr.length - 2] != pos.y+dir.y
}

//ritar en tile på spelplanen
function drawBoard(x,y){
    ctx.fillRect(x * res,y * res + uiHeight,res,res)
}

//ritar huvud sprite och roterar context
//sparar kontext och tranformerar
//sedan återställer så spelplanen blir 0
function drawHead(){
    var x = pos.x*res+res / 2;
    var y = pos.y*res+res / 2;

    var n = 0
    if(dir.x === 1 && dir.y === 0) n = 0
    if(dir.x === 0 && dir.y === 1) n = 1
    if(dir.x === -1 && dir.y === 0) n = 2
    if(dir.x ===0 && dir.y === -1) n = 3
    var angle = n * Math.PI / 2

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    Sprite.draw(spriteAnim[4], -0.5, -0.5)
    ctx.restore();
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
    if(isLoop){
        ctx.fillStyle = 'blue'
        ctx.fillText(`LOOP EFFECT: ${Math.round((loopTime - (now - loopThen)) / 1000)}`, 10, 40)
    }    
    ctx.fillStyle = 'black'
    ctx.fillText(`X ${coins}`, 190, 30)
    Sprite.draw(spriteAnim[6], 5, 0.25)

    //sprite
    //flyttar kontext så att spelplanens kant blir 0
    ctx.save()
    ctx.translate(0, uiHeight)

    Sprite.draw(spriteAnim[0], applePos.x, applePos.y)

    for(let i = 0; i < bombPos.length; i++){
        Sprite.draw(spriteAnim[1], bombPos[i].x, bombPos[i].y)
    }

    for(let i = 0; i < loopPos.length; i++){
        Sprite.draw(spriteAnim[2], loopPos[i].x, loopPos[i].y)
    }

    for(let i = 0; i < coinPos.length; i++){
        Sprite.draw(spriteAnim[6], coinPos[i].x, coinPos[i].y)
    }

    for(let i = 0; i < snakeArr.length-1; i++){
        Sprite.draw(spriteAnim[3], snakeArr[i].x, snakeArr[i].y)
    }

    if(isOver){
        Sprite.draw(spriteAnim[5], pos.x, pos.y)
    }
    else{
        drawHead()
    }

    //explosion
    for(let i = 0; i < spriteAnim.length; i++){
        if(spriteAnim[i].name === 'explode') Sprite.draw(spriteAnim[i], spriteAnim[i].x, spriteAnim[i].y)
    }

    //återställer till att kontext blir canvas hörn
    ctx.restore()
}

//när alla filer och dokument har laddat
window.addEventListener('load', function(){
    canvas.style.visibility = 'hidden'
    coins = 0
    loopTime = 20000
    upgrade1 = false
    upgrade2 = false
    upgrade1cost = 10
    upgrade2cost = 10
    load()
})

//ladda huvudmeny
function load(){
    menu.style.visibility = 'visible'
    document.querySelector('#shop').style.visibility = 'hidden'
    document.querySelector('#control').style.visibility = 'hidden'
}

//ladda shop
function shop(){
    menu.style.visibility = 'hidden'
    document.querySelector('#shop').style.visibility = 'visible'
    document.querySelector('#control').style.visibility = 'hidden'
    document.querySelector('#coins').innerHTML = `Coins: ${coins}`
    if(upgrade1) document.querySelector('#button1').innerHTML = 'Bought'
    else document.querySelector('#button1').innerHTML = `Cost: ${upgrade1cost}`
    if(upgrade2) document.querySelector('#button2').innerHTML = 'Bought'
    else document.querySelector('#button2').innerHTML = `Cost: ${upgrade2cost}`
}

//mer loop time
function buyUpgrade1(){
    if(coins>=upgrade1cost){
        coins-=upgrade1cost
        upgrade1 = true
        loopTime = 60000
        shop()
    }
}

//långsammare orm
function buyUpgrade2(){
    if(coins>=upgrade2cost){
        coins-=upgrade2cost
        upgrade2 = true
        shop()
    }
}

//ladda kontroll
function control(){
    menu.style.visibility = 'hidden'
    document.querySelector('#shop').style.visibility = 'hidden'
    document.querySelector('#control').style.visibility = 'visible'
}

//start startas med en button
//sätter date för sprite till date.now() och sätter frame till minframe
function start(){
    document.addEventListener('keydown', function(e){keydown(e.key)})
    menu.style.visibility='hidden'
    canvas.style.visibility='visible'
    isOver = false
    isLoop = false
    applePos = random()
    bombPos=[]
    loopPos=[]
    coinPos=[]

    //längd på orm
    //huvud position
    //huvudets riktning
    //hela ormen
    length=5
    pos={x:1,y:7}
    dir={x:1,y:0}
    snakeArr=[{x:pos.x,y:pos.y}]

    //sätter sprite.then till then
    then = Date.now()
    for(let i = 0; i < spriteAnim.length; i++){
        spriteAnim[i].then = then
        spriteAnim[i].update()
    }
    update()
    updateMove()
}

//kör move() vid fpsint millisekunder
function update(){
    requestAnimationFrame(update)
    now = Date.now()

    game()
    draw()

    if(isLoop && (now - loopThen) > loopTime){
        isLoop = false
    }

    //kör med alla sprite i spriteanim varje fpsint
    for(let i = 0; i < spriteAnim.length; i++){
        if((now - spriteAnim[i].then) > spriteAnim[i].fpsint){
            spriteAnim[i].then = now-((now - spriteAnim[i].then) % spriteAnim[i].fpsint)

            //om gameover animeras explode
            if(spriteAnim[i].name==='explode' && spriteAnim[i].frame===spriteAnim[i].maxFrame){
                spriteAnim.splice(spriteAnim.length - 1, 1)
                continue
            }

            spriteAnim[i].update()
        }
    }
}

//updatera move() beroende på fpsint
function updateMove(){
    if(isOver){
        menu.style.visibility = 'visible'
        return
    }

    requestAnimationFrame(updateMove)

    //om skillnad är mer än interval fpsint
    if((now - then) > fpsint){
        //funktionen körs 60fps så now-then får inte vara en faktor av 60fps
        then = now-((now - then) % fpsint)

        move()
    }
}