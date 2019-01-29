const sendMail = function(form, phpPath) {
    var form_data = $(form).serialize();
    $.ajax({
        type: "POST", 
        url: phpPath,
        data: form_data,
        success: function() {
           document.location.href = ("thanks.html");
        }
    });
};
export {sendMail};