<?php
// skylineapi.php - Backend for Skyline Savannah Tours
// STATUS: ROBUST LOGIN + TABLE AUTO-CREATION + EMAIL NOTIFICATIONS

// 1. CORS & HEADERS
$allowed_origin = $_SERVER['HTTP_ORIGIN'] ?? "*";
header("Access-Control-Allow-Origin: $allowed_origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// 2. CONFIGURATION

// -- Simple Env Loader (No Composer) --
function loadEnv($path) {
    if (!file_exists($path)) {
        return false; 
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Load .env if it exists
loadEnv(__DIR__ . '/.env');

$host = getenv('DB_HOST') ?: 'localhost';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: '';
$db_name = getenv('DB_NAME') ?: 'skyline_db';
$jwt_secret = getenv('JWT_SECRET') ?: 'default_secret_change_me';

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
try {
    $conn = new mysqli($host, $db_user, $db_pass, $db_name);
    $conn->set_charset("utf8mb4");
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]); // Debugging
    exit;
}

// 3. HELPERS
function getJsonInput() { 
    $in = file_get_contents('php://input'); 
    return $in ? json_decode($in, true) : []; 
}

function generateUuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

function checkAuth() {
    global $jwt_secret;
    $headers = [];
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
    }
    $auth = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s(\S+)/', $auth, $matches)) {
        http_response_code(401); echo json_encode(["error" => "Unauthorized: Missing Token"]); exit;
    }
    $tokenParts = explode('.', $matches[1]);
    if (count($tokenParts) !== 2) { 
        http_response_code(401); echo json_encode(["error" => "Invalid Token Format"]); exit; 
    }
    $encodedPayload = $tokenParts[0];
    $signature = $tokenParts[1];
    if (hash_hmac('sha256', $encodedPayload, $jwt_secret) !== $signature) {
         http_response_code(401); echo json_encode(["error" => "Invalid Token Signature"]); exit;
    }
    $payload = json_decode(base64_decode($encodedPayload), true);
    if (!$payload || (isset($payload['exp']) && $payload['exp'] < time())) {
         http_response_code(401); echo json_encode(["error" => "Token Expired"]); exit;
    }
    return $payload;
}

// --- SIMPLE SMTP MAILER CLASS ---
class SMTPMailer {
    private $server;
    private $port;
    private $user;
    private $pass;
    private $debug = [];

    public function __construct($server, $port, $user, $pass) {
        $this->server = $server;
        $this->port = $port;
        $this->user = $user;
        $this->pass = $pass;
    }

    private function log($msg) { $this->debug[] = $msg; }
    public function getLogs() { return $this->debug; }

    public function send($to, $subject, $body, $fromName = 'Skyline Tours') {
        if (!$this->server) { $this->log("No SMTP server configured"); return false; }
        
        $socket = fsockopen($this->server, $this->port, $errno, $errstr, 10);
        if (!$socket) { $this->log("Socket fail: $errstr"); return false; }

        $this->read($socket); // banner

        if (!$this->cmd($socket, "EHLO " . $_SERVER['SERVER_NAME'])) return false;
        
        // STARTTLS if port is 587
        if ($this->port == 587) {
             if ($this->cmd($socket, "STARTTLS")) {
                 stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
                 if (!$this->cmd($socket, "EHLO " . $_SERVER['SERVER_NAME'])) return false;
             }
        }

        if ($this->user && $this->pass) {
            if (!$this->cmd($socket, "AUTH LOGIN")) return false;
            if (!$this->cmd($socket, base64_encode($this->user))) return false;
            if (!$this->cmd($socket, base64_encode($this->pass))) return false;
        }

        if (!$this->cmd($socket, "MAIL FROM: <" . $this->user . ">")) return false;
        if (!$this->cmd($socket, "RCPT TO: <" . $to . ">")) return false;
        if (!$this->cmd($socket, "DATA")) return false;

        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=utf-8\r\n";
        $headers .= "To: $to\r\n";
        $headers .= "From: $fromName <" . $this->user . ">\r\n";
        $headers .= "Subject: $subject\r\n";

        $message = $headers . "\r\n" . $body . "\r\n.\r\n";
        
        fwrite($socket, $message);
        $res = $this->read($socket);
        
        $this->cmd($socket, "QUIT");
        fclose($socket);

        if (substr($res, 0, 3) != '250') { 
            $this->log("Send Fail: $res"); return false; 
        }
        return true;
    }

