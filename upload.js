/*
uploader([ preprocessor ]) 
	- preprocessor: A function called before sending the file.
		> preprocessor([formData [, $nameTextBox [, $row ]]]) : Returns whether or not to reject a file.
			- formData: The data to be sent, includes the key value pair to be sent
				-> Key - File name (from textbox or file's original if none specified)
				-> Value - File itself (includes original file name)
			- $nameTextBox: A jQuery object holding the input textbox element for the file.
			- $row: A jQuery object holding the entire row element for the file.
*/
jQuery.fn.uploader = function(preprocessor, proprocessor) {
	var $upldTableRoot = $(this).find("table");
	var $upldTableBody = $upldTableRoot.find("tbody");
	var $upldTableSubmit = $upldTableBody.find("button[data-upld-submit]");
	
	$upldTableRoot.bind("update", function(event) {
		// Assume everything was sent, so we'll disable the upload button.
		$upldTableSubmit.attr("disabled", true);
		
		// Look for at least one that wasn't sent, in which case, we enable the upload button.
		$upldTableBody.children().each(function(i, row) {
			if ($(row).data("file")) { 
				$upldTableSubmit.attr("disabled", false);
				return false;
			}
		});
		
		$upldTableRoot[($upldTableBody.find("tr").length - 1)? "fadeIn" : "fadeOut"]();
	});

	$upldTableSubmit.click(function(event) {
		$upldTableBody.children().each(function(i, row) {
			if (!$(row).data("file")) return; // If no file, skip.
			
			var $upldTableRowIndicator = $(row).find("span[data-upld-indicator]");
			var $upldTableRowDismiss = $(row).find("button[data-upld-dismiss]");
			var $upldTableRowDismissIndicator = $upldTableRowDismiss.find("span.glyphicon");
			var $upldTableRowFilename = $(row).find("input[data-upld-filename]");
			
			var $upldTableRowGroup = $upldTableRowFilename.closest("div.input-group");
			
			var file = $(row).data("file");
			var formData = new FormData();
			
			formData.append("name", $upldTableRowFilename.val() || file.name);
			formData.append("file", file);

			if (!preprocessor || preprocessor(formData, $upldTableRowFilename, $upldTableRowGroup, $(row))) {
				$.post({
					url: "upload.php",
					data: formData,
					// cache: false, // Cache response? For JSON default is false
					processData: false,
	                contentType: false,
					success: function(data) {
	 					$(row).data("file", null); // Clear the file
	 					console.log(data);
					},
					error: function(event) {
	 					console.log(event);
					},
					complete: function(xhr, result) {
						var success = result == "success";
						$upldTableRowFilename.attr("disabled", success);
						
						$upldTableRowIndicator.removeClass("glyphicon-chevron-up glyphicon-repeat");
						$upldTableRowDismissIndicator.removeClass("glyphicon-trash");
						$upldTableRowDismiss.removeClass("btn-warning");
						
	 					$upldTableRowIndicator.addClass(success? "glyphicon-ok" : "glyphicon-repeat");
	 					$upldTableRowDismissIndicator.addClass(success? "glyphicon-minus" : "glyphicon-trash");
	 					$upldTableRowDismiss.addClass(success? "btn-info" : "btn-warning");
						
						if (proprocessor) proprocessor(success, formData, $upldTableRowFilename, $upldTableRowGroup, $(row));
						
						$upldTableRoot.trigger("update");
					}
				});
			} else {
				$upldTableRowIndicator.removeClass("glyphicon-chevron-up").addClass("glyphicon-repeat");
				proprocessor(false, formData, $upldTableRowFilename, $upldTableRowGroup, $(row))
			}
		});
		return false; // Stop propagation
	});
	
	$upldTableRoot.hide();

	$(this).on("dragover", false); // Stop propagation

	$(this).on("drop", function(event) {
		if(!event.originalEvent.dataTransfer.files.length) return;

		var $upldFiles = $(event.originalEvent.dataTransfer.files);
        var $upldTableRowTemplate = $upldTableBody.find("template");

        $upldFiles.each(function(i, file) {
			var $upldTableRow = $($upldTableRowTemplate.html()).hide();
			
			$upldTableRow.data("file", file);
			$upldTableRow.find("input[data-upld-filename]").attr("placeholder", file.name);
			
			$upldTableRow.find("button[data-upld-dismiss]").click(function(event) {
				$upldTableRow.remove();
				$upldTableRoot.trigger("update");
			});
			
            $upldTableBody.prepend($upldTableRow);
            $upldTableRow.fadeIn();
        });
        
        $upldTableRoot.trigger("update");
        
        return false; // Stop propagation
	});
	
	return $(this);
}

$(function() {
	$(".uploader").uploader(function(formData, $upldTableRowFilename, $upldTableRowGroup, $row) {
		return $upldTableRowFilename.val(); // Make sure we've got a filename (just a demo)!
	}, function(success, formData, $upldTableRowFilename, $upldTableRowGroup, $row) {
		$upldTableRowGroup.removeClass("has-success has-warning").addClass(success? "has-success" : "has-warning");
	});
});
