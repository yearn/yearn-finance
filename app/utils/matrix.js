/* eslint-disable */

export default function runMatrix() {
  let c = document.getElementById('matrix');
  let ctx = c.getContext('2d');

  // making the canvas full screen
  c.height = window.innerHeight;
  c.width = window.innerWidth;

  // the characters
  let gurmukhi = '੧੨੩੪੫੬੭੮੯੦ੳਅਰਤਯਪਸਦਗਹਜਕਲਙੜਚਵਬਨਮੲਥਫਸ਼ਧਘਝਖਲ਼ੜ੍ਹਛਭਣ';
  let sanskrit = '१२३४५६७८९अरतयपसदगहजकलङषचवबनमआथय़फशधघझखळक्षछभणऒ';
  let hanzi =
    '田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑呂';
  let katakana =
    '゠クタハムヰアケチヒモヲィコッャンイツヤウゥサフュヵテユヶェショワエトヘヨォスラヱオナリカセニホル・ヌレーキソネロヽノマヮミ';
  let hex = 'ABCDEF01234567890';
  // converting the string into an array of single characters
  let characters = (hanzi + katakana + sanskrit + gurmukhi + hex).split('');
  let font_size = 12;
  let columns = c.width / font_size; // number of columns for the rain

  // an array of drops - one per column
  let drops = [];
  // x below is the x coordinate
  // 1 = y-coordinate of the drop (same for every drop initially)
  for (let x = 0; x < columns; x++) drops[x] = 1;

  const nbrLines = Math.ceil(c.height / font_size) + 1;
  let interval;
  let iter = 1;

  let opacities = [];
  const spread = 70;
  const maxOpacity = 1;
  const spreadAmount = maxOpacity / spread;
  let currentOpacity = maxOpacity;
  for (let i = 0; i < nbrLines; i++) {
    opacities[i] = currentOpacity;
    currentOpacity -= spreadAmount;
    if (currentOpacity <= 0) {
      opacities[i] = 0;
    }
  }

  function generateLine() {
    let text = '';
    for (let i = 0; i < drops.length * 1.5; i++) {
      const newChar = characters[Math.floor(Math.random() * characters.length)];
      text += newChar;
    }
    return text;
  }
  const lines = [];
  for (let i = 0; i < nbrLines; i++) {
    lines.push(generateLine());
  }

  let currentLine = 1;
  function draw() {
    ctx.fillStyle = '#01e000';
    ctx.font = font_size + 'px Courier';
    ctx.clearRect(0, 0, c.width, c.height);
    for (let i = 0; i < nbrLines; i++) {
      const idx = iter - i - 1;
      const opacity = opacities[idx] || 0;
      ctx.fillStyle = 'rgba(0, 255, 0, ' + opacity + ')';
      ctx.fillText(lines[i], 0, i * font_size);
    }
    if (iter >= nbrLines * 2) {
      clearInterval(interval);
    }
    iter += 3;
  }
  interval = setInterval(draw, 0); // TODO: why no delay? relying on render-speed is bad x_x.. let's see how this goes. no time :P
}
