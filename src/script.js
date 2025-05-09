//sprite klass med img sprite size, frames och interval
class Sprite{
    //frame blir minframe-1 för att updatera den vid start
    //fpsint är hur snabb en frame är,
    // width och height är bredden på första framen som börjar vid x=0 och y=0
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
        this.frame=minFrame-1 //gör sprite.frame till minFrame när sprite.update i start() 
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

//canvas, rit context
var canvas=document.querySelector('.game')
var Menu = document.querySelector('.menu')
var Shop = document.querySelector('.shop')
var Control = document.querySelector('.control')
var ctx=canvas.getContext('2d')

//spelplanens bredd och höjd, upplösning res per tile, canvas.height = uihöjd+pixelhöjd för spelplanen
var width=15
var height=15
var res=32
var uiHeight=50
canvas.width=width*res
canvas.height=uiHeight+height*res

//then,now,fpsint,fpsindex kontrollerar move() interval i updatemove()
var then,now,fpsint,fpsIndex

//isloop,isover kontrollerar olika event. loopthen,looptime kontrollerar tiden for loop effekt
var loopThen,isLoop,loopTime,coins,isOver

//längd på orm och arr är ormens alla positioner
var applePos,snakeLength,snakeRecord,pos,dir,rotation,isBombed
var bombPos=[]
var loopPos=[]
var coinPos=[]
var snakeArr=[]
var upgrade1,upgrade2,upgrade1cost,upgrade2cost

//olika värden för animationer
var spriteAnim=[
    new Sprite('apple',84,84, 0, 9, 120),
    new Sprite('bomb',256,256, 0, 0, 0),
    new Sprite('earth',128,128, 0, 63, 60),
    new Sprite('body',90,90, 0, 0, 0),
    new Sprite('body',90,90, 0, 3, 60),
    new Sprite('body',90,90, 4, 4, 0),
    new Sprite('coin',44,44, 0, 11, 60),
]







//går igenom alla tiles som inte innehåller en sprite
//väljer random från möjliga tiles
function random(){
    var ran=[]

    for(let i = 0; i < width*height; i++){
        var notBody = true
        for(let j = 0; j < snakeArr.length; j++){
            if(snakeArr[j].x === i%width && snakeArr[j].y === Math.floor(i/width)) notBody = false
        }
        if(applePos){
            if(applePos.x === i%width && applePos.y === Math.floor(i/width)) notBody = false
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
        var item = random()

        if(Object.keys(item).length > 0){
            list.push(item)
        }
    }
}







//spelar upp ljud
function playAudio(id){
    var audio = new Audio(document.getElementById(id).src) //en audio klon med id
    
    if(id === 'eat'){
        audio.playbackRate = 2 * 300 / fpsint //eat.mp3 är samma som fpsint
    }

    audio.play()
}

//ändra fpsint beroende på längd
//upgrade2 ger långsammare orm
function game(){
    fpsIndex = 0
    if(upgrade2){
        if(snakeLength > 10) fpsIndex = 1
        if(snakeLength > 20) fpsIndex = 2
    }
    else{
        if(snakeLength > 7) fpsIndex = 1
        if(snakeLength > 10) fpsIndex = 2
        if(snakeLength > 15) fpsIndex = 3
        if(snakeLength > 20) fpsIndex = 4
        if(snakeLength > 25) fpsIndex = 5
    }

    fpsint = 300 - 30 * fpsIndex
}

//när ormer kolliderar en sprängs
function gameover(){
    explode()
    isOver=true
}

//rita explode sprite och pushar på animationslista och spela ljud
function explode(){
    var explode = new Sprite('explode',100,100, 0, 49, 30)
    spriteAnim.push(explode)
    explode.x=-2;
    explode.y=-5;
    explode.scale=600
    playAudio('explosion')
}

//kollar om ormen kolliderar med item
//om isloop kommer ormen gå runt spelplanen
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
    //ormen träffar spelplanen
    if(0 > pos.x+dir.x || width <= pos.x+dir.x || 0 > pos.y+dir.y || height <= pos.y+dir.y){
        //om loop effekt är av
        if(!isLoop){
            gameover()
            return
        }
    }

    //ormen träffar ormen
    for(let i = 0; i < snakeArr.length; i++){
        if(isCollide(snakeArr[i])){
            gameover()
            return
        }
    }

    //äpple ökar length
    if(isCollide(applePos)){
        applePos = random()
        snakeLength++
        playAudio('food')

        var r = Math.random()
        randomChance(bombPos, r, 0.7)
        randomChance(loopPos, r, 0.3)
        randomChance(coinPos, r, 0.5)
    }

    //bomb minskar length
    for(let i = 0; i < bombPos.length; i++){
        if(isCollide(bombPos[i])){
            if(snakeLength - 5 >= 2){
                bombPos.splice(i, 1)
                snakeLength -= 5
                explode()
                isBombed = true
            }
            else{
                bombPos.splice(i, 1)
                gameover()
                return
            }
        }
    }

    //jord ger looptime
    for(let i = 0; i < loopPos.length; i++){
        if(isCollide(loopPos[i])){
            isLoop = true
            loopThen = now
            loopPos.splice(i, 1)
            playAudio('food')
        }
    }

    //coin
    for(let i = 0; i < coinPos.length; i++){
        if(isCollide(coinPos[i])){
            coins++
            coinPos.splice(i, 1)
            playAudio('food')
        }
    }

    //kollar om ormen är inom length
    if(snakeArr.length>snakeLength) snakeArr.shift()

    //ingen rotation om man är bombad
    if(isBombed){
        if(snakeArr.length <= snakeLength) isBombed = false
    }
    else{
        //roterar huvudet
        if(dir.x === 1 && dir.y === 0) rotation = 0
        if(dir.x === 0 && dir.y === 1) rotation = 1
        if(dir.x === -1 && dir.y === 0) rotation = 2
        if(dir.x === 0 && dir.y === -1) rotation = 3
        
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
    }
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
//sedan återställer så spelplanen 0,0 blir centrum
function drawHead(){
    var x = pos.x*res+res / 2;
    var y = pos.y*res+res / 2;

    var angle = rotation * Math.PI / 2

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
    if(isBombed) ctx.fillStyle = 'red'
    else ctx.fillStyle = 'black'
    ctx.font = "15px 'Gill Sans', 'Gill Sans MT', 'Trebuchet MS', sans-serif"
    ctx.fillText(`LENGTH: ${snakeArr.length-1}`, 40, 24)
    ctx.fillStyle = 'black'
    ctx.fillText(`${coins}`, 285, 24)

    if(isLoop){
        ctx.fillStyle = 'blue'
        ctx.fillText(`LOOP: ${Math.round((loopTime - (now - loopThen)) / 1000)}`, 175, 24)
    }

    //rita bilder på ui, index är 7 för ui sprites
    for(let i = 7; i < spriteAnim.length; i++){
        if(spriteAnim[i].name != 'explode'){
            if(spriteAnim[i].name === 'earth'){
                if(isLoop) Sprite.draw(spriteAnim[i], spriteAnim[i].x, spriteAnim[i].y)
            }
            else{
                Sprite.draw(spriteAnim[i], spriteAnim[i].x, spriteAnim[i].y)
            }
        }
    }

    //sprite
    //flyttar kontext så att spelplanen 0,0 blir centrum
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
    coins = 0
    loopTime = 20000
    upgrade1 = false
    upgrade2 = false
    upgrade1cost = 10
    upgrade2cost = 10
    snakeRecord = 0

    //olika ui bilder
    var body = new Sprite('body',90,90, 0, 3, 100)
    spriteAnim.push(body)
    body.x=0.25
    body.y=0.25
    body.scale=24

    var earth = new Sprite('earth',128,128, 0, 63, spriteAnim[2].fpsint)
    spriteAnim.push(earth)
    earth.x=4.5
    earth.y=0.25
    earth.scale=24

    var coin = new Sprite('coin',44,44, 0, 11, spriteAnim[6].fpsint)
    spriteAnim.push(coin)
    coin.x=8
    coin.y=0.25
    coin.scale=24

    menu()
})

//ladda huvudmeny
function menu(){
    Menu.classList.add('show')
    Shop.classList.remove('show')
    Control.classList.remove('show')
    if(snakeRecord > 0) document.querySelector('#record').innerHTML = `Record: ${snakeRecord}`
}

//ladda shop
function shop(){
    Menu.classList.remove('show')
    Shop.classList.add('show')
    Control.classList.remove('show')
    document.querySelector('#coins').innerHTML = `Coins: ${coins}`
    if(upgrade1) document.querySelector('#button1').innerHTML = 'Bought'
    else document.querySelector('#button1').innerHTML = `Cost: ${upgrade1cost}`
    if(upgrade2) document.querySelector('#button2').innerHTML = 'Bought'
    else document.querySelector('#button2').innerHTML = `Cost: ${upgrade2cost}`
}

//mer loop time
function buyUpgrade1(){
    if(coins>=upgrade1cost && !upgrade1){
        coins-=upgrade1cost
        upgrade1 = true
        shop()
    }
}

//långsammare orm
function buyUpgrade2(){
    if(coins>=upgrade2cost && !upgrade2){
        coins-=upgrade2cost
        upgrade2 = true
        shop()
    }
}

//ladda kontroll
function control(){
    Menu.classList.remove('show')
    Shop.classList.remove('show')
    Control.classList.add('show')
}





//start startas med en button
function start(){
    document.addEventListener('keydown', function(e){keydown(e.key)})
    Menu.classList.remove('show')
    canvas.classList.add('show')
    isOver = false
    isLoop = false
    if(upgrade1) loopTime = 60000
    bombPos=[]
    loopPos=[]
    coinPos=[]

    //längd på orm, huvud position, huvudets riktning, första kroppen är huvudets position
    snakeLength=6
    pos={x:1,y:7}
    dir={x:1,y:0}
    snakeArr=[{x:pos.x,y:pos.y}]
    rotation = 0
    isBombed = false
    applePos = random()

    //sätter sprite.then till then
    then = Date.now()
    //sätter date för sprite till date.now() och sätter frame till minframe med sprite.update()
    for(let i = 0; i < spriteAnim.length; i++){
        spriteAnim[i].then = then
        spriteAnim[i].update()
    }
    playAudio('start')
    update()
    updateMove()
}

//kör vid 60fps
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
                spriteAnim.splice(i, 1)
                continue
            }

            spriteAnim[i].update()
        }
    }
}

//updatera move() beroende på fpsint
function updateMove(){
    if(isOver){
        if(snakeLength > snakeRecord) snakeRecord = snakeLength
        menu()
        return
    }

    requestAnimationFrame(updateMove)

    //om skillnad är mer än interval fpsint
    if((now - then) > fpsint){
        //funktionen körs 60fps så now-then får inte vara en faktor av 60fps
        then = now-((now - then) % fpsint)

        move()
        playAudio('eat')
    }
}