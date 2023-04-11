import { ethers, utils, Wallet } from "./ethers-5.2.esm.min.js";

window.userWalletAddress = null;
const loginButton = document.getElementById("loginButton");
const docTextArea = document.getElementById("docTextArea");
const signButton = document.getElementById("signButton");
const userWallet = document.getElementById("userWallet");
const sigCard = document.querySelector(".sig-card");
const sigRes = document.getElementById("sig-res");
const sigResWrap = document.querySelector(".sig-res-wrap");

function toggleButton() {
  if (!window.ethereum) {
    loginButton.innerText = "MetaMask is not installed";
    return false;
  }

  loginButton.addEventListener("click", loginWithMetaMask);
}

async function loginWithMetaMask() {
  const accounts = await window.ethereum
    .request({ method: "eth_requestAccounts" })
    .catch((e) => {
      console.error(e.message);
      return;
    });
  if (!accounts) {
    return;
  }

  window.userWalletAddress = accounts[0];
  userWallet.innerText = `Logged in as: ${accounts[0].slice(0,6)}...${accounts[0].slice(-6)}`
  loginButton.innerText = "Sign out of MetaMask";

  toggleSigCard();

  loginButton.removeEventListener("click", loginWithMetaMask);
  setTimeout(() => {
    loginButton.addEventListener("click", signOutOfMetaMask);
  }, 200);
}

window.ethereum.on("accountsChanged", function (accounts) {
  window.userWalletAddress = accounts[0];
  userWallet.innerText = `Logged in as: ${accounts[0].slice(0,6)}...${accounts[0].slice(-6)}`
});

async function personalSign(message) {
  const messageHash = utils.keccak256(utils.toUtf8Bytes(message));
  let result;
  try {
    result = await window.ethereum.request({ method: "personal_sign", params: [messageHash, window.userWalletAddress] });
  }
  catch (err) {
    result = err.message
  }
  console.log(result)
  return result;
}

signButton.addEventListener("click", async () => {
  const message = docTextArea.value;
  if (!message) return;
  const res = await personalSign(message);
  if (res.slice(0, 2) === "0x") {
    sigRes.style.color = "#f4f4f4";
    sigRes.innerText = res;
  }
  else {
    sigRes.style.color = "#ec1c1c";
    sigRes.innerText = `Error: ${res}`;
  }
  sigResWrap.classList.remove("hidden");
})

function signOutOfMetaMask() {
  window.userWalletAddress = null;
  userWallet.innerText = "Click the button to launch Metamask";
  loginButton.innerText = "Sign in with MetaMask";

  toggleSigCard();

  loginButton.removeEventListener("click", signOutOfMetaMask);
  setTimeout(() => {
    loginButton.addEventListener("click", loginWithMetaMask);
  }, 3000);
}

function toggleSigCard() {
  if (sigCard.classList.contains('hidden')) {
    sigCard.classList.remove('hidden');
    setTimeout(function () {
      sigCard.classList.remove('visuallyhidden');
    }, 10);
  } else {
    sigCard.classList.add('visuallyhidden');    
    sigCard.addEventListener('transitionend', function (e) {
      docTextArea.value = "";
      sigResWrap.classList.add("hidden");
      sigCard.classList.add('hidden');
    }, {
      capture: false,
      once: true,
      passive: false
    });
  }
}

const qrcode = new QRCode(document.getElementById("sig-qr"), {
	width : 100,
	height : 100
});

window.addEventListener("DOMContentLoaded", () => {
  toggleButton();
});


