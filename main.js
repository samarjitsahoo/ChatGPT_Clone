import { GoogleGenerativeAI } from "@google/generative-ai";
import md from "markdown-it";
import Typed from 'typed.js';

document.addEventListener('DOMContentLoaded', function () {
  var typed = new Typed('.text', {
    strings: ["Let's create", "Let's brainstorm", "Let's go", "SamarGPT", "Let's explore", "Let's collaborate", "Let's invent", "SamarGPT", "Let's design", "Let's chit-chat", "Let's discover", "SamarGPT"],
    typeSpeed: 12,
    backSpeed: 12,
    backDelay: 1500,
    loop: true
  });
});

document.getElementById('redirectButton').addEventListener('click', function () {
  document.getElementById('first-main').style.display = 'none';
  document.getElementById('second-main').style.display = 'flex';
});

const genAI = new GoogleGenerativeAI(`${import.meta.env.VITE_API_KEY}`);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

let history = [];

async function getResponse(prompt) {
  try {
    const chat = await model.startChat({ history: history });
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = await response.text();

    return text;
  } catch (error) {
    console.error("Error getting AI response. Please reload page and try again later. Error:", error);
    throw new Error("Failed to get response from AI. Please reload page and try again later.");
  }
}

export const userDiv = (data) => {
  return `
  <!-- User Chat -->
  <div class="flex items-center gap-2 justify-center fit-content w-auto max-w-full">
    <img
      src="samarjit.jpeg"
      alt="user icon"
      class="w-10 h-10 rounded-full"
    />
    <p class="text-black p-1"><span class="font-bold">You</span><br>
      ${data}
    </p>
  </div>
  `;
};

export const aiDiv = (data, id) => {
  return `
  <!-- AI Chat -->
  <div id="ai-response-container-${id}" class="flex gap-2 justify-center items-start w-full overflow-hidden whitespace-normal break-words">
    <img src="chatGPT.png" alt="user icon" class="w-10 h-10 rounded-full" />
    <div id="ai-response-${id}" class="text-black p-1">
        <span class="font-bold">SamarGPT</span><br>
        <span id="ai-response-text-${id}">${data}</span>
        <span id="cursor-${id}" class="circle-cursor"></span>
    </div>
  </div>
  `;
};

function scrollToBottom() {
  const chatArea = document.getElementById("chat-container");
  chatArea.scrollTop = chatArea.scrollHeight;
}

function appendCharacterByCharacter(text, id) {
  const aiResponseContainer = document.getElementById(`ai-response-text-${id}`);
  const cursor = document.getElementById(`cursor-${id}`);
  let index = 0;

  function appendNextCharacter() {
    if (index < text.length) {
      aiResponseContainer.innerHTML += text[index];
      index++;
      scrollToBottom();
      setTimeout(appendNextCharacter, 9);
    } else {
      let md_text = md().render(aiResponseContainer.innerHTML);
      aiResponseContainer.innerHTML = md_text;
      cursor.style.display = 'none';
      scrollToBottom();
    }
  }
  appendNextCharacter();
}

async function handleSubmit(event) {
  event.preventDefault();

  let userMessage = document.getElementById("prompt");
  const chatArea = document.getElementById("chat-container");

  var prompt = userMessage.value.trim();
  if (prompt === "") {
    return;
  }

  console.log("user message", prompt);

  chatArea.innerHTML += userDiv(prompt);
  userMessage.value = "";

  const uniqueId = history.length;

  chatArea.innerHTML += aiDiv("", uniqueId);

  scrollToBottom();

  try {
    const aiResponse = await getResponse(prompt);
    appendCharacterByCharacter(aiResponse, uniqueId);

    let newUserRole = {
      role: "user",
      parts: [{ text: prompt }],
    };
    let newAIRole = {
      role: "model",
      parts: [{ text: aiResponse }],
    };

    history.push(newUserRole);
    history.push(newAIRole);

    console.log(history);
  } catch (error) {
    console.error(error);
    const errorMessage = "An Error occurred. Please reload page and try again later.";
    appendCharacterByCharacter(errorMessage, uniqueId);
  }
}

const style = document.createElement('style');
style.innerHTML = `
  .circle-cursor {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-left: 5px;
    border-radius: 50%;
    background-color: black;
    animation: swell 1s infinite;
  }

  @keyframes swell {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.5);
    }
  }
`;
document.head.appendChild(style);

const chatForm = document.getElementById("chat-form");
chatForm.addEventListener("submit", handleSubmit);

chatForm.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) handleSubmit(event);
});
