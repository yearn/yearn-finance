/* eslint-disable */

export default function runMatrix() {
  var c = document.getElementById('matrix');
  var ctx = c.getContext('2d');

  // making the canvas full screen
  c.height = window.innerHeight;
  c.width = window.innerWidth;

  // the characters
  var gurmukhi = '੧੨੩੪੫੬੭੮੯੦ੳਅਰਤਯਪਸਦਗਹਜਕਲਙੜਚਵਬਨਮੲਥਫਸ਼ਧਘਝਖਲ਼ੜ੍ਹਛਭਣ';
  var sanskrit = '१२३४५६७८९अरतयपसदगहजकलङषचवबनमआथय़फशधघझखळक्षछभणऒ';
  var hanzi =
    '田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑呂';
  var katakana =
    '゠クタハムヰアケチヒモヲィコッャンイツヤウゥサフュヵテユヶェショワエトヘヨォスラヱオナリカセニホル・ヌレーキソネロヽノマヮミ';
  var hex = 'ABCDEF01234567890';
  // converting the string into an array of single characters
  var characters = (hanzi + katakana + sanskrit + gurmukhi + hex).split('');
  var font_size = 12;
  var columns = c.width / font_size; // number of columns for the rain

  // an array of drops - one per column
  var drops = [];
  // x below is the x coordinate
  // 1 = y-coordinate of the drop (same for every drop initially)
  for (var x = 0; x < columns; x++) drops[x] = 1;

  const nbrLines = Math.ceil(c.height / font_size) + 1;
  let interval;
  let iter = 1;

  let opacities = [];
  const spread = 70;
  const maxOpacity = 1;
  const spreadAmount = maxOpacity / spread;
  let currentOpacity = maxOpacity;
  for (var i = 0; i < nbrLines; i++) {
    opacities[i] = currentOpacity;
    currentOpacity -= spreadAmount;
    if (currentOpacity <= 0) {
      opacities[i] = 0;
    }
  }

  function generateLine() {
    let text = '';
    for (var i = 0; i < drops.length * 1.5; i++) {
      const newChar = characters[Math.floor(Math.random() * characters.length)];
      text += newChar;
    }
    return text;
  }
  const lines = [];
  for (var i = 0; i < nbrLines; i++) {
    lines.push(generateLine());
  }

  let currentLine = 1;
  function draw() {
    ctx.fillStyle = '#01e000';
    ctx.font = font_size + 'px Courier';
    ctx.clearRect(0, 0, c.width, c.height);
    for (var i = 0; i < nbrLines; i++) {
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
