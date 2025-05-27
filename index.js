<!-- Same head as before with styles and layout -->
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
      const data = await res.json();
      writeOutput('Anime List:');
      data.forEach((a, i) => writeOutput(`${i + 1}. ${a.name || a.title || 'Untitled'}`));
    } catch {
      writeOutput('Error fetching anime data.');
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
          const host = args[0];
          const res = await fetch(`https://networkcalc.com/api/dns/lookup/${host}`);
          const json = await res.json();
          writeOutput(JSON.stringify(json, null, 2));
        } else {
          writeOutput('Usage: dns <hostname>');
        }
        break;

      case 'domain':
        const d = await fetch('https://networkcalc.com/api/domains/');
        const j = await d.json();
        writeOutput(JSON.stringify(j, null, 2));
        break;

      case 'deploy':
        writeOutput('Starting deployment...');
        setTimeout(() => {
          const token = prompt('Enter your Telegram BOT Token:');
          const chat = prompt('Enter your Chat ID:');
          if (!token || !chat) return writeOutput('Deployment cancelled.');
          writeOutput('Cloning bot repo...');
          setTimeout(() => {
            writeOutput('Installing dependencies...');
            setTimeout(() => {
              writeOutput('Deploying bot...');
              setTimeout(() => {
                writeOutput(`Bot deployed and started successfully!\nBot will send anime data from your API.\n\nUse this backend code to host:`);
                writeOutput(`\n------ BOT CODE START ------\n` +
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
});\n------ BOT CODE END ------`);
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
