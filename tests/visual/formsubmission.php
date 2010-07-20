<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>jQuery MultiSelect Plugin Tests</title>
<link rel="stylesheet" type="text/css" href="../../jquery.multiselect.css" />
<link rel="stylesheet" type="text/css" href="style.css" />
<link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1/themes/redmond/jquery-ui.css" />
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.js"></script>
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1/jquery-ui.min.js"></script>
<script type="text/javascript" src="../../src/jquery.multiselect.js"></script>
</head>
<body>

<h1>Form Submission Test</h1>
<p>Testing to ensure the correct values are actually passed when the form is submitted.</p>

<pre>
<?php var_dump( $_POST['foo'], $_POST['bar'] ); ?>
</pre>

<form action="formsubmission.php" method="post" style="margin-top:20px">
<select name="foo[]" multiple="multiple" size="5">
<option value="option1">Option 1</option>
<option value="option2">Option 2</option>
<option value="option3">Option 3</option>
<option value="option4">Option 4</option>
</select>

<select name="bar[]" multiple="multiple" size="5">
<option value="option1">Option 1</option>
<option value="option2">Option 2</option>
<option value="option3">Option 3</option>
<option value="option4">Option 4</option>
</select>

<div><input type="submit" value="Submit" /></div>
</form>

<script type="text/javascript">
$("select").multiselect();

$("form").bind("submit", function(){
	alert( $(this).serialize() );
});
</script>

</body>
</html>
