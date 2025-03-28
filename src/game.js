canvas=document.querySelector('canvas')
ctx=canvas.getContext('2d')

width=16
height=16
resolution=10
canvas.width=width*resolution
canvas.height=height*resolution

length=1


function run(){

}


document.addEventListener('keydown',function(e){
    let key=e.key

    if(key==='ArrowUp')
        ctx.fillRect(1,1,10,10)
})