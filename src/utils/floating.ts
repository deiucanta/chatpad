/**
 * Float a number of things up on a page (hearts, flowers, 👌 ...)
 * <br>
 * You give the options in an object.
 *
 * @module floating
 * @param {string} [options.content='👌']
 *   the character or string to float
 * @param {number} [options.number=1]
 *   the number of items
 * @param {number} [options.duration=10]
 *   the amount of seconds it takes to float up
 * @param {number|string} [options.repeat='infinite']
 *   the number of times you want the animation to repeat
 * @param {string} [options.direction='normal']
 *   The <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/animation-direction">
 *   animation-direction</a> of the main animation
 * @param {number|array} [options.sizes=2]
 *   The size (in em) of each element. Giving two values in an array will
 *   give a random size between those values.
 */
export default function floating(
    {
      content = '👌',
      number = 1,
      duration = 10,
      repeat = 1,
      direction = 'normal',
      size = 2,
      elem = document.body
    } = {}
  ) {
    const style = document.createElement('style');
    style.id = 'floating-style';
  
    if (!document.getElementById('floating-style')) {
      document.head.appendChild(style);
    }
  
    const MAX = 201;
  
    const styles = `
    .float-container {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 999999;
    }
  
    .float-container div * {
      width: 1em;
      height: 1em
    }
  
    @keyframes float{
      ${Array.apply(null, { length: MAX + 1 })
        .map((v, x) => ({
          percent: x * 100 / MAX,
          width: Math.sin(x),
          height: 110 + x * (-120 / MAX),
        }))
        .map(
          ({ percent, width, height }) =>
            `${percent}% {
            transform: translate(
              ${width}vw,
              ${height}vh
            )
          }`
        )
        .join('')}
    }`;
  
    document.getElementById('floating-style').innerHTML = styles;
  
    const container = document.createElement('div');
  
    container.className = 'float-container';
  
    const _size = Array.isArray(size)
      ? Math.floor(Math.random() * (size[1] - size[0] + 1)) + size[0]
      : size;
  
    for (let i = 0; i < number; i++) {
      const floater = document.createElement('div');
      floater.innerHTML = content;
  
      floater.style.cssText = `
       position: absolute;
       left: 0;
       font-size: ${_size}em;
       transform: translateY(110vh);
       animation: 
         float
         ${duration}s
         linear
         ${i * Math.random()}s
         ${repeat}
         ${direction};
      margin-left: ${Math.random() * 100}vw;`;
  
      floater.addEventListener('animationend', e => {
        if (e.animationName === 'float') {
          container.removeChild(floater);
        }
      });
  
      container.appendChild(floater);
    }
  
    elem.appendChild(container);
  }
  