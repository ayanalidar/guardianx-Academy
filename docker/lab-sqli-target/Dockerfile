# GuardianX Lab — SQL Injection Target
# A vulnerable PHP login page that concatenates user input into SQL queries.
# The dynamic flag is injected via environment variable and written to /root/flag.txt

FROM php:8.2-apache

# Enable MySQL extension
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Create the flag directory
RUN mkdir -p /root && chmod 700 /root

# Copy the vulnerable application
COPY app/ /var/www/html/
RUN chown -R www-data:www-data /var/www/html

# Create the flag injection script
# The orchestrator sets FLAG env var; this script writes it to /root/flag.txt
COPY inject-flag.sh /inject-flag.sh
RUN chmod +x /inject-flag.sh

# Create a fake database using SQLite (no MySQL needed)
RUN mkdir -p /var/lib/sqlite && \
    sqlite3 /var/lib/sqlite/vulnapp.db << 'SQL'
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    flag TEXT
);
INSERT INTO users (username, password, email, flag) VALUES 
    ('admin', 'supersecret123', 'admin@vulnapp.local', 'FLAG_PLACEHOLDER'),
    ('guest', 'guest123', 'guest@vulnapp.local', NULL),
    ('user1', 'password1', 'user1@vulnapp.local', NULL),
    ('user2', 'password2', 'user2@vulnapp.local', NULL);
SQL

# Set permissions
RUN chown -R www-data:www-data /var/lib/sqlite

# Expose HTTP
EXPOSE 80

# Start: inject flag, then start Apache
CMD ["/bin/bash", "-c", "/inject-flag.sh && apache2-foreground"]
