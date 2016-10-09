/*
uploader([ processor ]) 
	- processor: A function called before sending the file.
		> processor([formData [, $nameTextBox [, $row ]]]) : Returns whether or not to reject a file.
			- formData: The data to be sent, includes the key value pair to be sent
				-> Key - File name (from textbox or file's original if none specified)
				-> Value - File itself (includes original file name)
			- $nameTextBox: A jQuery object holding the input textbox element for the file.
			- $row: A jQuery object holding the entire row element for the file.
*/
jQuery.fn.uploader = function(processor) {
	$(this).each(function() {
		$(this).find("table").bind("update", function(event) {
			var $upldBody = $(this).find("tbody");
			var $upldSubmit = $upldBody.find("button.upld-submit").attr("disabled", true);
			
			$upldBody.children().each(function(i, row) {
				if ($(row).data("file")) {
					$upldSubmit.attr("disabled", false);
					return false;
				}
			});
			
			$(this)[($(this).find("tbody>tr").length - 1)? "fadeIn" : "fadeOut"]();
		});

		$(this).find("button.upld-submit").click(function(event) {
			$(this).closest("tbody").children().each(function(i, row) {
				if (!$(row).data("file")) return;
				
				var $upldTable = $(row).closest("table");
				var $upldInputGroup = $(row).find("div.input-group"); 
				var $upldIndicator = $upldInputGroup.find("span.upld-indicator");
				var $upldDismiss = $upldInputGroup.find("button.upld-dismiss");
				var $upldDismissIndicator = $upldInputGroup.find("button.upld-dismiss > span.glyphicon");
				var $upldFilename = $upldInputGroup.find("input.upld-filename");
				
				var file = $(row).data("file");
				var formData = new FormData();
				
				formData.append("name", $upldFilename.val() || file.name);
				formData.append("file", file);

				if (!processor || processor(formData, $upldFilename, $(row))) {
					$.post({
						url: "upload.php",
						data: formData,
						// cache: false, // Cache response? For JSON default is false
						processData: false,
		                contentType: false,
						success: function(data) {

		 					$upldIndicator.addClass();
		 					$upldDismiss.addClass();
		 					$upldDismissIndicator.addClass();
		 					
		 					$(row).data("file", null); // Clear the file
		 					console.log(data);
						},
						error: function(event) {
		 					console.log(event);
						},
						complete: function(xhr, result) {
							var success = result == "success";
							
							$upldInputGroup.removeClass("has-warning has-error");
							$upldIndicator.removeClass("glyphicon-chevron-up glyphicon-chevron-right glyphicon-repeat");
							$upldDismiss.removeClass("btn-danger btn-warning");
							$upldDismissIndicator.removeClass("glyphicon-trash");
							
							$upldFilename.attr("disabled", success);
		 					$upldInputGroup.addClass(success? "has-success" : "has-error");
		 					$upldIndicator.addClass(success? "glyphicon-ok" : "glyphicon-repeat");
		 					$upldDismiss.addClass(success? "btn-success" : "btn-danger");
		 					$upldDismissIndicator.addClass(success? "glyphicon-minus" : "glyphicon-trash");
							
							$upldTable.trigger("update");
						}
					});
				} else {
					$upldInputGroup.removeClass("has-error");
					$upldIndicator.removeClass("glyphicon-chevron-up glyphicon-repeat");
					$upldDismiss.removeClass("btn-danger");
					
					$upldIndicator.addClass("glyphicon-chevron-right");
					$upldInputGroup.addClass("has-warning");
 					$upldDismiss.addClass("btn-warning");
				}
			});
			return false; // Stop propagation
		});
		$(this).find("table").hide();
	});

	$(this).on("dragover", false); // Stop propagation

	$(this).on("drop", function(event) {
		if(!event.originalEvent.dataTransfer.files.length) return;

		var $upldFiles = $(event.originalEvent.dataTransfer.files);
		var $upldTable = $(this).find("table");
        var $upldBody = $upldTable.find("tbody");
        var $upldRowTemplate = $upldBody.find("template");
        var $upldSubmit = $upldBody.find("button.upld-submit");

        $upldFiles.each(function(i, file) {
			var $upldRow = $($upldRowTemplate.html());
			$upldRow.data("file", file);
			
			$upldRow.find("input.upld-filename").attr("placeholder", file.name);
			
			$upldRow.find("button.upld-dismiss").click(function(event) {
				$upldRow.remove();
				$upldTable.trigger("update");
			});
			
            $upldBody.prepend($upldRow);
            $upldRow.fadeIn();
        });
        
        $upldTable.trigger("update");
        
        return false; // Stop propagation
	});
	
	return $(this);
}

$(function() {
	$(".uploader").uploader(function(formData, $filename, $row) {
		return $filename.val(); // Make sure we've got a filename (just a demo)!
	});
});
