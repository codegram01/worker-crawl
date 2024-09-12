export default {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
  
      const crawlUrl = url.searchParams.get('crawlUrl'); 
      const returnText = url.searchParams.has('text')
  
      const helpMess = `
  Useage: call crawl like this: https://crawl.wingram.org?crawlUrl=https://example.com\n
  Return html of website: https://crawl.wingram.org?crawlUrl=https://example.com&text\n
  Docs: https://github.com/codegram01/worker-crawl\n
  Video i created: \n
  `
      if (!crawlUrl) {
        return new Response(helpMess, { status: 400 });
      }
      const resCrawl = await fetch(crawlUrl);
  
      const data = {
        url: crawlUrl,
        title: "",
        meta: [],
        link: [],
        text: ""
      };
  
      class TitleHandler {
        text(text) {
          if(text.text) {
            data.title = text.text
          }
        }
      }
      class MetaHandler {
        element(element) {
          const name = element.getAttribute("name")
          const property = element.getAttribute("property")
          const content = element.getAttribute("content")
          if((name || property) && content) { 
            data.meta.push({
              name: name,
              property: property,
              content: content,
            })
          }
        }
      }
      class LinkHandler {
        element(element) {
          const rel = element.getAttribute("rel")
          const href = element.getAttribute("href")
          const type = element.getAttribute("type")
          if(rel && href) {
            data.link.push({
              rel: rel,
              href: href,
              type: type
            })
          }
        }
      }
  
      const rewriter = new HTMLRewriter()
      .on("title", new TitleHandler())
      .on("meta", new MetaHandler())
      .on("link", new LinkHandler())
  
      const textRewriter = await rewriter.transform(resCrawl).text();
  
      if(returnText) {
        data.text = textRewriter
      }
  
      const res = Response.json(data);
      res.headers.set("Access-Control-Allow-Origin",  "*");
  
      return res
    },
  };