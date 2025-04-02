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

		formatDateNew: function (sDate) {
			var sResponse, date, reg, iTimeStamp;
		
			if (sDate !== undefined && sDate !== null && sDate !== "") {
				// Regular expression to match the /Date(xxxxxxx+xxxx)/ format
				reg = /\/Date\((\d+)([+-]\d{4})?\)\//;
		
				if (reg.test(sDate) === true) {
					// Extract the timestamp part
					iTimeStamp = parseInt(sDate.match(/\d+/)[0], 10);
		
					// Create a new Date object using the extracted timestamp
					date = new Date(iTimeStamp);
				} else {
					// If the input is not in /Date(xxxxxxx)/ format, try creating a Date object directly
					date = new Date(sDate);
				}
		
				// Convert the timestamp to a Date object using the desired pattern
				var oDateInstance = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd-MM-yyyy"
				});
		
				sResponse = oDateInstance.format(date);
			} else {
				sResponse = "NA";
			}
		
			return sResponse;
		},
		


		formatStateText: function (sValue) {
			debugger
			
		if (sValue === "Order Created With Scheme") {
			return "Information";
		} if(sValue === "Order Created With Special Rate"){
			return "Success";
		}if(sValue === "Order Created Without Scheme"){
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
				// if (oDate.split() === undefined) {
					var DateInstance = new Date(oDate.split("Z")[0]);
					// DateInstance.setHours(-5, -30, 0, 0);
					var date = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "dd/MM/yyyy"
					});
	 
					return date.format(DateInstance);
	 
			}
			return "NA";
		},
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

	};
});