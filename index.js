addEventListener("fetch", event => {
  event.respondWith(
    handleRequest(event.request).catch(e => {
      // If any invalid input occurs, the worker will prevent halting and display this to the user
      return new Response(`Error ${e}`);
    })
  );
});


/**
 * @desc Fetches and returns JSON from a URL via GET
 * @param {String} url URL to fetch from
 * @returns {JSON}
 */

async function getFetchJSON(url) {
  const config = {
    method: "GET",
    headers: {
      "content-type": "application/json;charset=UTF-8"
    }
  };

  return await fetch(url, config).then(response => {
    return response.json();
  });
}

/**
 * @desc Fetches and returns HTML text from URL via GET
 * @param {URL} url URL to fetch from
 * @returns {Array}
 */

async function fetchHTML(url) {
  const config = {
    method: "GET",
    headers: {
      "content-type": "text/html;charset=UTF-8"
    }
  };

  return await fetch(url, config).then(response => {
    return response.text();
  });
}


/**
 * @desc Appends a HTML element to an element
 * @param {string} content name of a content tag to filter
 * @param {string} url url to display, in the future I would change 
 * this to an object or array to allow for range of data types
 */

class TextRewriterHandler {
  constructor(content, url) {
    this.content = content
    this.url = url
  }

  element(element) {
    // if content is fireworks effect, then create a new div that has fireworks
    if (this.content == "div") {
      // element.setAttribute('class','pyro')
      element.append("<div class=" + "pyro>" + "</div>", { html: true })

    } else if (this.content == "css") {
      element.after("<style>\n" + fireworksStylingCSS + "\n</style>\n", { html: true })
    }
    else {
      console.log(`Incoming element: ${this.url}`)
      element.append(
        `Cookies are saved for 10 seconds. Current cookie: ${this.url}`
      );
    }
  }
}

/**
 * @desc Generates a cookie with a set expire time
 * @param key
 * @param value
 * @param seconds Cookie expiration time in seconds
 */

function generateCookie(key, value, seconds) {
  // Make a cookie that expires in 10 seconds
  var date = new Date();
  date.setTime(date.getTime() + seconds * 1000);
  return `${key}=${value}; Expires=${date.toUTCString()}; Path='/';`;
}

/**
 * @desc Helper to retrieve cookie
 * @param {Request} request
 * @param {string} cookieName name of the cookie
 *
 */
function getCookie(request, cookieName) {

  let result = null
  let cookieString = request.headers.get('Cookie')
  if (cookieString) {
    let cookies = cookieString.split(';')
    cookies.forEach(cookie => {
      let cookieKey = cookie.split('=')[0].trim()
      if (cookieKey === cookieName) {
        let cookieVal = cookie.split('=')[1]
        result = cookieVal
      }
    })
  }
  return result
}

/**
 * @desc Returns random number in range [0, max)
 * @param max
 * @returns {number}
 */

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * @desc chooses a random URL
 * @param {Array} variants Array of items
 * */
function chooseRandom(variants) {

  const index = getRandomInt(variants.length);
  return variants[index];
}


// Constants
const URLTOFETCH = new URL("https://cfw-takehome.developers.workers.dev/api/variants")
const cookieKey = "cloudflare-variant-key"


/**
 * Responds with A/B/Z/... test html from URL with worker
 * @param {Request} request
 * @throws Request error
 */

async function handleRequest(request) {
  // Load and parse JSON from given variant URL into array of URL choices
  const variantJSON = await getFetchJSON(URLTOFETCH);
  const variantList = variantJSON.variants;



  // Choose the URL from the array, or from a cookie if it exists
  const cookieURL = getCookie(request, cookieKey);
  const chosenItem = cookieURL || chooseRandom(variantList);
  const chosenURL = new URL(chosenItem);
  var htmlRewriter = null;
  console.log(cookieURL)


  // Fetch and modify the page of the URL via a GET request
  let fetchedPage = await fetchHTML(chosenURL);

  // Convert fetchedPage into a response
  var response = await new Response(fetchedPage, {
    headers: { "content-type": "text/html" }
  });

  // Display cookie if found, otherwise display no cookie found
  response = new HTMLRewriter().on("p#description", cookieURL ? new TextRewriterHandler(null, cookieURL) : new TextRewriterHandler(null, "No Cookie Found")).transform(response)
  // Insert fireworks div 
  response = new HTMLRewriter().on("body", new TextRewriterHandler("div", cookieURL)).transform(response)
  // Insert fireworks css styling
  response = new HTMLRewriter().on("head", new TextRewriterHandler("css", cookieURL)).transform(response)


  // Set cookie with the current URL if it hasn't already been set
  if (cookieURL == null) {
    const newCookie = generateCookie(
      cookieKey,
      chosenURL,
      10
    );
    response.headers.set("Set-Cookie", newCookie);
    console.log(`New Cookie Generated ${newCookie}`)
  }

  return response;
}

