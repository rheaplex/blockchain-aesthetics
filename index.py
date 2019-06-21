import glob

DIRS = ['bitcoin-html5', 'dogecoin-html5', 'ethereum-html5']
OUTFILE = 'index.html'

html = "<html><head><title>Blockchain Aesthetics</title></head><body>\n"

def dedir(dir):
    return dir.replace('-', ' ').title()

def defile(htmlfile):
    return dedir(htmlfile.split('/')[1].split('.')[0])

for dir in DIRS:
    html += '<h1>' + dedir(dir) + "</h1>\n<ul>"
    htmlfiles = glob.glob(dir + '/' + '*.html')
    htmlfiles.sort()
    for htmlfile in htmlfiles:
        html += '<li><a href="./' + htmlfile + '">' + defile(htmlfile) + "</a></li>\n"
    html += "</ul>\n"

html += "</body></html>\n"

with open(OUTFILE, 'w') as out:
    out.write(html)
