<?php
/* ================================================
   OLIGRA · Formulario de contacto
   ================================================
   CONFIGURACIÓN — completar con tus datos SMTP:
   ================================================ */

define('MAIL_TO',   'oligra@oligra.com.ar');   // Destinatario
define('MAIL_FROM', 'sitio@oligra.com.ar');    // Remitente (debe existir en tu servidor)
define('MAIL_NAME', 'Oligra Sudamericana');    // Nombre del remitente

/* ─────────────────────────────────────────────────
   Si tu servidor soporta mail() nativo (hosting
   compartido con cPanel / Plesk / Direwolf), las
   líneas de arriba son suficientes.

   Si necesitás SMTP externo (Gmail, SendGrid, etc.),
   instalá PHPMailer con Composer:
     composer require phpmailer/phpmailer
   y descomentá el bloque PHPMAILER al final.
   ───────────────────────────────────────────────── */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'msg' => 'Método no permitido.']);
    exit;
}

/* Sanitizar entradas */
$nombre   = htmlspecialchars(trim($_POST['nombre']   ?? ''), ENT_QUOTES, 'UTF-8');
$empresa  = htmlspecialchars(trim($_POST['empresa']  ?? ''), ENT_QUOTES, 'UTF-8');
$email    = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$telefono = htmlspecialchars(trim($_POST['telefono'] ?? ''), ENT_QUOTES, 'UTF-8');
$asunto   = htmlspecialchars(trim($_POST['asunto']   ?? 'Consulta'), ENT_QUOTES, 'UTF-8');
$mensaje  = htmlspecialchars(trim($_POST['mensaje']  ?? ''), ENT_QUOTES, 'UTF-8');

/* Validar campos requeridos */
if (!$nombre || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'msg' => 'Por favor completá nombre y correo válido.']);
    exit;
}

/* Armar cuerpo del mail */
$subject = "Consulta web [{$asunto}] — {$nombre}";
$body    = implode("\n", [
    "Nombre:   $nombre",
    "Empresa:  $empresa",
    "Email:    $email",
    "Teléfono: $telefono",
    "Asunto:   $asunto",
    "",
    "Mensaje:",
    $mensaje,
    "",
    "---",
    "Enviado desde el formulario de contacto de oligra.com.ar",
]);

$headers = implode("\r\n", [
    "From: " . MAIL_NAME . " <" . MAIL_FROM . ">",
    "Reply-To: $email",
    "Content-Type: text/plain; charset=UTF-8",
    "X-Mailer: PHP/" . PHP_VERSION,
]);

/* ── Enviar con mail() nativo ── */
if (mail(MAIL_TO, $subject, $body, $headers)) {
    echo json_encode(['ok' => true, 'msg' => 'Mensaje enviado correctamente.']);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'msg' => 'No se pudo enviar el mensaje. Intentá más tarde o escribinos directamente a oligra@oligra.com.ar']);
}

/* ════════════════════════════════════════════════
   ALTERNATIVA PHPMAILER (SMTP externo — Gmail, etc.)
   Descomentá y completá si el mail() nativo no funciona.
   ════════════════════════════════════════════════

require 'vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

$mail = new PHPMailer(true);
try {
    // Configuración SMTP
    $mail->isSMTP();
    $mail->Host       = 'smtp.tudominio.com';   // ← tu servidor SMTP
    $mail->SMTPAuth   = true;
    $mail->Username   = 'tu@email.com';          // ← usuario SMTP
    $mail->Password   = 'TU_CONTRASEÑA';         // ← contraseña SMTP
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom(MAIL_FROM, MAIL_NAME);
    $mail->addAddress(MAIL_TO);
    $mail->addReplyTo($email, $nombre);
    $mail->Subject = $subject;
    $mail->Body    = $body;

    $mail->send();
    echo json_encode(['ok' => true, 'msg' => 'Mensaje enviado correctamente.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'msg' => 'Error: ' . $mail->ErrorInfo]);
}

*/
