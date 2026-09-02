<?php
// GuardianX Lab — Vulnerable SQL Injection Login Page
// WARNING: This is intentionally vulnerable. DO NOT use in production.

session_start();
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // VULNERABLE: Direct concatenation into SQL query (no parameterized query)
    $db = new SQLite3('/var/lib/sqlite/vulnapp.db');
    $query = "SELECT * FROM users WHERE username='$username' AND password='$password'";
    
    $result = $db->query($query);
    
    if ($result && $row = $result->fetchArray(SQLITE3_ASSOC)) {
        $_SESSION['user'] = $row['username'];
        $_SESSION['logged_in'] = true;
        header('Location: dashboard.php');
        exit;
    } else {
        $error = 'Invalid credentials. Try again.';
    }
    $db->close();
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>VulnApp — Login</title>
    <style>
        body { font-family: monospace; background: #1a1a2e; color: #e8f5ee; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .login-box { background: #16213e; padding: 30px; border-radius: 10px; border: 1px solid #0f3460; width: 350px; }
        h1 { color: #10b981; text-align: center; }
        input { width: 100%; padding: 10px; margin: 8px 0; background: #0f3460; border: 1px solid #10b981; color: #e8f5ee; border-radius: 5px; box-sizing: border-box; }
        button { width: 100%; padding: 10px; background: #10b981; color: #0a0f0d; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
        button:hover { background: #34d399; }
        .error { color: #ef4444; text-align: center; font-size: 14px; }
        .hint { color: #6b7d75; font-size: 12px; text-align: center; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="login-box">
        <h1>🔑 VulnApp Login</h1>
        <?php if ($error): ?>
            <p class="error"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        <p class="hint">Hint: Try admin' OR '1'='1' --</p>
    </div>
</body>
</html>
