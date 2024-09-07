#!/usr/bin/env python3

import urllib
from http.server import SimpleHTTPRequestHandler, HTTPServer
from datetime import datetime

host = "0.0.0.0"
port = 5000

class LoggingServer(SimpleHTTPRequestHandler):
    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        if self.path == "/log":
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            print(body)
            with open('server.log', 'ab') as f:
                f.write(body)
                f.write(b'\x0A')
            self.send_response(200)
            self.end_headers()


if __name__ == "__main__":
    server = HTTPServer( (host, port), LoggingServer )

    with open('server.log', 'at') as f:
        f.write(f"Starting: {datetime.now()}\n")

    print( f"Listening on http://{host}:{port}/" )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass

    server.server_close()
    print( "Server stopped" )

