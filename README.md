# Bull Board Express.js

This is a simple example of using [Bull Board](https://github.com/felixmosh/bull-board) with [Express.js](https://expressjs.com/). This project is only for inspecting the queues and jobs that are running. It does not include any job processing.

## Getting Started

This project uses the following:

- [Node.js@20.3.0](https://nodejs.org/en/)
- [pnpm@8.6.2](https://pnpm.io/)
- `Redis`

```bash
git clone https://github.com/mr687/bullboard-express.git

cd bullboard-express
cp .env.example .env # Edit .env file

pnpm install
pnpm run dev

# Open http://localhost:3000/bull-board
```