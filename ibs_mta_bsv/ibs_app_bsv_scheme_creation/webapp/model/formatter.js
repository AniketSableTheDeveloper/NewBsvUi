
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
    formatFile:function(value){
        // debugger
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