    private function cmd($socket, $cmd) {
        fwrite($socket, $cmd . "\r\n");
        $res = $this->read($socket);
        $code = substr($res, 0, 3);
        // FIXED: Added '354' to valid codes (354 is returned by DATA command)
        $valid = in_array($code, ['220', '250', '235', '334', '354']);
        if (!$valid) $this->log("CMD Error: $cmd -> $res");
        return $valid;
    }

    private function read($socket) {
        $data = "";
        while ($str = fgets($socket, 515)) {
            $data .= $str;
            if (substr($str, 3, 1) == " ") break;
        }
        return $data;
    }
}

function send_booking_email($booking_data, $conn) {
    // Fetch Settings
    $res = $conn->query("SELECT setting_value FROM settings WHERE setting_key = 'site_config'");
    if (!($row = $res->fetch_assoc())) return false;
    
    $settings = json_decode($row['setting_value'], true);
    if (!$settings || empty($settings['smtp']['server'])) return false;
    
    $smtp = $settings['smtp'];
    $adminEmail = $settings['adminEmail'] ?? '';
    
    $mailer = new SMTPMailer($smtp['server'], $smtp['port'], $smtp['user'], $smtp['pass']);
    
    // Email to Admin
    if ($adminEmail) {
        $subject = "New Booking: " . ($booking_data['itemName'] ?? 'General Enquiry');
        $body = "<h2>New Booking Received</h2>";
        $body .= "<p><strong>Customer:</strong> {$booking_data['customerName']}</p>";
        $body .= "<p><strong>Email:</strong> {$booking_data['customerEmail']}</p>";
        $body .= "<p><strong>Phone:</strong> {$booking_data['customerPhone']}</p>";
        $body .= "<p><strong>Item:</strong> {$booking_data['itemName']}</p>";
        $body .= "<p><strong>Total:</strong> {$booking_data['totalPrice']}</p>";
        $body .= "<p><strong>Notes:</strong><br>" . nl2br($booking_data['notes']) . "</p>";
        
        $mailer->send($adminEmail, $subject, $body);
    }
    
    // Email to Customer (Optional Confirmation)
    if (!empty($booking_data['customerEmail'])) {
         $subConf = "Booking Received - Skyline Savannah Tours";
         $bodyConf = "Dear {$booking_data['customerName']},<br><br>Thank you for booking with us. We have received your request for <strong>{$booking_data['itemName']}</strong> and will get back to you shortly.<br><br>Best Regards,<br>Skyline Savannah Tours";
         $mailer->send($booking_data['customerEmail'], $subConf, $bodyConf);
    }
}

// 4. ROUTER
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

if (empty($action)) {
    echo json_encode(["status" => "online", "message" => "Skyline API Ready"]);
    exit;
}