const fireworksStylingCSS = `body {
  margin: 0;
  padding: 0;
  background: #000;
  overflow: hidden; }

.pyro {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  box-shadow: -120px -218.66667px blue, 248px -16.66667px #00ff84, 190px 16.33333px #002bff, -113px -308.66667px #ff009d, -109px -287.66667px #ffb300, -50px -313.66667px #ff006e, 226px -31.66667px #ff4000, 180px -351.66667px #ff00d0, -12px -338.66667px #00f6ff, 220px -388.66667px #99ff00, -69px -27.66667px #ff0400, -111px -339.66667px #6200ff, 155px -237.66667px #00ddff, -152px -380.66667px #00ffd0, -50px -37.66667px #00ffdd, -95px -175.66667px #a6ff00, -88px 10.33333px #0d00ff, 112px -309.66667px #005eff, 69px -415.66667px #ff00a6, 168px -100.66667px #ff004c, -244px 24.33333px #ff6600, 97px -325.66667px #ff0066, -211px -182.66667px #00ffa2, 236px -126.66667px #b700ff, 140px -196.66667px #9000ff, 125px -175.66667px #00bbff, 118px -381.66667px #ff002f, 144px -111.66667px #ffae00, 36px -78.66667px #f600ff, -63px -196.66667px #c800ff, -218px -227.66667px #d4ff00, -134px -377.66667px #ea00ff, -36px -412.66667px #ff00d4, 209px -106.66667px #00fff2, 91px -278.66667px #000dff, -22px -191.66667px #9dff00, 139px -392.66667px #a6ff00, 56px -2.66667px #0099ff, -156px -276.66667px #ea00ff, -163px -233.66667px #00fffb, -238px -346.66667px #00ff73, 62px -363.66667px #0088ff, 244px -170.66667px #0062ff, 224px -142.66667px #b300ff, 141px -208.66667px #9000ff, 211px -285.66667px #ff6600, 181px -128.66667px #1e00ff, 90px -123.66667px #c800ff, 189px 70.33333px #00ffc8, -18px -383.66667px #00ff33, 100px -6.66667px #ff008c;
  -moz-animation: 1s bang ease-out infinite backwards, 1s gravity ease-in infinite backwards, 5s position linear infinite backwards;
  -webkit-animation: 1s bang ease-out infinite backwards, 1s gravity ease-in infinite backwards, 5s position linear infinite backwards;
  -o-animation: 1s bang ease-out infinite backwards, 1s gravity ease-in infinite backwards, 5s position linear infinite backwards;
  -ms-animation: 1s bang ease-out infinite backwards, 1s gravity ease-in infinite backwards, 5s position linear infinite backwards;
  animation: 1s bang ease-out infinite backwards, 1s gravity ease-in infinite backwards, 5s position linear infinite backwards; }

.pyro > .after {
  -moz-animation-delay: 1.25s, 1.25s, 1.25s;
  -webkit-animation-delay: 1.25s, 1.25s, 1.25s;
  -o-animation-delay: 1.25s, 1.25s, 1.25s;
  -ms-animation-delay: 1.25s, 1.25s, 1.25s;
  animation-delay: 1.25s, 1.25s, 1.25s;
  -moz-animation-duration: 1.25s, 1.25s, 6.25s;
  -webkit-animation-duration: 1.25s, 1.25s, 6.25s;
  -o-animation-duration: 1.25s, 1.25s, 6.25s;
  -ms-animation-duration: 1.25s, 1.25s, 6.25s;
  animation-duration: 1.25s, 1.25s, 6.25s; }

@-webkit-keyframes bang {
  from {
    box-shadow: 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white; } }
@-moz-keyframes bang {
  from {
    box-shadow: 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white; } }
@-o-keyframes bang {
  from {
    box-shadow: 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white; } }
@-ms-keyframes bang {
  from {
    box-shadow: 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white; } }
@keyframes bang {
  from {
    box-shadow: 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white, 0 0 white; } }
@-webkit-keyframes gravity {
  to {
    transform: translateY(200px);
    -moz-transform: translateY(200px);
    -webkit-transform: translateY(200px);
    -o-transform: translateY(200px);
    -ms-transform: translateY(200px);
    opacity: 0; } }
@-moz-keyframes gravity {
  to {
    transform: translateY(200px);
    -moz-transform: translateY(200px);
    -webkit-transform: translateY(200px);
    -o-transform: translateY(200px);
    -ms-transform: translateY(200px);
    opacity: 0; } }
@-o-keyframes gravity {
  to {
    transform: translateY(200px);
    -moz-transform: translateY(200px);
    -webkit-transform: translateY(200px);
    -o-transform: translateY(200px);
    -ms-transform: translateY(200px);
    opacity: 0; } }
@-ms-keyframes gravity {
  to {
    transform: translateY(200px);
    -moz-transform: translateY(200px);
    -webkit-transform: translateY(200px);
    -o-transform: translateY(200px);
    -ms-transform: translateY(200px);
    opacity: 0; } }
@keyframes gravity {
  to {
    transform: translateY(200px);
    -moz-transform: translateY(200px);
    -webkit-transform: translateY(200px);
    -o-transform: translateY(200px);
    -ms-transform: translateY(200px);
    opacity: 0; } }
@-webkit-keyframes position {
  0%, 19.9% {
    margin-top: 10%;
    margin-left: 40%; }

  20%, 39.9% {
    margin-top: 40%;
    margin-left: 30%; }

  40%, 59.9% {
    margin-top: 20%;
    margin-left: 70%; }

  60%, 79.9% {
    margin-top: 30%;
    margin-left: 20%; }

  80%, 99.9% {
    margin-top: 30%;
    margin-left: 80%; } }
@-moz-keyframes position {
  0%, 19.9% {
    margin-top: 10%;
    margin-left: 40%; }

  20%, 39.9% {
    margin-top: 40%;
    margin-left: 30%; }

  40%, 59.9% {
    margin-top: 20%;
    margin-left: 70%; }

  60%, 79.9% {
    margin-top: 30%;
    margin-left: 20%; }

  80%, 99.9% {
    margin-top: 30%;
    margin-left: 80%; } }
@-o-keyframes position {
  0%, 19.9% {
    margin-top: 10%;
    margin-left: 40%; }

  20%, 39.9% {
    margin-top: 40%;
    margin-left: 30%; }

  40%, 59.9% {
    margin-top: 20%;
    margin-left: 70%; }

  60%, 79.9% {
    margin-top: 30%;
    margin-left: 20%; }

  80%, 99.9% {
    margin-top: 30%;
    margin-left: 80%; } }
@-ms-keyframes position {
  0%, 19.9% {
    margin-top: 10%;
    margin-left: 40%; }

  20%, 39.9% {
    margin-top: 40%;
    margin-left: 30%; }

  40%, 59.9% {
    margin-top: 20%;
    margin-left: 70%; }

  60%, 79.9% {
    margin-top: 30%;
    margin-left: 20%; }

  80%, 99.9% {
    margin-top: 30%;
    margin-left: 80%; } }
@keyframes position {
  0%, 19.9% {
    margin-top: 10%;
    margin-left: 40%; }

  20%, 39.9% {
    margin-top: 40%;
    margin-left: 30%; }

  40%, 59.9% {
    margin-top: 20%;
    margin-left: 70%; }

  60%, 79.9% {
    margin-top: 30%;
    margin-left: 20%; }

  80%, 99.9% {
    margin-top: 30%;
    margin-left: 80%; } }
`
