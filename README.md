# Gaurav's academic website

A plain HTML, CSS and JavaScript site. No build step.

## Publish on GitHub Pages
1. Create a GitHub repository named `gauravsinghPhD.github.io`.
2. Upload all files in this folder to it.
3. Open Settings, then Pages, and deploy from the `main` branch, root folder.
4. Visit https://gauravsinghphd.github.io after a minute or two.

## Preview on your computer
Open a terminal in this folder and run `python -m http.server 8000`, then open http://localhost:8000.
(Opening the HTML files by double-click will not load the data files.)

## Add content (edit one entry, not HTML)
- Papers: `data/publications.json`
- Conferences: `data/conferences.json`
- Seminars and workshops: `data/seminars.json`
- Photos: put images in `assets/img/gallery/`, then list them in `data/gallery.json`
- Blog: copy `posts/_template.html`, then add an entry to `data/posts.json`

Entry formats:
- publication: `{"title","authors","venue","year","status","paper","code"}`
- conference or seminar: `{"name","place","date","role","note","link"}`
- gallery: `{"src","alt","caption"}`
- post: `{"slug","title","date","summary"}`

## Still to fill in
Search the site for `TODO`. Highlighted yellow text marks every placeholder.
Also add your photo (`assets/img/profile.jpg`), CV (`assets/cv.pdf`) and your public email.
