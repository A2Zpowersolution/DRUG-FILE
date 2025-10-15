<?php
// Very basic mail sender that collects the text fields and attaches files that were previously uploaded.
// NOTE: For production use configure SMTP or use PHPMailer/SwiftMailer. This script uses PHP's mail() and may not work on all hosts.
// It expects 'uploaded_paths' array containing server-side relative paths like uploads/filename.pdf

header('Content-Type: application/json');

try {
  if($_SERVER['REQUEST_METHOD'] !== 'POST') throw new Exception('Invalid method');

  // collect fields
  $fields = [];
  foreach($_POST as $k=>$v){
    if($k === 'uploaded_paths') continue;
    if(strpos($k,'uploaded_paths') === 0) continue;
    $fields[$k] = is_array($v) ? implode(',', $v) : $v;
  }

  // gather uploaded paths from either direct keys or uploaded_paths[]
  $uploaded = [];
  if(isset($_POST['uploaded_paths']) && is_array($_POST['uploaded_paths'])){
    $uploaded = $_POST['uploaded_paths'];
  } else {
    // attempt to gather keys with prefix
    foreach($_POST as $k=>$v){
      if(strpos($k, 'uploaded_paths[') === 0){
        // format uploaded_paths[field]
        $uploaded[$k] = $v;
      }
    }
  }

  // build email body
  $adminEmail = 'admin@example.com'; // <-- replace with your admin email
  $subject = "New Retailer Licence Application";
  $body = "New application submitted:\n\n";
  foreach($fields as $k=>$v){
    $body .= "$k : $v\n";
  }

  // We'll attempt to send a simple email with links to uploaded files.
  // For attachments, a proper mail library is recommended.
  $body .= "\nUploaded files on server:\n";
  foreach($uploaded as $k=>$v){
    // $v may be like uploads/xxx
    $body .= "$k => $v\n";
  }

  // basic mail
  $headers = "From: no-reply@example.com\r\n";
  $headers .= "Reply-To: no-reply@example.com\r\n";
  $sent = mail($adminEmail, $subject, $body, $headers);

  if($sent){
    echo json_encode(['success'=>true]);
  } else {
    throw new Exception('mail() failed. Configure SMTP or use PHPMailer.');
  }

} catch(Exception $e){
  echo json_encode(['success'=>false, 'error'=>$e->getMessage()]);
}
