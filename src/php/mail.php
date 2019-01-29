<?php
$fio= $_POST['name'];
$phone= $_POST['phone'];
$email= $_POST['email'];
$name = $_POST['formname'];

$emailTo = 'somerom71@gmail.com, sababikeb@zep-hyr.com'; 
$body = $name . "\n";

if($fio) {
    $body = $body . "\n\n Имя " . $fio;
}

if($phone) {
    $body = $body . "\n\n Телефон " . $phone;
}

if($email) {
    $body = $body . "\n\n Email " . $email;
}

$headers = "Content-Type: text/plain; charset=utf-8\r\n"."From:kolomeec-urist.ru \r\n" . 'Reply-To: ' . $emailTo;
mail($emailTo, $fio, $body, $headers);
?>