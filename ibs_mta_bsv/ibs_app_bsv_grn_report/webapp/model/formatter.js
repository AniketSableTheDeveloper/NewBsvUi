
sap.ui.define([], function () {
	"use strict";
return {

    formatDate: function (oDate) {
        if (oDate !== "" && oDate !== null && oDate !== undefined) {
            var DateInstance = new Date(oDate);
            var date = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "dd.MM.yyyy"
            });

            return date.format(DateInstance);
        }
        return "NA";
    },
    getDataNullValue: function (sValue,sType) {
        if ((sValue === null || sValue === '' || sValue === undefined) && sType !== "EMAIL_CHECK") {
            return "NA";
        }
         else {
            return sValue;
        }
    },
    formatterAmount: function (num) {
        if(num === null || num === "" || num === undefined || isNaN(num)){
            return "NA";
        }
        else{
            var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
                pattern: "#,##,##0.00"
            });
            return oNumberFormat.format(num);
        }
    },
    formatFile:function(value){
        if(value)
        {
            return true;
        }
        else{
            return false;
        }
    }

    }}
)