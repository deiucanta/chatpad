# Onerocket-Chatpad

Fork of chatpad with built in features to support the Onerocket.ai API. 

Onerocket is an AI broker/aggregator designed to provide a single path to many LLMs and AI system. Additionally, it also provides simple one request endpoints to execute more complicated logic. 

## Self-host using Docker

```
docker run --name chatpad -d -p 8080:80 ghcr.io/deiucanta/chatpad:latest
```

## Self-host using Docker with custom config

```
docker run --name chatpad -d -v `pwd`/config.json:/usr/share/nginx/html/config.json -p 8080:80 ghcr.io/deiucanta/chatpad:latest
```

## Give Feedback

If you have any feature requests or bug reports, go to [feedback.chatpad.ai](https://feedback.chatpad.ai).

## Contribute

This is a React.js application. Clone the project, run `npm i` and `npm start` and you're good to go.

## Credits

- [ToDesktop](https://todesktop.com) - A simple way to make your web app into a beautiful desktop app
- [DexieJS](https://dexie.org) - A Minimalistic Wrapper for IndexedDB
- [Mantine](https://mantine.dev) - A fully featured React component library
