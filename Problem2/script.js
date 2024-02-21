let currentTrade = {};
let tokens;
let isFromTokenSelected = false;
let isWalletConnected = false;

async function init() {
    await listAvailableTokens();
}

async function listAvailableTokens() {
    let response = await fetch('https://interview.switcheo.com/prices.json');
    let pricesData = await response.json();
  
    let tokenMap = {};
    pricesData.forEach(token => {
      if (tokenMap[token.currency] && new Date(tokenMap[token.currency].date) > new Date(token.date)) {
        return;
      }

      tokenMap[token.currency] = token;
    });
  
    tokens = Object.values(tokenMap);
  
    renderTokenList();
}
  

function renderTokenList() {
    let parent = document.getElementById("token_list");
    parent.innerHTML = ""; 
    tokens.forEach(token => {
      let div = document.createElement("div");
      div.className = "token_row";
      let html = `
        <img src="images/${token.currency}.svg" alt="${token.currency}" class="token_icon">
        <span class="token_list_text">${token.currency}</span>
      `;
      div.innerHTML = html;
      div.onclick = () => selectToken(token);
      parent.appendChild(div);
    });
}

function selectToken(token) {
    closeModal();

    if (currentSelectSide === 'to' && currentTrade.from && currentTrade.from.currency === token.currency) {
        alert("The sell and buy tokens cannot be the same. Please select a different token!");
        return;
    }

    currentTrade[currentSelectSide] = token;
    console.log("currentTrade:", currentTrade);
    renderToken(currentSelectSide);
    renderInterface();

    if (currentSelectSide === 'from') {
        isFromTokenSelected = true;
        document.getElementById("to_token_select").disabled = false;
    }
}

function renderInterface() {
    if (currentSelectSide === 'from' && currentTrade.from) {
      document.getElementById("from_token_text").innerHTML = currentTrade.from.currency;
      document.getElementById("from_token_placeholder").style.display = "none"; 
    } else if (currentSelectSide === 'to' && currentTrade.to) {
      document.getElementById("to_token_text").innerHTML = currentTrade.to.currency;
      document.getElementById("to_token_placeholder").style.display = "none"; 
    }
}
  
function renderToken(side) {
    let token = currentTrade[side];
    let textId = `${side}_token_text`;
    let imgId = `${side}_token_img`;
    let symbol = token ? token.currency : "Select Token";
    let imgSrc = token ? `images/${token.currency}.svg` : 'images/questionmark.svg'; 
    document.getElementById(textId).innerHTML = symbol;
    document.getElementById(imgId).src = imgSrc; 
}
  
function openModal(side) {
    if (side === 'to' && !isFromTokenSelected) {
        alert("Please select the token you want to sell first!");
        return;
    }

    currentSelectSide = side;
    document.getElementById("token_modal").style.display = "block";
}

function closeModal() {
    document.getElementById("token_modal").style.display = "none";
}

function validateAmount() {
    let fromAmount = document.getElementById("from_amount").value;
    let amount = Number(fromAmount);

    if (isNaN(amount)) {
        alert("Please enter a number (non negative) for the amount!");
        document.getElementById("from_amount").value = '';
        return false;
    }

    return true;
}

async function getPrice() {
    console.log("Getting Price");
    let fromAmount = document.getElementById("from_amount").value;
    let amount = Number(fromAmount);
    
    if (!fromAmount) {
      document.getElementById("to_amount").value = '';
      document.getElementById("from_amount_dollars").innerText = ''; 
      document.getElementById("to_amount_dollars").innerText = ''; 
      return;
    }

    if (!currentTrade.from || !currentTrade.to) {
        alert("Please select both of the tokens first!");
        document.getElementById("from_amount").value = ''; 
        return;
    }
  
    let fromPrice = currentTrade.from.price;
    let toPrice = currentTrade.to.price;

    let totalPrice = (amount * fromPrice) / toPrice;
  
    let fromTokenDollars = amount * fromPrice; 
    let toTokenDollars = amount * toPrice; 
    
    document.getElementById("to_amount").value = totalPrice.toFixed(2);
    document.getElementById("from_amount_dollars").innerText = `$${fromTokenDollars.toFixed(2)}`;
    document.getElementById("to_amount_dollars").innerText = `$${toTokenDollars.toFixed(2)}`; 
}

document.getElementById("from_amount").oninput = function() {
    if (validateAmount()) {
        getPrice();
        updateButtons();
    }
};

function connectWallet() {
    document.getElementById("loading").style.display = "block";

    setTimeout(() => {
        document.getElementById("loading").style.display = "none";
        alert("Wallet connected successfully!");
        isWalletConnected = true;
        updateButtons();
    }, 2000); 
}

function resetFields() {
    currentTrade = {};

    document.getElementById("from_token_text").innerHTML = '';
    document.getElementById("to_token_text").innerHTML = '';

    document.getElementById("from_token_img").src = 'images/questionmark.svg';
    document.getElementById("to_token_img").src = 'images/questionmark.svg';

    document.getElementById("from_token_placeholder").style.display = "block";
    document.getElementById("to_token_placeholder").style.display = "block";

    document.getElementById("from_amount").value = '';
    document.getElementById("to_amount").value = '';

    document.getElementById("from_amount_dollars").innerText = '';
    document.getElementById("to_amount_dollars").innerText = '';

    document.getElementById("connect_wallet").disabled = true;
    document.getElementById("swap").disabled = true;

    isWalletConnected = false;

    isFromTokenSelected = false;
}

function swapTokens() {
    document.getElementById("loading").style.display = "block";

    setTimeout(() => {
        document.getElementById("loading").style.display = "none";
        alert("Tokens swapped successfully!");
        resetFields();
    }, 2000); 
}

function updateButtons() {
    let fromAmount = document.getElementById("from_amount").value;
    let connectButton = document.getElementById("connect_wallet");
    let swapButton = document.getElementById("swap");

    if (currentTrade.from && currentTrade.to && fromAmount) {
        connectButton.disabled = false;
    } else {
        connectButton.disabled = true;
    }

    if (isWalletConnected) {
        swapButton.disabled = false;
    } else {
        swapButton.disabled = true;
    }
}
  
init();

document.getElementById("from_token_select").onclick = () => openModal("from");
document.getElementById("to_token_select").disabled = true;
document.getElementById("to_token_select").onclick = () => openModal("to");
document.getElementById("modal_close").onclick = closeModal;
document.getElementById("connect_wallet").disabled = true;
document.getElementById("connect_wallet").onclick = connectWallet;
document.getElementById("swap").disabled = true;
document.getElementById("swap").onclick = swapTokens;