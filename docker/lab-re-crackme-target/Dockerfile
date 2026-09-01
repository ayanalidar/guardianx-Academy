# GuardianX Lab — Reverse Engineering Crackme Target
# A stripped ELF binary with a key validation algorithm.

FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-server gcc gdb file strings \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create SSH config
RUN mkdir /run/sshd && \
    echo 'root:crackme123' | chpasswd && \
    sed -i 's/#PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config

# Create the crackme binary source
RUN cat > /tmp/crackme.c << 'CEOF'
#include <stdio.h>
#include <string.h>
// Key: GUARD1AN_X_K3Y (XOR'd with 0x42, length 15)
int main(int argc, char *argv[]) {
    if (argc != 2) {
        printf("Usage: %s <key>\n", argv[0]);
        return 1;
    }
    char expected[] = {0x15,0x17,0x16,0x0b,0x1b,0x10,0x1c,0x18,0x2b,0x1d,0x09,0x11,0x29,0x0d,0x2b};
    char input[64];
    strncpy(input, argv[1], 63);
    int len = strlen(input);
    if (len != 15) { printf("Denied.\n"); return 1; }
    for (int i = 0; i < 15; i++) {
        if ((input[i] ^ 0x42) != expected[i]) { printf("Denied.\n"); return 1; }
    }
    printf("Access Granted!\n");
    // Read and print flag
    FILE *f = fopen("/root/flag.txt", "r");
    if (f) { char buf[256]; fgets(buf, 256, f); printf("%s\n", buf); fclose(f); }
    return 0;
}
CEEOF

# Compile and strip the binary
RUN gcc -o /home/guardian/crackme /tmp/crackme.c && \
    strip /home/guardian/crackme && \
    rm /tmp/crackme.c && \
    chmod 755 /home/guardian/crackme

# Create user
RUN useradd -m -s /bin/bash guardian && \
    echo 'guardian:guardian123' | chpasswd

# Copy flag injection script
COPY inject-flag.sh /inject-flag.sh
RUN chmod +x /inject-flag.sh

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 22
CMD ["/start.sh"]
