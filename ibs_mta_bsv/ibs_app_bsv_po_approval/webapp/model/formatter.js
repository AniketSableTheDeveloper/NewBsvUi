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

		formatStateText: function (sValue) {
			
		if (sValue === 3) {
			return "Success";
		} if(sValue === 1){
			return "Information";
		}if(sValue === 2){
			return "Error";
		}if(sValue === 5){
			return "Error";
		}
		},
		formatStatusCode: function (sValue) {
			
		if (sValue === "1") {
			return "Purchase Request Created";
		} 
		},
		formatStatusColor: function (sValue) {
			
		if (sValue === 1) {
			return "Information";
		} 
		else if(sValue === 2)
			{
				return "Success"
			}
		},

		removeLeadingZeros: function (inputNumber) {
            
			if (/^0\d+$/.test(inputNumber)) {
				return inputNumber.replace(/^0+/, '');
			}
			return inputNumber;
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
		
	   
	
	
		formatterAmount: function (num) {
			
            var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                pattern: "#,##,##0.00"
            });
            return oNumberFormat.format(num);
			// num = parseInt(num,10).toFixed(2);
			// return String(num);

        },



		document : function (sValue){
        
			if (sValue === "" || sValue === null || sValue === undefined) {
				return "NA";
			}
			else {
				return sValue;
			}
		},

		tableAmountt: function (num) {
			
            var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                pattern: "₹ #,##,##0.00"
            });
            return oNumberFormat.format(num);
			// num = parseInt(num,10).toFixed(2);
			// return String(num);

        },


		formadata: function (sValue) {
			
			if (sValue === "0002") {
			   return "Milestone Payments";
		   } 
	   },

	   ordertypeformat:function(iValue)
	   {
			if(iValue === 1)
				{
					return "SCHEME"
				}
			else if(iValue === 3)
				{
					return "SPECIAL RATE"
				}
	   }

	};
});