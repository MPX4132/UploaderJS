# UploaderJS
Uploader is a jQuery plugin, occupying the jQuery.uploader namespace, and relies on the Twitter Bootstrap framework for styling puroposes. The plugin attempts to simplify having a file upload interface by having a minimally, non-intrusive, drag and drop interface.


NOTE: All other files in this directory are part of the demo.
NOTE: Your web server needs to have file uploads enabled for the demo to work!


Making a droppable area:

1. Create an area within the HTML document with a unique ID or class:

	<div class="uploader"></div>




2. Within the template, a header is inserted for instructions.

	<div class="uploader"><h1>[ Drop Files Here ]</h1></div>
	
	
	
	
3. The files dropped will be automatically inserted in a table, used for displaying,
and the table requires a cell with a button used to upload (or submit) the files.
The upload button requires a "button" tag and a class of "upld-submit".
	NOTE: The table only appears when files are being displayed.
	NOTE: The button is active only when files can be uploaded.
	NOTE: NOT ALL STYLING IS INCLUDED IN THE SNIPPET BELOW; THAT'S AT THE END.
	
	<div class="uploader">
		<table>
			<thead>
				<tr><th>File Name</th></tr>
			</thead>
			<tbody>
				<tr>
					<td>
						<button class="upld-submit">Upload Files</button>
					</td>
				</tr>
			</tbody>
		</table>
		<h1>[ Drop Files Here ]</h1>
	</div>




4. The drop zone's table requires new rows for every new file dropped.
For that reason we need to have a row template in the table body. The template will
be used to create a new row each time a new file is dropped in the drop zone.
These rows can have be controlled with buttons inside it, read the notes below.
The following classes are required, indicator "upld-indicator", button "upld-dismiss"
	NOTE: The template requires a text-type input, used to optionally rename files.
	NOTE: The template may include an indicator, and a remove file button.
		> The indicator shows what operation is being done next (using glyphicons).
		> The button removes the row it belongs to and effectively discards the file.
		
	NOTE: THE FOLLOWING INCLUDES ALL STRUCTURAL AND STYLING CLASSES.
		> This is the complete html boilerplate for a drop area.
		
	<div class="uploader">
		<table class="table table-responsive table-striped">
			<thead>
				<tr><th>File Name</th></tr>
			</thead>
			<tbody>
				<template>
					<tr>
						<td>
							<div class="input-group">
								<span class="input-group-addon">
									<span class="upld-indicator glyphicon glyphicon-chevron-up"></span>
								</span>
								<input type="text" class="upld-filename form-control" aria-label="file-control">
								<div class="input-group-btn">
									<button type="button" class="upld-dismiss btn btn-warning"><span class="glyphicon glyphicon-trash"></span></button>
								</div>
							</div>
						</td>
					</tr>
				</template>
				<tr>
					<td>
						<button class="upld-submit btn btn-success btn-block">
							<span class="glyphicon glyphicon-upload pull-left"></span> Upload Files <span class="glyphicon glyphicon-upload pull-right"></span>
						</button>
					</td>
				</tr>
			</tbody>
		</table>
		<h1>[ Drop Files Here ]</h1>
	</div>
	
	
	
	
	
5. The element must be selected with the class or ID given on step 1, when the document is ready to attach the scripts to the element.
	$(function() {
		$("div.uploader").uploader();
	});
	
6. [OPTIONAL] The content being uploaded can be intercepted, its attributes modified
and either accepted or rejected. The interface will change depending on whether the
file is accepted or rejected. The uploader will skip rejected files.
	
	$(function() {
		$(".uploader").uploader(function(formData, $filename, $row) {
			return $filename.val(); // Make sure we've got a filename (just a demo)!
		});
	});
	NOTE: The function given will only allow files that have modified names,
	not necessarily different names, but that have something in their input field.




SERVER SIDE: The server will receive the files with their custom name as the key 
to the file, while the file will have its original name! Each file is sent individually,
this is to prevent potential issues with simultaneous multi-file upload. All requests are
sent simultaneously, but independently, though.