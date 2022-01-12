$(document).ready(function() {
    $('.nav-link').click(function(e) {
 
       $('.nav-link.active').removeClass('active');
 
       var $parent = $(this).parent();
       $parent.addClass('active');
       //e.preventDefault();
    });
 });
window.setTimeout(function() {
    $(".alert").fadeTo(500, 0) 
}, 4000);



$(document).ready(function (){
    $('#welcomeModal').modal('show')
 });
