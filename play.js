
// const fs = require('fs')
// const { createCanvas, loadImage } = require('canvas')
// // https://github.com/Automattic/node-canvas
// function ayman() {

 
//     const canvas = createCanvas(200, 200)
//     const ctx = canvas.getContext('2d')
    
//     // Write "Awesome!"
//     ctx.font = '30px Impact'
//     ctx.rotate(0.1)
//     ctx.fillText('Awesome!', 50, 100)
    
//     // Draw line under text
//     var text = ctx.measureText('Awesome!')
//     ctx.strokeStyle = 'rgba(0,0,0,0.5)'
//     ctx.beginPath()
//     ctx.lineTo(50, 102)
//     ctx.lineTo(50 + text.width, 102)
//     ctx.stroke()
    
//     // Draw cat with lime helmet
//     loadImage('~/hajonsoft/passports/19AA39734_400x300.jpg').then((image) => {
//       ctx.drawImage(image, 50, 0, 70, 70)
    
//       console.log('<img src="' + canvas.toDataURL() + '" />')
//     })
// }
// ayman()
// module.exports = {ayman}



//           // fs.writeFileSync(
//           //   pngFile,
//           //   text2png(codeline, {
//           //     font: '30px sans-serif',
//           //     color: "black",
//           //     bgColor: "white",
//           //     lineSpacing: 20,
//           //   })
//           // );

const moment = require('moment')
console.log(moment().format('mmssa'))