<cfparam name="form.foo" default="">
<cfparam name="form.bar" default="">

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

<cfdump var="#form#" label="form scope">

<form action="formsubmission.cfm" method="post" style="margin-top:20px">
<select name="foo" multiple="multiple" size="5">
<option value="option1"<cfif listcontains(form.foo, "option1")> selected="selected"</cfif>>Option 1</option>
<option value="option2"<cfif listcontains(form.foo, "option2")> selected="selected"</cfif>>Option 2</option>
<option value="option3"<cfif listcontains(form.foo, "option3")> selected="selected"</cfif>>Option 3</option>
<option value="option4"<cfif listcontains(form.foo, "option4")> selected="selected"</cfif>>Option 4</option>
</select>

<select name="bar" multiple="multiple" size="5">
<option value="option1"<cfif listcontains(form.bar, "option1")> selected="selected"</cfif>>Option 1</option>
<option value="option2"<cfif listcontains(form.bar, "option2")> selected="selected"</cfif>>Option 2</option>
<option value="option3"<cfif listcontains(form.bar, "option3")> selected="selected"</cfif>>Option 3</option>
<option value="option4"<cfif listcontains(form.bar, "option4")> selected="selected"</cfif>>Option 4</option>
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
