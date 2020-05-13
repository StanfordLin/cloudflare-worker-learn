# MLH Fellowship 

I was trying to share my recent project in javascript, however b/c of NDA I signed, I cannot publicly share it. The publicly available project is the cloudflare challenge I recently took on, it doesn't span multiple files so that's why I included codeShare (more front end) to kind of make up for that, but codeShare is about 2 years old so obviously the cloudflare challenge represents my style of programming now.

## What is it?

Demo:
`https://cloudflare-stan.stanflare.workers.dev/`

Using Cloudflare Workers, this is an application that will randomly send users to one of two webpages. This project uses Cloudflare Workers API using the command-line tool Wrangler, and deployed to the workers.dev deployment playground.

## Features
- Fetch and parse a request from the URL `https://cfw-takehome.developers.workers.dev/api/variants`
- Returns one of the URLs randomly with about 50% probability A/B testing style
- Deployed publicly
- HTML/CSS is injected and rewritten with customized HTML/CSS components, such as the fireworks effect
- The variant is persisted via a cookie for 10 seconds so that the same variant is seen when someone refreshes the page
- Takes advantage of cloudflare's CDN network with cold starts under 5ms, serverless, and automatic scaling
