//  Mock database 
const mockDatabase = {
  'https://example.com/':              { exists: true, type: 'folder' },
  'https://example.com/about':         { exists: true, type: 'folder' },
  'https://example.com/readme.txt':    { exists: true, type: 'file' },
  'https://example.com/logo.png':      { exists: true, type: 'file' },
  'https://files.mysite.org/':         { exists: true, type: 'folder' },
  'https://files.mysite.org/data.csv': { exists: true, type: 'file' },
};

//  Mock server call 
function checkUrl(url) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = mockDatabase[url] || mockDatabase[url + '/'];
      resolve(result || { exists: false });
    }, 300);
  });
}

let latestRequestId = 0;

function checkAndShow(url) {
  const myId = ++latestRequestId;

  checkUrl(url).then(result => {
    if (myId !== latestRequestId) return; // Ignore the request,if a newer request has been made    
    if (result.exists) {
      showResult('found', 'Found', `The URL points to a ${result.type}.`);
    } else {
      showResult('not-found', 'Not Found', 'The URL does not exist.');
    }
  });
}

function throttle(fn, limitMs) {
  let coolingDown = false;
  return function(...args) {
    if (coolingDown) return;
    fn(...args);
    coolingDown = true;
    setTimeout(() => { coolingDown = false; }, limitMs);
  };
}

const throttledCheck = throttle(checkAndShow, 500);

//  DOM refs 
const urlInput      = document.getElementById('urlInput');
const resultBox     = document.getElementById('result');
const resultLabel   = document.getElementById('resultLabel');
const resultMessage = document.getElementById('resultMessage');

function showResult(state, label, message) {
  resultBox.className     = 'result visible ' + state;
  resultLabel.textContent = label;
  resultMessage.innerHTML = message;
}

function hideResult() {
  resultBox.className = 'result';
}


// Get the input value on every keystroke
urlInput.addEventListener('input', (e)=>{
    const value = e.target.value.trim();

    if(value === ''){
        hideResult();
        latestRequestId++;
        return;
    }
    try{
        new URL(value);
        showResult('checking', 'Checking…', 'Please wait while we check the URL.');
    }catch(err){
        showResult('error', 'Invalid URL', 'Please enter a valid URL.');
        latestRequestId++;
        return;
    }

    throttledCheck(value);
})
