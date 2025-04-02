sap.ui.define([], function () {
	"use strict";
	return {

		getNumber: function (sValue) {
		debugger
			var formattedValue = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 1,
				groupingEnabled: true,
				groupingSeparator: ",",
				decimalSeparator: "."
			}).format(sValue);
			return formattedValue
		},
	
		// To add it into Events
		formatDate: function (oDate) {
			if (oDate !== "" && oDate !== null && oDate !== undefined) {
				// Extract the timestamp from the string
				var timestampMatch = oDate.match(/\/Date\((\d+)\+\d+\)\//);
				if (timestampMatch) {
					var timestamp = parseInt(timestampMatch[1], 10);
					var dateInstance = new Date(timestamp);
		
					// Format the date and time
					var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
						pattern: "dd/MM/yyyy HH:mm:ss"
					});
		
					return dateFormat.format(dateInstance);
				}
			}
			return "NA";
		},

		formatDateTable: function (oDate) {
			if (oDate !== "" && oDate !== null && oDate !== undefined) {
				// Extract the timestamp from the string
				var timestampMatch = oDate.match(/\/Date\((\d+)\+\d+\)\//);
				if (timestampMatch) {
					var timestamp = parseInt(timestampMatch[1], 10);
					var dateInstance = new Date(timestamp);
		
					// Format the date only
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "dd/MM/yyyy"
					});
		
					return dateFormat.format(dateInstance);
				}
			}
			return "NA";
		},
		formatDate: function (date) {
		
            if (!date) {
                return ""; // Return empty if date is not defined
            }
            // Parse the backend date string to a JavaScript Date object
            let parsedDate = new Date(date);

            // Check if the parsed date is valid
            if (isNaN(parsedDate.getTime())) {
                return ""; // Return empty if the date is invalid
            }

            // Format the date to 'dd/MM/yyyy'
            let day = String(parsedDate.getDate()).padStart(2, '0');
            let month = String(parsedDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
            let year = parsedDate.getFullYear();

            return `${year}/${month}/${day}`;
        },
		formatINR: function (value) {
			
            if (value === undefined || value === null) {
                return "";
            }
            
            // Convert to float to handle decimal places correctly
            let number = parseFloat(Number(value)).toFixed(2);

            // Use toLocaleString to add commas as thousand separators
            return number.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },


		formatakDate:function(sValue)
		{
			debugger
			
		}

	
	};
});