try {
    // --- LOGIN ---
    if ($action === 'login' && $method === 'POST') {
        $input = getJsonInput();
        // Fallback: Check 'username' OR 'email' to be robust
        $user = $input['username'] ?? ($input['email'] ?? ''); 
        $pass = $input['password'] ?? '';
        
        // Ensure table exists (Self-Healing Schema)
        $conn->query("CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL
        )");

        $stmt = $conn->prepare("SELECT id, password_hash FROM admins WHERE username = ?");
        $stmt->bind_param("s", $user);
        $stmt->execute();
        $res = $stmt->get_result();
        
        if ($row = $res->fetch_assoc()) {
            if (password_verify($pass, $row['password_hash'])) {
                // Generate Token
                $payloadData = json_encode(['uid' => $row['id'], 'exp' => time() + 86400]);
                $base64Payload = base64_encode($payloadData);
                $signature = hash_hmac('sha256', $base64Payload, $jwt_secret);
                echo json_encode(["success" => true, "token" => "$base64Payload.$signature"]);
            } else {
                echo json_encode(["success" => false, "error" => "Invalid password"]);
            }
        } else {
            // Auto-create admin if missing (Self-healing Admin)
            if (strtolower($user) === 'admin' && $pass === 'admin123') {
                $hash = password_hash('admin123', PASSWORD_DEFAULT);
                $stmt = $conn->prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)");
                $adminName = 'admin';
                $stmt->bind_param("ss", $adminName, $hash);
                
                if ($stmt->execute()) {
                    $newId = $stmt->insert_id;
                    $payloadData = json_encode(['uid' => $newId, 'exp' => time() + 86400]);
                    $base64Payload = base64_encode($payloadData);
                    $signature = hash_hmac('sha256', $base64Payload, $jwt_secret);
                    echo json_encode(["success" => true, "token" => "$base64Payload.$signature"]);
                } else {
                     echo json_encode(["success" => false, "error" => "Failed to create admin: " . $stmt->error]);
                }
            } else {
                echo json_encode(["success" => false, "error" => "User not found"]);
            }
        }
        exit;
    }

    // --- PUBLIC DATA FETCH ---
    if ($action === 'get_all_data') {
        $data = [];
        $tables = ['packages', 'destinations', 'services', 'testimonials', 'faqs', 'posts'];
        
        foreach ($tables as $table) {
            $conn->query("CREATE TABLE IF NOT EXISTS $table (id VARCHAR(255) PRIMARY KEY)"); // Basic safety check
            $res = $conn->query("SELECT * FROM $table");
            $rows = [];
            if ($res) {
                while($r = $res->fetch_assoc()) {
                    foreach(['images','inclusions','exclusions','detailedItinerary','insight','tags'] as $j) {
                        if (isset($r[$j]) && $r[$j]) $r[$j] = json_decode($r[$j], true);
                    }
                    if(isset($r['price'])) $r['price'] = (float)$r['price'];
                    if(isset($r['rating'])) $r['rating'] = (float)$r['rating'];
                    if(isset($r['hidePrice'])) $r['hidePrice'] = (bool)$r['hidePrice'];
                    if(isset($r['isFeatured'])) $r['isFeatured'] = (bool)$r['isFeatured'];
                    $rows[] = $r;
                }
            }
            $data[$table] = $rows;
        }

        $sRes = $conn->query("SELECT setting_value FROM settings WHERE setting_key = 'site_config'");
        if ($sRes && $sRow = $sRes->fetch_assoc()) {
            $data['settings'] = json_decode($sRow['setting_value'], true);
        } else {
            $data['settings'] = null;
        }
        $data['cars'] = []; 

        echo json_encode($data);
        exit;
    }

    // --- PUBLIC ACTIONS ---
    if ($action === 'create_booking' && $method === 'POST') {
        $d = getJsonInput();
        $id = generateUuid();
        
        $name = $d['customerName'] ?? 'Guest';
        $email = $d['customerEmail'] ?? '';
        $phone = $d['customerPhone'] ?? '';
        $sType = $d['serviceType'] ?? 'General';
        $iName = $d['itemName'] ?? '';
        $tDate = $d['travelDate'] ?? '';
        $trav = intval($d['travelers'] ?? 1);
        $price = floatval($d['totalPrice'] ?? 0.0);
        $notes = $d['notes'] ?? ''; 

        $stmt = $conn->prepare("INSERT INTO bookings (id, customerName, customerEmail, customerPhone, serviceType, itemName, travelDate, travelers, totalPrice, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', ?)");
        $stmt->bind_param("sssssssids", $id, $name, $email, $phone, $sType, $iName, $tDate, $trav, $price, $notes);
        
        if ($stmt->execute()) {
            send_booking_email($d, $conn);
            echo json_encode(["success" => true, "id" => $id]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Booking failed: " . $stmt->error]);
        }
        exit;
    }

    if ($action === 'add_subscriber' && $method === 'POST') {
        $d = getJsonInput();
        $id = generateUuid();
        $stmt = $conn->prepare("INSERT IGNORE INTO subscribers (id, email) VALUES (?, ?)");
        $stmt->bind_param("ss", $id, $d['email']);
        $stmt->execute();
        echo json_encode(["success" => true]);
        exit;
    }

    if ($action === 'save_plan' && $method === 'POST') {
        $d = getJsonInput();
        $id = generateUuid();
        $req = json_encode($d['request']);
        $res = json_encode($d['response']);
        $stmt = $conn->prepare("INSERT INTO generated_plans (id, email, request, response) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $id, $d['email'], $req, $res);
        $stmt->execute();
        echo json_encode(["success" => true]);
        exit;
    }
    
    if ($action === 'check_ai_usage') {
        $email = $_GET['email'] ?? '';
        $stmt = $conn->prepare("SELECT COUNT(*) as c FROM generated_plans WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $res = $stmt->get_result()->fetch_assoc();
        echo json_encode(["allowed" => ($res['c'] < 2)]);
        exit;
    }

    // --- ADMIN ACTIONS (Protected) ---
    
    if (in_array($action, ['get_admin_data', 'crud', 'upload_file', 'update_settings', 'change_password', 'send_test_email'])) {
        checkAuth();
    }
    
    // NEW: Send Test Email Action
    if ($action === 'send_test_email' && $method === 'POST') {
        $d = getJsonInput();
        $targetEmail = $d['email'] ?? '';
        
        $res = $conn->query("SELECT setting_value FROM settings WHERE setting_key = 'site_config'");
        $settings = ($row = $res->fetch_assoc()) ? json_decode($row['setting_value'], true) : null;
        
        if (!$settings || empty($settings['smtp']['server'])) {
            echo json_encode(["success" => false, "error" => "SMTP settings not configured in database."]);
            exit;
        }
        
        $smtp = $settings['smtp'];
        $mailer = new SMTPMailer($smtp['server'], $smtp['port'], $smtp['user'], $smtp['pass']);
        
        if ($mailer->send($targetEmail, "Test Email from Skyline", "<h1>It Works!</h1><p>Your SMTP settings are configured correctly.</p>")) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => "Failed to send. Logs: " . implode(" | ", $mailer->getLogs())]);
        }
        exit;
    }

    if ($action === 'get_admin_data') {
        $bookings = $conn->query("SELECT * FROM bookings ORDER BY date DESC")->fetch_all(MYSQLI_ASSOC);
        $subscribers = $conn->query("SELECT * FROM subscribers ORDER BY created_at DESC")->fetch_all(MYSQLI_ASSOC);
        $plans = $conn->query("SELECT * FROM generated_plans ORDER BY created_at DESC")->fetch_all(MYSQLI_ASSOC);
        
        foreach($plans as &$p) { $p['request'] = json_decode($p['request'], true); $p['response'] = json_decode($p['response'], true); }
        
        echo json_encode(['bookings' => $bookings, 'subscribers' => $subscribers, 'generated_plans' => $plans]);
        exit;
    }

    if ($action === 'upload_file' && $method === 'POST') {
        if (!isset($_FILES['file'])) { http_response_code(400); echo json_encode(["error" => "No file"]); exit; }
        $file = $_FILES['file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $name = uniqid('img_') . '.' . $ext;
        if (!is_dir('uploads')) mkdir('uploads', 0755, true);
        move_uploaded_file($file['tmp_name'], "uploads/$name");
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
        echo json_encode(["url" => "$protocol://{$_SERVER['HTTP_HOST']}/uploads/$name"]);
        exit;
    }

    if ($action === 'update_settings' && $method === 'POST') {
        $d = getJsonInput();
        $json = json_encode($d);
        $stmt = $conn->prepare("INSERT INTO settings (setting_key, setting_value) VALUES ('site_config', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
        $stmt->bind_param("s", $json);
        $stmt->execute();
        echo json_encode(["success" => true]);
        exit;
    }

    if ($action === 'change_password' && $method === 'POST') {
        $d = getJsonInput();
        $newPass = password_hash($d['password'], PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE admins SET password_hash = ? WHERE username = 'admin'");
        $stmt->bind_param("s", $newPass);
        $stmt->execute();
        echo json_encode(["success" => true]);
        exit;
    }

    if ($action === 'crud' && $method === 'POST') {
        $d = getJsonInput();
        $table = $d['table'];
        $op = $d['op']; 
        $data = $d['data'] ?? [];
        $id = $d['id'] ?? ($data['id'] ?? generateUuid());

        $allowed = ['packages', 'destinations', 'services', 'testimonials', 'faqs', 'posts', 'bookings', 'subscribers'];
        if (!in_array($table, $allowed)) { http_response_code(400); echo json_encode(["error" => "Invalid table"]); exit; }

        if ($op === 'delete') {
            $stmt = $conn->prepare("DELETE FROM $table WHERE id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();
        } elseif ($op === 'create') {
            $data['id'] = $id;
            $cols = implode(", ", array_keys($data));
            $placeholders = implode(", ", array_fill(0, count($data), "?"));
            $types = str_repeat("s", count($data)); 
            $values = [];
            foreach($data as $k => $v) {
                if (is_array($v) || is_object($v)) { $v = json_encode($v); }
                if (is_bool($v)) { $v = $v ? 1 : 0; }
                $values[] = $v;
            }
            $stmt = $conn->prepare("INSERT INTO $table ($cols) VALUES ($placeholders)");
            $stmt->bind_param($types, ...$values);
            $stmt->execute();
        } elseif ($op === 'update') {
            $sets = [];
            $values = [];
            $types = "";
            foreach($data as $k => $v) {
                if ($k === 'id' || $k === 'created_at') continue;
                if (is_array($v) || is_object($v)) { $v = json_encode($v); }
                if (is_bool($v)) { $v = $v ? 1 : 0; }
                $sets[] = "$k = ?";
                $values[] = $v;
                $types .= "s";
            }
            $values[] = $data['id']; 
            $types .= "s";
            $sql = "UPDATE $table SET " . implode(", ", $sets) . " WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$values);
            $stmt->execute();
        }
        echo json_encode(["success" => true, "id" => $id]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>