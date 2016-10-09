<?php	
	if (isset($_POST["name"]) && $_POST["name"] == "badname")
		throw new Exception("Whoa whoa whoa, the hell is that!?"); // Throws Error 500
		
	foreach ($_FILES as $filename => $file) {
		echo "File \"" . $filename . "\":\n";
		print_r($file);
		move_uploaded_file($file["tmp_name"], "./uploads/" . $file["name"]);
	}
?>
