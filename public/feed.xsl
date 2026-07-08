<?xml version="1.0" encoding="UTF-8"?>
<!--
  Renders /feed.xml as a readable, on-brand page when opened in a browser.
  Feed readers ignore this entirely; the RSS stays pure RSS.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/></title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          :root {
            color-scheme: light dark;
            --paper: #f9f6ef; --vellum: #f2ecdf;
            --ink: #201c16; --ink-muted: #5d554a; --ink-faint: #6f6656;
            --rule: #e6ddcd; --accent: #8a5a2b; --accent-strong: #6f4720;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --paper: #171410; --vellum: #211c15;
              --ink: #ece4d6; --ink-muted: #b4a994; --ink-faint: #968b7c;
              --rule: #352e23; --accent: #c99a5e; --accent-strong: #ddb27f;
            }
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background: var(--paper); color: var(--ink);
            font-family: "Iowan Old Style", Georgia, serif;
            line-height: 1.65; padding: 3rem 1.5rem 5rem;
          }
          .wrap { max-width: 40rem; margin: 0 auto; }
          .masthead { text-align: center; padding-bottom: 1.5rem; border-bottom: 1px solid var(--rule); }
          .masthead a { font-size: 1.8rem; color: var(--ink); text-decoration: none; letter-spacing: -0.02em; }
          .masthead em { color: var(--accent); }
          .eyebrow {
            font-family: "Avenir Next", "Segoe UI", sans-serif;
            font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase;
            color: var(--ink-faint);
          }
          .about {
            margin-top: 2rem; background: var(--vellum);
            border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
            padding: 1.6rem 1.5rem; font-size: 0.98rem; color: var(--ink-muted);
          }
          .about strong { color: var(--ink); font-weight: 600; }
          .about code {
            font-family: ui-monospace, Menlo, monospace; font-size: 0.85em;
            background: var(--paper); padding: 0.15em 0.45em; border: 1px solid var(--rule);
          }
          .about a { color: var(--accent-strong); }
          h2.section {
            margin-top: 2.8rem; padding-bottom: 0.8rem; border-bottom: 1px solid var(--rule);
            font-family: "Avenir Next", "Segoe UI", sans-serif;
            font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase;
            color: var(--ink-faint); font-weight: 500;
          }
          .item { padding: 1.6rem 0; border-bottom: 1px solid var(--rule); }
          .item .date { font-family: "Avenir Next", "Segoe UI", sans-serif; font-size: 0.75rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-faint); }
          .item h3 { margin-top: 0.5rem; font-size: 1.35rem; font-weight: 500; letter-spacing: -0.01em; }
          .item h3 a { color: var(--ink); text-decoration: none; }
          .item h3 a:hover { color: var(--accent-strong); }
          .item p { margin-top: 0.55rem; color: var(--ink-muted); font-size: 1rem; }
          .empty { padding: 2.5rem 0; color: var(--ink-muted); text-align: center; font-style: italic; }
          .diamond { width: 7px; height: 7px; background: var(--accent); transform: rotate(45deg); margin: 2.2rem auto 0; opacity: 0.75; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <header class="masthead">
            <p class="eyebrow" style="margin-bottom:0.9rem;">Essay feed</p>
            <a href="/">Writing<em>Faith</em></a>
          </header>

          <div class="about">
            <p><strong>This page is a feed</strong> — a way to follow new essays
            without an account or algorithm. Copy this page's address
            (<code>/feed.xml</code>) into any feed reader, such as Feedly,
            NetNewsWire, or Reeder, and new essays will arrive there as they're
            published.</p>
            <p style="margin-top:0.8rem;">Prefer email? <a href="/#newsletter-heading">Join the
            newsletter</a> instead — one email per essay, nothing else.</p>
          </div>

          <h2 class="section">Latest essays</h2>
          <xsl:choose>
            <xsl:when test="/rss/channel/item">
              <xsl:for-each select="/rss/channel/item">
                <article class="item">
                  <p class="date"><xsl:value-of select="substring(pubDate, 1, 16)"/></p>
                  <h3><a href="{link}"><xsl:value-of select="title"/></a></h3>
                  <p><xsl:value-of select="description"/></p>
                </article>
              </xsl:for-each>
            </xsl:when>
            <xsl:otherwise>
              <p class="empty">The first essay is on its way — subscribe now and it will find you.</p>
            </xsl:otherwise>
          </xsl:choose>

          <div class="diamond"></div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
