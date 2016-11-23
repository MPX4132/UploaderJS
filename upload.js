/*
uploader([dropHandler [, preprocessor [, proprocessor]]]) 
	- dropHandler: A function called upon dropping a file on the droppable area.
		> dropHandler([file [, fields [, $upldSection [, $upldRoot]]]]) : Returns nothing.
			- file: The file that was dropped on the droppable area.
			- fields: Set of UI elements marked with data-upld-field="identifier", creating a key-value pair
				which will be sent to the server, where "identifier" is the key, and element.val() is the value.
			- $upldSection: A jQuery object holding the clone of the template for that specific file.
			- $upldRoot: A jQuery object to which section elements are appended to.
			
	- preprocessor: A function called BEFORE sending the file and the operation begins.
		> preprocessor([formData [, fields [, $upldSection ]]]) : Returns whether or not to reject a file.
			- formData: The data to be sent, includes the key value pair to be sent
				-> Key - File name (from textbox or file's original if none specified)
				-> Value - File itself (includes original file name)
			- fields: Set of UI elements marked with data-upld-field="identifier", creating a key-value pair
				which will be sent to the server, where "identifier" is the key, and element.val() is the value.
			- $upldSection: A jQuery object holding the clone of the template for that specific file.
			
	- proprocessor: A function called AFTER sending the file and the operation completed.
		> proprocessor([success [, formData [, fields [, $upldSection ]]]]) : Returns whether or not to reject a file.
			- success: A boolean value denoting whether or not the upload operation failed, relies on a json object
				containing success as the reply from the server, everything else is considered failure.
			- formData: The data to be sent, includes the key value pair to be sent
				-> Key - File name (from textbox or file's original if none specified)
				-> Value - File itself (includes original file name)
			- fields: Set of UI elements marked with data-upld-field="identifier", creating a key-value pair
				which will be sent to the server, where "identifier" is the key, and element.val() is the value.
			- $upldSection: A jQuery object holding the clone of the template for that specific file.
*/
jQuery.fn.uploader = function(dropHandler, preprocessor, proprocessor) {
	var $upldRoot = $(this).find("[data-upld-section-root]");
	var $upldBody = $upldRoot.find("[data-upld-section-body]");
	var $upldSubmit = $upldRoot.find("[data-upld-section-submit]");
	var $upldSubmitButton = $upldSubmit.find("[data-upld-submit]");
	var $upldSectionTemplate = $upldBody.find("template");
	
	var UploadURL = $(this).attr("data-upld-url") || "upload.php";
	var FileIdentifier = $(this).attr("data-upld-file") || "file";
	
	$upldRoot.bind("update", function(event) {
		// Assume everything was sent, so we'll disable the upload button.
		$upldSubmitButton.attr("disabled", true);
		
		// Remove disabled if we've got files ready.
		$upldBody.children().each(function(i, upldSection) {
			if ($(upldSection).data("file")) {
				$upldSubmitButton.removeAttr("disabled");
				return false;
			}
		});
		
		$upldRoot[($upldBody.find("tr").length - 1)? "fadeIn" : "fadeOut"]();
	});

	$upldSubmitButton.click(function(event) {
		$upldBody.children().each(function(i, upldSection) {
			var $upldSection = $(upldSection); // Wrap in jQuery to prep for operations.
			var upldSectionFile = $upldSection.data("file");

			if (!upldSectionFile) return; // If no file, skip.
			
			var UI = $upldSection.data("UI");
			var formData = new FormData();
			
			formData.append(FileIdentifier, upldSectionFile);
			
			$(UI.fields).each(function(i, field) {
				for (identifier in field) formData.append(identifier, $(field[identifier]).val());
			});

			if (!preprocessor || preprocessor(formData, UI.fields, $upldSection)) {
				$.post({
					url: UploadURL,
					data: formData,
					cache: false, // Cache response? For JSON default is false
					processData: false,
	                contentType: false,
					success: function(data, status, jqHXR) {
						var success = data instanceof Object && "success" in data;
						UI.reflectSuccess(success);
						if (success) $upldSection.data("file", null); // Clear file upon success.
						if (proprocessor) proprocessor(success, formData, UI.fields, $upldSection);
					},
					error: function(jqHXR, status, error) {
	 					console.log("Failure (" + status + "): " + jqHXR.responseText);
	 					UI.reflectSuccess(false);
	 					if (proprocessor) proprocessor(false, formData, UI.fields, $upldSection);
					},
					complete: function(jqHXR, status) {$upldRoot.trigger("update");}
				});
			} else {
				UI.reflectSuccess(false);
				if (proprocessor) proprocessor(false, formData, UI.fields, $upldSection);
			}
		});
	});
	
	$upldRoot.hide();

	$(this).on("dragover", false); // Stop propagation

	$(this).on("drop", function(event) {
		if(!event.originalEvent.dataTransfer.files.length) return;
		
		// For all files received, make a new group by using the template.
        $(event.originalEvent.dataTransfer.files).each(function(i, file) {
	        // Create clone, hide it and populate its file property to the current file.
			var $upldSection = $($upldSectionTemplate.html()).hide().data("file", file);
			
			$upldSection.data("UI", {
				$buttonRemove: $upldSection.find("button[data-upld-dismiss]"),
				fields: {}, // Custom fields will be stored here.
				reflectSuccess: function(success) {
					this.$buttonRemove.removeClass("btn-warning").addClass(success? "btn-info" : "btn-warning");
				}
			});
			
			// Populate custom fields (with the data-upld-field) attribute.
			// The attributes will be iterated over and sent with the file.
			$upldSection.find("[data-upld-field]").each(function(i, field) {
				var identifier = $(field).attr("data-upld-field") || i;
				$upldSection.data("UI").fields[identifier] = field;
			})
			
			$upldSection.data("UI").$buttonRemove.click(function(event) {
				$upldSection.remove();
				$upldRoot.trigger("update");
			});
			
            $upldBody.prepend($upldSection);
            
            if (dropHandler) dropHandler(file, $upldSection.data("UI").fields, $upldSection, $upldRoot);
            
            $upldSection.fadeIn();
        });
        
        $upldRoot.trigger("update");
        
        return false; // Stop propagation
	});
	
	return $(this);
}

$(function() {
	$(".uploader").uploader(function(file, fields, $upldSection, $upldRoot) {
		$(fields["name_of_file"]).val(file.name);
	}, null, function(success, formData, fields, $upldSection) {
		$upldSection.find("div.input-group").removeClass("has-success has-warning").addClass(success? "has-success" : "has-warning");
	});
});
