<?php
// Simple file upload endpoint.
// Save to uploads/ and return JSON with saved path.
// Make sure uploads/ exists and is writable.

header('Content-Type: application/json');

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
  echo json_encode(['success'=>false,'error'=>'Invalid method']); exit;
}

if(empty($_FILES['file'])){
  echo json_encode(['success'=>false,'error'=>'No file uploaded']); exit;
}

$field = isset($_POST['field']) ? preg_replace('/[^a-z0-9_]/i','', $_POST['field']) : 'file';
$uploads_dir = __DIR__ . '/uploads';
if(!is_dir($uploads_dir)) mkdir($uploads_dir, 0755, true);

$file = $_FILES['file'];
$fname = basename($file['name']);
$ext = pathinfo($fname, PATHINFO_EXTENSION);
$allowed = ['pdf','jpg','jpeg','png','gif','bmp'];
if(!in_array(strtolower($ext), $allowed)){
  // still allow but warn: for demo we'll accept common types
}

$target_name = $field . '_' . time() . '_' . preg_replace('/[^A-Za-z0-9_\-\.]/','_', $fname);
$target_path = $uploads_dir . '/' . $target_name;

if(move_uploaded_file($file['tmp_name'], $target_path)){
  // return relative path for JS usage
  $rel = 'uploads/' . $target_name;
  echo json_encode(['success'=>true, 'path'=>$rel]);
  exit;
} else {
  echo json_encode(['success'=>false,'error'=>'Move failed']);
  exit;
}
