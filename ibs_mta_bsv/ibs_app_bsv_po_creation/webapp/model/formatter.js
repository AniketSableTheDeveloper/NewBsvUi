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
		formatBackendDateToJSDate: function(backendDate) {
			debugger
			if (backendDate && backendDate.indexOf("/Date(") === 0) {
				const timestamp = parseInt(backendDate.match(/\d+/)[0], 10);
				return new Date(timestamp);
			}
			return null; // Return null if the backend date is invalid
		},
		 convertDate:function(dateString) {
			// Extract the timestamp using a regular expression
			const timestamp = parseInt(dateString.match(/\/Date\((\d+)\+\d+\)\//)[1], 10);
		
			// Create a Date object
			const date = new Date(timestamp);
		
			// Format the date to dd-mm-yyyy
			const dd = String(date.getDate()).padStart(2, '0');
			const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
			const yyyy = date.getFullYear();
		
			return `${dd}-${mm}-${yyyy}`;
		},
		formatDate: function (sDate) {
			debugger
			var sResponse, date, reg, iTimeStamp;
	
			if (sDate !== undefined && sDate !== null && sDate !== "") {
	
				reg = /Date/g;
	
				if(reg.test(sDate) === true){
					sDate = sDate.split('(')[1];
					iTimeStamp = parseInt(sDate.split(')')[0], 10);
	
					date = new Date();
	
					date.setTime(iTimeStamp);
	
				} else {
					date = new Date(sDate);
				}
				// Convert the timestamp to a Date object
				
				var oDateInstance = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd-MM-yyyy"
				});
	
				sResponse = oDateInstance.format(date);
			} else {
				sResponse = "NA";
			}
	
			return sResponse;
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
		ordertypeformat:function(iValue)
		{
			 if(iValue === "1")
				 {
					 return "ORDER WITH SCHEME"
				 }
			 else if(iValue === "3")
				 {
					 return "ORDER WITH SPECIAL RATE"
				 }
		},


		formadata: function (sValue) {
			
			if (sValue === "0002") {
			   return "Milestone Payments";
		   } 
	   },


	   formatRequestRate: function (sValue) {
			debugger
	if(sValue === "1")
			{
				return "0.00"
			}
		},


	};
});