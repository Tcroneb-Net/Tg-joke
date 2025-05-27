<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Telegram Bot Terminal - Anime Fetch & Deploy</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap');
  body {
    background: #001a4d;
    color: #0f0;
    font-family: 'Source Code Pro', monospace;
    margin: 0;
    padding: 20px;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }
  #terminal {
    background-color: #001122;
    border: 2px solid #0f0;
    border-radius: 6px;
    flex-grow: 1;
    padding: 15px;
    overflow-y: auto;
    white-space: pre-wrap;
  }
  #input-container {
    display: flex;
    margin-top: 10px;
  }
  #prompt {
    padding-right: 10px;
    font-weight: bold;
    font-size: 1.2rem;
    user-select: none;
  }
  #cmdline {
    flex-grow: 1;
    font-family: inherit;
    font-size: 1.2rem;
    background: transparent;
    border: none;
    color: #0f0;
    outline: none;
  }
</style>
</head>
<body>

<div id="terminal" aria-label="Terminal output"></div>
<div id="input-container">
  <span id="prompt">$</span>
  <input id="cmdline" autocomplete="off" spellcheck="false" autofocus />
</div>

<script>
  const terminal = document.getElementById('terminal');
  const cmdline = document.getElementById('cmdline');

  function writeOutput(text) {
    terminal.innerHTML += text + '\n';
    terminal.scrollTop = terminal.scrollHeight;
  }

  async function fetchAnime() {
    try {
      const res = await fetch('https://random-bot-sooty.vercel.app/anime');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      writeOutput('Anime List:');
      data.forEach((a, i) => writeOutput(`${i + 1}. ${a.name || a.title || 'Untitled'}`));
    } catch (e) {
      writeOutput('Error fetching anime data: ' + e.message);
    }
  }

  async function runCommand(cmd) {
    if (!cmd.trim()) return;
    writeOutput('$ ' + cmd);
    const [command, ...args] = cmd.split(' ');

    switch (command.toLowerCase()) {
      case 'help':
        writeOutput(`Commands:
  help        - show available commands
  clear       - clear the terminal
  anime       - fetch anime list
  dns         - DNS lookup: dns google.com
  domain      - List domains
  deploy      - Deploy your own bot
`);
        break;

      case 'clear':
        terminal.innerHTML = '';
        break;

      case 'anime':
        await fetchAnime();
        break;

      case 'dns':
        if (args[0]) {
          try {
            const host = args[0];
            const res = await fetch(\`https://networkcalc.com/api/dns/lookup/\${host}\`);
            if (!res.ok) throw new Error('Network response not ok');
            const json = await res.json();
            writeOutput(JSON.stringify(json, null, 2));
          } catch (e) {
            writeOutput('DNS lookup error: ' + e.message);
          }
        } else {
          writeOutput('Usage: dns <hostname>');
        }
        break;

      case 'domain':
        try {
          const d = await fetch('https://networkcalc.com/api/domains/');
          if (!d.ok) throw new Error('Network response not ok');
          const j = await d.json();
          writeOutput(JSON.stringify(j, null, 2));
        } catch (e) {
          writeOutput('Error fetching domains: ' + e.message);
        }
        break;

      case 'deploy':
        writeOutput('Starting deployment...');
        setTimeout(() => {
          const token = prompt('Enter your Telegram BOT Token:');
          const chat = prompt('Enter your Chat ID:');
          if (!token || !chat) {
            writeOutput('Deployment cancelled.');
            return;
          }
          writeOutput('Cloning bot repo...');
          setTimeout(() => {
            writeOutput('Installing dependencies...');
            setTimeout(() => {
              writeOutput('Deploying bot...');
              setTimeout(() => {
                writeOutput(`Bot deployed and started successfully!\nBot will send anime data from your API.\n\nUse this backend code to host:\n`);
                writeOutput(`------ BOT CODE START ------\n` +
`const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const bot = new TelegramBot('${token}', { polling: true });

bot.onText(/\\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Fetching anime...');
  fetch('https://random-bot-sooty.vercel.app/anime')
    .then(res => res.json())
    .then(data => {
      const list = data.map((a, i) => \`\${i + 1}. \${a.name || a.title || 'Untitled'}\`).join('\\n');
      bot.sendMessage(msg.chat.id, list);
    });
});
------ BOT CODE END ------`);
              }, 2000);
            }, 1500);
          }, 1000);
        }, 500);
        break;

      default:
        writeOutput(`Unknown command: ${command}`);
    }
  }

  cmdline.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const input = cmdline.value;
      cmdline.value = '';
      await runCommand(input);
    }
  });

  writeOutput('Welcome to the Bot Terminal.\nType "help" for available commands.');
</script>

</body>
</html>
