# Google search setup

The site uses the existing free address:
https://archipelagoing.github.io/DeviKavachamEnglish/
No paid domain or advertising is needed for this setup.

## Prepared in the repository

- Descriptive titles and descriptions for the reading pages and guides.
- Canonical URLs that identify the project homepage as the preferred version
  of both reader themes; Contents and About each have their own canonical URL.
- A generated `sitemap.xml` containing those three preferred pages.
- The complete reading text in the initial HTML, available without JavaScript.
- Print-only HTML exports marked `noindex`; downloadable PDF/EPUB files remain
  available. The sitemap focuses on reading and guide pages.

Run `python3 build.py` after editing the website source or templates, then
`python3 build.py --check`. The check validates source preservation and search
metadata. Deploy the generated pages, sitemap, and assets together through the
repository's existing GitHub Pages setup. Local verification does not publish
the files or establish Google indexing.

## Connect Google Search Console

1. Sign in to [Google Search Console](https://search.google.com/search-console/)
   and add a **URL-prefix** property for the exact site address above. Use this
   property type because the project does not control DNS for `github.io`.
2. Choose **HTML tag** verification and copy the token from the tag's `content`
   attribute into a new root file named `search-console-verification.txt`. Save
   only the token, without the surrounding tag or quotation marks. This token
   is intended to be published; never put your account password in this file.
3. Run `python3 build.py`. The builder adds the verification meta tag to all
   four public pages and preserves it on later rebuilds. Include the token file
   and generated pages in the deployment so future rebuilds keep the tag.
4. Once the homepage contains the tag on the live site, click **Verify** in
   Search Console. Keep the tag in place after verification.
5. In **Sitemaps**, submit
   `https://archipelagoing.github.io/DeviKavachamEnglish/sitemap.xml`.
6. Use **URL Inspection** on the homepage, Contents, and About. Check the live
   URL, review crawl/indexing findings, and request indexing where appropriate.
7. Check the indexing reports again after Google has processed the requests.
   Record exclusions and address specific issues; submitting a sitemap or
   request does not establish that a page has been indexed or ranked.

If Google offers an HTML verification file instead, its unchanged file can be
placed at the repository root and deployed. Do not fabricate a filename or
token, and keep that verification file available afterward.

## Hosting details

All sitemap and canonical URLs include `/DeviKavachamEnglish/`. A `robots.txt`
inside that project directory does not control crawling: crawlers consult the
host-root URL `https://archipelagoing.github.io/robots.txt`. No project-local
robots file is added. Check the host-root response and live page headers if
Search Console reports blocked crawling.

## Evidence and outstanding work

On 2026-10-13, the public homepage returned HTTP 200 and its downloaded HTML had
no robots meta tag or `X-Robots-Tag` response header. The host-root robots URL
returned HTTP 404, rather than a crawl-disallowing file. The homepage still
contained the old title and no canonical link at
that point. A web search for the project-site address returned no results; this
alone does not prove the site is absent from Google's index.

The verification token has not been supplied, account ownership has not been
verified, and no sitemap or indexing request has been submitted through Search
Console in this session. Record the live deployment and account-side results
separately from the local code checks.

References: Google's [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide),
[canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls),
and [URL Inspection guidance](https://support.google.com/webmasters/answer/9012289).
