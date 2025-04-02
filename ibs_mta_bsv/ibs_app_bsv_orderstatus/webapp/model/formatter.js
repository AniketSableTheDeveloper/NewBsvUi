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
		else if(sValue === 3)
			{
				return "Warning"
			}
		else if(sValue === 4)
			{
				return "Error"
			}
		},

		removeLeadingZeros: function (inputNumber) {
            
			if (/^0\d+$/.test(inputNumber)) {
				return inputNumber.replace(/^0+/, '');
			}
			return inputNumber;
		},

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
		

		// formatDate: function (oDate) {
		// 	if (oDate !== "" && oDate !== null && oDate !== undefined) {
		// 		// if (oDate.split() === undefined) {
		// 			var DateInstance = new Date(oDate.split("Z")[0]);
		// 			// DateInstance.setHours(-5, -30, 0, 0);
		// 			var date = sap.ui.core.format.DateFormat.getDateInstance({
		// 				pattern: "dd/MM/yyyy"
		// 			});
	 
		// 			return date.format(DateInstance);
	 
		// 	}
		// 	return "NA";
		// },
		formatDate1: function (oDate) {
			if (oDate !== "" && oDate !== null && oDate !== undefined) {
				var DateInstance = new Date(oDate);
				var date = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd.MM.yyyy"
				});
	
				return date.format(DateInstance);
			}
			return "NA";
		},

		// 19-10-2024
		formatterAmount: function (num) {
			// debugger
			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				groupingEnabled: true,
				groupingSeparator: ",",
				decimalSeparator: ".",
				maxFractionDigits: 2,
				minFractionDigits: 2,
				pattern: "#,##,##0.00" // Indian numbering pattern
			});
			return oNumberFormat.format(num);
		},
		
	   
	
	
		// formatterAmount: function (num) {
			
        //     var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
        //         pattern: "#,##,##0.00"
        //     });
        //     return oNumberFormat.format(num);
		// 	// num = parseInt(num,10).toFixed(2);
		// 	// return String(num);

        // },



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
					return "ORDER WITH SCHEME"
				}
			else if(iValue === 3)
				{
					return "ORDER WITH SPECIAL RATE"
				}
	   },
	   laneIconFormat : function(sValue){
		if(sValue === "A"){
			return "sap-icon://pending"
		}else if(sValue === "O"){
			return "sap-icon://sales-order"
		}else if(sValue === "D"){
			return "sap-icon://shipping-status"
		}else if(sValue ==="I"){
			return "sap-icon://monitor-payments"
		}else if(sValue ==="E"){
			return "sap-icon://cart"
		}
	},
	laneTextFormat : function(sValue){
		if(sValue === "A"){
			return "Pending"
		}else if(sValue === "O"){
			return "Order"
		}else if(sValue === "D"){
			return "Delivery"
		}else if(sValue === "I"){
			return "Invoice"
		}
	},
	nodeStateFormat : function(sValue){
		if(sValue === "A"){
			return "Negative"
		}else if(sValue === "O"){
			return "Neutral"
		}else if(sValue === "D"){
			return "Neutral"
		}else if(sValue === "I"){
			return "Neutral"
		}
	},
	toInteger: function(quantity) {
		if (quantity && !isNaN(quantity)) {
			return parseInt(quantity, 10);
		}
		return ""; // Return an empty string if the value is empty or not a valid number
	}
	

	// toInteger: function(quantity) {
    //     return parseInt(quantity, 10);
    // }

	};
});