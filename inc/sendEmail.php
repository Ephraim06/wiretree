<?php

// Replace this with your own email address
$siteOwnersEmail = 'esamanyayi95@gmail.com';

$response = ''; // Initialize response variable

if ($_POST) {

    $name = trim(stripslashes($_POST['contactName']));
    $email = trim(stripslashes($_POST['contactEmail']));
    $subject = trim(stripslashes($_POST['contactSubject']));
    $contact_message = trim(stripslashes($_POST['contactMessage']));

    // Check Name
    if (strlen($name) < 2) {
        $response = "Please enter your name.";
    }
    // Check Email
    elseif (!preg_match('/^[a-z0-9&\'\.\-_\+]+@[a-z0-9\-]+\.([a-z0-9\-]+\.)*+[a-z]{2}/is', $email)) {
        $response = "Please enter a valid email address.";
    }
    // Check Message
    elseif (strlen($contact_message) < 15) {
        $response = "Please enter your message. It should have at least 15 characters.";
    }
    // Subject
    else {
        if ($subject == '') { $subject = "Contact Form Submission"; }

        // Set Message
        $message = "";
        $message .= "Email from: " . $name . "<br />";
        $message .= "Email address: " . $email . "<br />";
        $message .= "Message: <br />";
        $message .= $contact_message;
        $message .= "<br /> ----- <br /> This email was sent from your site's contact form. <br />";

        // Set From: header
        $from =  $name . " <" . $email . ">";

        // Email Headers
        $headers = "From: " . $from . "\r\n";
        $headers .= "Reply-To: ". $email . "\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";

        ini_set("sendmail_from", $siteOwnersEmail); // for windows server
        $mail = mail($siteOwnersEmail, $subject, $message, $headers);

        if ($mail) {
            $response = 'OK'; // Success response
        } else {
            $response = 'Something went wrong. Please try again.'; // Failure response
        }
    }

    echo $response; // Send response back to JavaScript
}

?>
