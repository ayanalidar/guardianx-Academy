<?php
// Dashboard — shown after successful login. Displays the flag if the user
// accessed it via SQL injection (UNION SELECT to read the flag column).

session_start();
if (!isset($_SESSION['logged_in'])) {
    header('Location: index.php');
    exit;
}

$db = new SQLite3('/var/lib/sqlite/vulnapp.db');
// If the user injected UNION SELECT, $_SESSION['user'] might contain the flag
// because the query returned extra columns.
?>
<!DOCTYPE html>
<html>
<head>
    <title>VulnApp — Dashboard</title>
    <style>
        body { font-family: monospace; background: #1a1a2e; color: #e8f5ee; margin: 0; padding: 20px; }
        .header { background: #16213e; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        h1 { color: #10b981; }
        .info { background: #0f3460; padding: 15px; border-radius: 5px; margin: 10px 0; }
        a { color: #10b981; }
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Welcome, <?= htmlspecialchars($_SESSION['user'] ?? 'Unknown') ?></h1>
        <p>You are logged in to VulnApp.</p>
    </div>
    <div class="info">
        <h3>📊 Your Profile</h3>
        <p>Username: <?= htmlspecialchars($_SESSION['user'] ?? 'N/A') ?></p>
        <p>The flag is stored in the database. Can you find it?</p>
        <p>Hint: Try UNION SELECT to extract all columns from the users table.</p>
    </div>
    <div class="info">
        <h3>🔍 Database Info</h3>
        <p>Table: users</p>
        <p>Columns: id, username, password, email, flag</p>
    </div>
    <p><a href="logout.php">Logout</a></p>
</body>
</html>
